// @ts-nocheck
import { GLOBES_MAP, fetchGlobesSnapshot } from "./market/globes-provider";
import { buildAnalytics, peerComparison } from "./analytics";
import { buildFairValue } from "./fairValue";
import { buildScorecardV2 } from "./scorecardV2";
export interface Env {
  DB: D1Database;
  ALLOWED_ORIGINS?: string;
}
interface D1Database {
  prepare(sql: string): {
    bind(...v: unknown[]): {
      all<T>(): Promise<{ results: T[] }>;
      first<T>(): Promise<T | null>;
      run(): Promise<unknown>;
    };
  };
}
type Row = Record<string, any>;
const reply = (body: unknown, status = 200, origin = "*") =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
    },
  });
const allowed = (r: Request, e: Env) =>
  e.ALLOWED_ORIGINS?.split(",").includes(r.headers.get("origin") ?? "")
    ? r.headers.get("origin")!
    : "*";
const map = (r: Row) => ({
  ...r,
  fiscalQuarter: r.fiscal_quarter,
  periodType: r.period_type,
  periodEnd: r.period_end,
  flowBasis: r.flow_basis,
  sourceIds: JSON.parse(r.source_ids_json ?? "[]"),
  financials: r,
});
const periodKey = (r: Row) =>
  `${r.period_end}|${r.period_type}|${r.flow_basis ?? ""}`;
