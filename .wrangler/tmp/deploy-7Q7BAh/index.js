var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/src/discovery.ts
var htmlDecode = /* @__PURE__ */ __name((s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&nbsp;/g, " "), "htmlDecode");
function parseSanoReports(html) {
  const out = [];
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while (m = re.exec(html)) {
    const title = htmlDecode(m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
    if (!/(דוח|דו.?ח|report)/i.test(title)) continue;
    const href = m[1].startsWith("http") ? m[1] : new URL(m[1], "https://www.sano.co.il").href;
    const year = title.match(/20\d{2}/)?.[0] ?? null;
    const quarter = title.match(/(ראשון|שני|שלישי|רביעי|Q[1-4])/i)?.[0] ?? null;
    out.push({ id: `sano-discovered-${btoa(href).replace(/[^a-z0-9]/gi, "").slice(0, 32)}`, companyId: "sano", title, url: href, reportDate: null, periodEnd: year ? `${year}-${quarter ? "06" : "12"}-31` : null, sourceType: quarter ? "QUARTERLY_REPORT" : "ANNUAL_REPORT", discoveredAt: (/* @__PURE__ */ new Date()).toISOString(), status: "DISCOVERED" });
  }
  return [...new Map(out.map((x) => [x.url, x])).values()];
}
__name(parseSanoReports, "parseSanoReports");
async function discoverSano(fetcher) {
  const response2 = await fetcher("https://www.sano.co.il/company/%D7%93%D7%95%D7%97%D7%95%D7%AA-%D7%9B%D7%A1%D7%A4%D7%99%D7%99%D7%9D/");
  if (!response2.ok) throw new Error(`Sano IR returned ${response2.status}`);
  return parseSanoReports(await response2.text());
}
__name(discoverSano, "discoverSano");

// worker/src/index.ts
var response = /* @__PURE__ */ __name((body, status = 200, origin = "*") => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "access-control-allow-origin": origin, "access-control-allow-methods": "GET,OPTIONS" } }), "response");
var fail = /* @__PURE__ */ __name((code, message, status, o) => response({ error: { code, message } }, status, o), "fail");
var originFor = /* @__PURE__ */ __name((request, env) => {
  const o = request.headers.get("origin") ?? "";
  return env.ALLOWED_ORIGINS?.split(",").map((x) => x.trim()).includes(o) ? o : "*";
}, "originFor");
var mapPeriod = /* @__PURE__ */ __name((r) => ({ ...r, fiscalQuarter: r.fiscal_quarter, periodType: r.period_type, periodStart: r.period_start, periodEnd: r.period_end, reportDate: r.report_date, sourceIds: JSON.parse(String(r.source_ids_json)), audited: Boolean(r.audited), dataStatus: r.data_status, financials: r }), "mapPeriod");
async function freshness(db, id) {
  const latest = await db.prepare("SELECT p.*,s.title,s.url,s.publication_date,s.report_period_end FROM financial_periods p JOIN financial_sources s ON instr(p.source_ids_json,s.id)>0 WHERE p.company_id=? ORDER BY p.period_end DESC LIMIT 1").bind(id).first();
  const newest = await db.prepare("SELECT * FROM discovered_reports WHERE company_id=? ORDER BY COALESCE(period_end,report_date) DESC LIMIT 1").bind(id).first();
  return { companyId: id, latestPeriodEnd: latest?.period_end ?? null, latestReportTitle: latest?.title ?? null, latestReportPublicationDate: latest?.publication_date ?? null, latestSourceUrl: latest?.url ?? null, latestDataStatus: latest?.data_status ?? null, lastIngestedAt: latest?.updated_at ?? null, newestDiscoveredReportDate: newest?.period_end ?? newest?.report_date ?? null, newestDiscoveredReportTitle: newest?.title ?? null, newerReportAvailable: Boolean(newest && (!latest || String(newest.period_end ?? "") > String(latest.period_end ?? ""))) };
}
__name(freshness, "freshness");
var index_default = { async fetch(request, env) {
  const o = originFor(request, env);
  if (request.method === "OPTIONS") return response(null, 204, o);
  const u = new URL(request.url), parts = u.pathname.replace(/^\//, "").split("/");
  try {
    if (u.pathname === "/api/health") return response({ status: "ok", service: "israel-stocks-api" }, 200, o);
    if (parts[0] !== "api" || parts[1] !== "companies") return fail("NOT_FOUND", "Endpoint not found", 404, o);
    const id = parts[2];
    if (!id) {
      return response({ companies: (await env.DB.prepare("SELECT * FROM companies WHERE is_active=1 ORDER BY name_he").bind().all()).results }, 200, o);
    }
    const company = await env.DB.prepare("SELECT * FROM companies WHERE id=? AND is_active=1").bind(id).first();
    if (!company) return fail("COMPANY_NOT_FOUND", "Company not found", 404, o);
    if (parts.length === 3) return response({ company }, 200, o);
    if (parts[3] === "freshness") return response({ freshness: await freshness(env.DB, id) }, 200, o);
    if (parts[3] === "sources") return response({ sources: (await env.DB.prepare("SELECT * FROM financial_sources WHERE company_id=?").bind(id).all()).results }, 200, o);
    if (parts[3] === "validation") return response({ validation: (await env.DB.prepare("SELECT * FROM validation_results WHERE company_id=?").bind(id).all()).results }, 200, o);
    if (parts[3] === "market" && parts[4] === "latest") return response({ market: await env.DB.prepare("SELECT * FROM market_snapshots WHERE company_id=? ORDER BY snapshot_date DESC LIMIT 1").bind(id).first() }, 200, o);
    if (parts[3] === "financials") {
      const type = u.searchParams.get("periodType"), rows = type ? await env.DB.prepare("SELECT p.*,s.* FROM financial_periods p LEFT JOIN financial_statements s ON s.period_id=p.id WHERE p.company_id=? AND p.period_type=? ORDER BY p.period_end").bind(id, type).all() : await env.DB.prepare("SELECT p.*,s.* FROM financial_periods p LEFT JOIN financial_statements s ON s.period_id=p.id WHERE p.company_id=? ORDER BY p.period_end").bind(id).all();
      return response({ financials: rows.results.map((r) => mapPeriod(r)) }, 200, o);
    }
    return fail("NOT_FOUND", "Endpoint not found", 404, o);
  } catch (e) {
    console.error("route failure", e);
    return fail("DATABASE_ERROR", "Unable to load requested data", 500, o);
  }
}, async scheduled(_event, env) {
  try {
    const reports = await discoverSano(fetch);
    for (const r of reports) await env.DB.prepare("INSERT OR IGNORE INTO discovered_reports (id,company_id,title,url,report_date,period_end,discovered_at,status,source_type) VALUES (?,?,?,?,?,?,?,?,?)").bind(r.id, r.companyId, r.title, r.url, r.reportDate, r.periodEnd, r.discoveredAt, r.status, r.sourceType).run();
    console.log("Sano discovery complete", reports.length);
  } catch (e) {
    console.error("Sano discovery failed", e);
  }
} };
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
