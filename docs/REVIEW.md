# Private review handoff

Publication update — November 14, 2026: the owner requested publication on the existing GitHub repository. The public build now permits normal indexing, while the standalone review copy retains its review metadata. The notes below record the original October 10 review and verification limits; source snapshots retain their original dates.

Implemented on local branch `portfolio/unified-private-draft` in the existing research-portfolio repository's isolated task-workspace clone. Neither the original checkout nor public hosting was changed. Nothing was pushed or deployed.

The draft uses a restrained cream/ink/teal editorial layout with featured cases, a full filterable index, static case pages, source/download routes, and verified professional contact routes. It does not load the previous homepage visitor logger. Existing individual study websites and their published methods, results, downloads, and briefs remain at their original URLs.

Validation completed:

- Build generates the homepage and nine case pages from one content manifest.
- Structural validation checks 10 pages, 9 unique project records, 139 local links/anchors, required fields, preserved study/publication links, and excluded content.
- Seven Node tests exercise all-work initialization, K–12 filtering, maturity groups, multi-term/hyphen search, combined URL filters, no-results/reset behavior, and invalid URL fallback. These are DOM-adapter behavior tests, not browser tests.
- JavaScript syntax checks pass.
- All 36 displayed HTTPS URLs were requested. 34 returned HTTP 200; DOI returned 403 and LinkedIn returned 999, which restrict automated access. The DOI is retained from the established publication; LinkedIn is retained from the verified professional profile. Email is a verified `mailto` route, not a sent-message test.
- Loopback HTTP smoke checks cover the homepage, 9 case pages, stylesheet, and script. See `reports/local-preview-check.json`.

Visual QA remains blocked: the supported computer-use runtime exited before a browser could open with `MXC launcher: cannot locate required Windows platform directory: HRESULT 0x80070003`. No desktop/mobile screenshots, real-browser interactions, or layout-fit claims are made. Responsive CSS includes 1000px/680px breakpoints, focus styles, a skip link, semantic controls, and reduced-motion support, but those need browser verification.

For cloud-browser QA, open `review/portfolio-private-review.html` as a single self-contained HTML artifact, or serve the bundle's `site/` directory. Check 1440px desktop, 768px tablet, and 390px/320px mobile widths; verify no horizontal overflow, readable statistical panels, category/maturity/search combinations, clear/reset, filter URLs, keyboard focus, case-page navigation, contact links, and no-JavaScript content. The single-file copy opens each case as an expandable section; the regular website uses separate case pages. External project links need a network connection.

The publication decision was resolved by the owner's November 14 request. Desktop/mobile browser QA remains unverified. Public guides are directories, snapshots retain their source dates, and Courseframe development remains paused.

The GitHub publication integrates the newer October 24 work: North Palos finance, its methods link and district-wide interpretation boundary, and the AIR Professional File coauthored paper. Existing `#k12`, `#higher-ed`, `#publications`, `#approach`, and `#studies` destinations remain valid.
