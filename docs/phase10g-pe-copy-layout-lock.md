# Phase 10G P/E Copy and Layout Lock

## Baseline

The Phase 10F peer explanation still used paraphrased glossary content and relied on RTL flow for the panel placement. The approved exact copy was not locked, and the desktop geometry did not explicitly guarantee explanation-left/data-right placement.

## Implementation plan

- Render the approved P/E headings and paragraphs exactly, with `{value}` dynamically sourced from the selected company’s peer P/E row.
- Use explicit CSS grid areas: `explanation` on the physical left and `data` on the physical right; stack on narrower screens.
- Preserve the `ערך המדד` table label, `×` formatting, all calculations, and backend behavior.

## Implementation milestone

Added a dedicated locked P/E panel with the exact approved headings/paragraphs and dynamic selected-company value. The peer section now uses explicit `grid-template-areas: "explanation data"` with physical LTR grid direction, placing explanation left and selector/table right on desktop; responsive layouts stack without horizontal overflow.

## Production closeout

Pages deployment `3ed52a33.israel-stocks.pages.dev` was built from source commit `5ef7703903dde0e916348fbb7c6341e54bebc293`. At a 1440px Chrome viewport, `.peer-explanation` had `x=55` and `.peer-data`/`.peer-table` had `x=496`, proving explanation is physically left of the data. Sano rendered the exact approved copy with dynamic `14.96×`; Shufersal rendered its own `13.29×`. Market Data and peer-selector help counts were both zero. Chrome CDP routes passed with zero console/runtime errors. Worker was not redeployed.