function unique(rows: Row[]) {
  const seen = new Set<string>();
  return rows.filter((r) => {
    const k = periodKey(r);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
async function financialRows(db: D1Database, id: string) {
  const r = await db
    .prepare(
      "SELECT p.*,s.* FROM financial_periods p LEFT JOIN financial_statements s ON s.period_id=p.id WHERE p.company_id=? ORDER BY p.period_end,p.period_type,p.id",
    )
    .bind(id)
    .all<Row>();
  return unique(r.results);
}
function field(value: number | null, reason: string) {
  return value == null
    ? { value: null, status: "UNAVAILABLE", reason }
    : { value, status: "AVAILABLE", reason: null };
}
function ttm(rows: Row[], companyId: string) {
  const annual = rows.find(
    (r) => r.period_type === "ANNUAL" && r.fiscal_year === 2025,
  );
  const current = rows.find(
    (r) =>
      r.fiscal_year === 2026 &&
      (r.flow_basis === "YTD" || r.flow_basis === "ANNUAL"),
  );
  const prior = rows.find(
    (r) => r.fiscal_year === 2025 && r.flow_basis === "YTD",
  );
  const compatible = !!annual && !!current && !!prior;
  const fields: Record<string, any> = {};
  for (const key of [
    "revenue",
    "operating_income",
    "ebitda_reported",
    "net_income",
    "cash_flow_from_operations",
    "capex",
  ]) {
    const value =
      compatible &&
      [annual[key], current[key], prior[key]].every(
        (v) => typeof v === "number",
      )
        ? annual[key] + current[key] - prior[key]
        : null;
    fields[key] = field(
      value,
      compatible ? "MISSING_INPUT" : "INCOMPATIBLE_PERIOD_BASIS",
    );
  }
  const fcf =
    compatible &&
    fields.cash_flow_from_operations.value != null &&
    fields.capex.value != null
      ? fields.cash_flow_from_operations.value - fields.capex.value
      : null;
  fields.fcf = field(
    fcf,
    compatible ? "MISSING_INPUT" : "INCOMPATIBLE_PERIOD_BASIS",
  );
  fields.adjustedFcf = field(
    null,
    companyId === "neto-malinda" ? "NOT_APPLICABLE" : "MISSING_INPUT",
  );
  return {
    companyId,
    available: Object.values(fields).some((x: any) => x.status === "AVAILABLE"),
    method: compatible ? "FY2025 + current YTD - prior comparable YTD" : null,
    sourcePeriods: {
      fy2025: annual?.id ?? null,
      currentYtd: current?.id ?? null,
      priorComparableYtd: prior?.id ?? null,
    },
    fields,
    reason: compatible
      ? null
      : "No compatible FY2025/current-YTD/prior-YTD period set",
  };
}
async function market(db: D1Database, id: string) {
  const m = await db
    .prepare(
      "SELECT * FROM market_snapshots WHERE company_id=? ORDER BY COALESCE(as_of,snapshot_date) DESC LIMIT 1",
    )
    .bind(id)
    .first<Row>();
  if (!m) return null;
  const f = await db
    .prepare(
      "SELECT s.net_income,s.operating_income,s.ebitda_reported,s.depreciation_and_amortization,s.cash_and_cash_equivalents,s.short_term_debt,s.long_term_debt,s.cash_flow_from_operations,s.capex,p.period_end FROM financial_periods p JOIN financial_statements s ON s.period_id=p.id WHERE p.company_id=? AND p.period_type='ANNUAL' ORDER BY p.period_end DESC LIMIT 1",
    )
    .bind(id)
    .first<Row>();
  const debt =
    f?.short_term_debt != null && f?.long_term_debt != null
      ? f.short_term_debt + f.long_term_debt
      : null;
  const nd =
    debt != null && f?.cash_and_cash_equivalents != null
      ? debt - f.cash_and_cash_equivalents
      : null;
  const ev = nd != null ? m.market_cap + nd : null;
  const pe = f && f.net_income > 0 ? m.market_cap / f.net_income : null;
  const evEbit =
    f && f.operating_income > 0 && ev != null ? ev / f.operating_income : null;
  const ebitda =
    f?.ebitda_reported ??
    (f?.operating_income != null && f?.depreciation_and_amortization != null
      ? f.operating_income + f.depreciation_and_amortization
      : null);
  const evEbitda =
    ebitda != null && ebitda > 0 && ev != null ? ev / ebitda : null;
  const fcf =
    f?.cash_flow_from_operations != null && f?.capex != null
      ? f.cash_flow_from_operations - f.capex
      : null;
  const priceToFcf = fcf != null && fcf > 0 ? m.market_cap / fcf : null;
  const fcfYield = fcf != null && m.market_cap > 0 ? fcf / m.market_cap : null;
  return {
    ...m,
    valuation: {
      basis: f
        ? {
            earnings: "LATEST_ANNUAL",
            ebitda: "LATEST_ANNUAL",
            ebit: "LATEST_ANNUAL",
            fcf: fcf != null ? "LATEST_ANNUAL" : "UNAVAILABLE",
            balanceSheet: f.period_end,
          }
        : null,
      periodEnd: f?.period_end ?? null,
      enterpriseValueIlsMillions: ev,
      pe,
      evEbit,
      evEbitda,
      priceToFcf,
      fcfYield,
      netDebtToMarketCap: nd != null ? nd / m.market_cap : null,
      netCashToMarketCap: nd != null && nd < 0 ? -nd / m.market_cap : null,
      unavailableReasons: [
        ...(nd == null ? ["MISSING_NET_DEBT_INPUTS"] : []),
        ...(fcf == null ? ["MISSING_FCF_INPUTS"] : []),
      ],
    },
  };
}
async function refresh(db: D1Database) {
  for (const id of Object.keys(GLOBES_MAP))
    try {
      const s = await fetchGlobesSnapshot(id);
      await db
        .prepare(
          `INSERT OR REPLACE INTO market_snapshots(id,company_id,provider,provider_instrument_id,security_id,exchange,currency,snapshot_date,as_of,fetched_at,share_price,previous_close,day_change,day_change_pct,market_cap,shares_outstanding,source_id,data_status,validation_status,raw_price,raw_price_unit,delay_minutes,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`,
        )
        .bind(
          `globes-${id}-${s.asOf}`,
          id,
          s.provider,
          s.providerInstrumentId,
          s.securityId,
          s.exchange,
          s.currency,
          s.asOf,
          s.asOf,
          s.fetchedAt,
          s.priceIls,
          s.previousCloseIls,
          s.dayChange,
          s.dayChangePct,
          s.marketCapIlsMillions,
          s.sharesOutstanding,
          s.sourceRef,
          "VERIFIED",
          "PASS",
          s.rawPrice,
          s.rawPriceUnit,
          s.delayMinutes,
        )
        .run();
    } catch (e) {
      console.error("Globes refresh failed", id, e);
    }
}
async function analytics(db: D1Database, id: string) {
  const rows = await financialRows(db, id);
  return buildAnalytics(rows);
}
async function fairValue(db: D1Database, id: string) {
  const rows = await financialRows(db, id);
  const snapshot = await db
    .prepare(
      "SELECT * FROM market_snapshots WHERE company_id=? ORDER BY COALESCE(as_of,snapshot_date) DESC LIMIT 1",
    )
    .bind(id)
    .first<Row>();
  return buildFairValue(
    id,
    rows,
    snapshot,
    ["shufersal", "rami-levy", "yochananof"].includes(id),
  );
}
async function scorecardV2(db: D1Database, id: string) {
  const rows = await financialRows(db, id);
  const snapshot = await db
    .prepare("SELECT * FROM market_snapshots WHERE company_id=? ORDER BY COALESCE(as_of,snapshot_date) DESC LIMIT 1")
    .bind(id)
    .first<Row>();
  const fairValue = buildFairValue(id, rows, snapshot, ["shufersal", "rami-levy", "yochananof"].includes(id));
  const businessClass: Record<string,string> = { sano: "CONSUMER_DEFENSIVE_BRANDED", shufersal: "FOOD_RETAIL", "rami-levy": "FOOD_RETAIL", yochananof: "FOOD_RETAIL", "neto-malinda": "FOOD_DISTRIBUTION" };
  return buildScorecardV2(rows, snapshot, fairValue.fv2, businessClass[id] ?? "FOOD_DISTRIBUTION", ["shufersal", "rami-levy", "yochananof"].includes(id));
}
async function peerData(db: D1Database, retailersOnly = false) {
  const ids = retailersOnly
    ? ["shufersal", "rami-levy", "yochananof"]
    : Object.keys(GLOBES_MAP);
  const items: any[] = [];
  for (const id of ids) {
    const a = await analytics(db, id);
    const m = await market(db, id);
    const latest = a.annual.at(-1);
    items.push({
      companyId: id,
      revenueGrowth: latest?.revenueGrowth.value ?? null,
      ebitMargin: latest?.ebitMargin.value ?? null,
      netMargin: latest?.netMargin.value ?? null,
      fcfMargin: latest?.fcfMargin.value ?? null,
      cashConversion: latest?.cashConversion.value ?? null,
      pe: m?.valuation.pe ?? null,
      evEbit: m?.valuation.evEbit ?? null,
      evEbitda: m?.valuation.evEbitda ?? null,
      priceToFcf: m?.valuation.priceToFcf ?? null,
      fcfYield: m?.valuation.fcfYield ?? null,
      netDebtToMarketCap: m?.valuation.netDebtToMarketCap ?? null,
    });
  }
  return {
    group: retailersOnly ? "RETAILERS" : "ALL",
    basis: "LATEST_ANNUAL",
    items: Object.fromEntries(
      [
        "revenueGrowth",
        "ebitMargin",
        "netMargin",
        "fcfMargin",
        "cashConversion",
        "pe",
        "evEbit",
        "evEbitda",
        "priceToFcf",
        "fcfYield",
        "netDebtToMarketCap",
      ].map((metric) => [metric, peerComparison(items, metric)]),
    ),
  };
}
export default {
  async fetch(req: Request, env: Env) {
    const origin = allowed(req, env);
    const u = new URL(req.url);
    const p = u.pathname.split("/").filter(Boolean);
    try {
      if (p.length === 2 && p[0] === "api" && p[1] === "health")
        return reply(
          { status: "ok", service: "israel-stocks-api" },
          200,
          origin,
        );
      if (p[0] !== "api")
        return reply({ error: { code: "NOT_FOUND" } }, 404, origin);
      if (p[1] === "peers" && p[2] === "retailers")
        return reply(await peerData(env.DB, true), 200, origin);
      if (p[1] === "peers")
        return reply(await peerData(env.DB, false), 200, origin);
      if (p[1] !== "companies")
        return reply({ error: { code: "NOT_FOUND" } }, 404, origin);
      const id = p[2];
      if (p[3] === "fair-value" && id) return reply(await fairValue(env.DB, id), 200, origin);
      if (p[3] === "scorecard-v2" && id) return reply(await scorecardV2(env.DB, id), 200, origin);
      if (!id)
        return reply(
          {
            companies: (
              await env.DB.prepare("SELECT * FROM companies WHERE is_active=1")
                .bind()
                .all()
            ).results,
          },
          200,
          origin,
        );
      if (p.length === 3)
        return reply(
          {
            company: await env.DB.prepare(
              "SELECT * FROM companies WHERE id=? AND is_active=1",
            )
              .bind(id)
              .first(),
          },
          200,
          origin,
        );
      if (p[3] === "analytics")
        return reply({ analytics: await analytics(env.DB, id) }, 200, origin);
      if (p[3] === "valuation" && p[4] === "history")
        return reply(
          {
            available: false,
            reason: "HISTORICAL_MARKET_UNAVAILABLE",
            rows: [],
            basis: "NO_POINT_IN_TIME_MARKET_DATA",
          },
          200,
          origin,
        );
      if (p[3] === "market" && p[4] === "latest")
        return reply({ market: await market(env.DB, id) }, 200, origin);
      if (p[3] === "sources")
        return reply(
          {
            sources: (
              await env.DB.prepare(
                "SELECT * FROM financial_sources WHERE company_id=?",
              )
                .bind(id)
                .all()
            ).results,
          },
          200,
          origin,
        );
      if (p[3] === "validation")
        return reply(
          {
            validation: (
              await env.DB.prepare(
                "SELECT * FROM validation_results WHERE company_id=?",
              )
                .bind(id)
                .all()
            ).results,
          },
          200,
          origin,
        );
      if (p[3] === "financials") {
        const rows = await financialRows(env.DB, id);
        if (p[4] === "latest") {
          const r =
            rows.filter((x) => x.period_type === "ANNUAL").at(-1) ??
            rows.at(-1);
          return reply({ financial: r ? map(r) : null }, 200, origin);
        }
        if (p[4] === "ttm") return reply({ ttm: ttm(rows, id) }, 200, origin);
        const filter = u.searchParams.get("periodType");
        if (filter && filter !== "ANNUAL" && filter !== "QUARTERLY")
          return reply(
            {
              error: {
                code: "INVALID_PERIOD_TYPE",
                message: "periodType must be ANNUAL or QUARTERLY",
              },
            },
            400,
            origin,
          );
        const filtered =
          filter === "ANNUAL"
            ? rows.filter((r) => r.period_type === "ANNUAL")
            : filter === "QUARTERLY"
              ? rows.filter((r) => r.period_type === "QUARTERLY")
              : rows;
        return reply({ financials: filtered.map(map) }, 200, origin);
      }
      return reply({ error: { code: "NOT_FOUND" } }, 404, origin);
    } catch (e) {
      return reply(
        {
          error: {
            code: "DATABASE_ERROR",
            message: e instanceof Error ? e.message : "Unknown error",
          },
        },
        500,
        origin,
      );
    }
  },
  async scheduled(e: ScheduledController, env: Env) {
    if (e.cron !== "0 6 * * *") await refresh(env.DB);
  },
};
interface ScheduledController {
  cron: string;
}
