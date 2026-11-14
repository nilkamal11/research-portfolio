# Education research & data portfolio

Education research and data portfolio for Nilkamal Shah. This expands the existing research-portfolio repository into a unified education portfolio, retaining the two doctoral studies, their original demo/code/PDF/data links, and both published student-borrowing papers.

Website: https://nilkamal11.github.io/research-portfolio/

Nine projects span research studies, K–12 analytics, higher-ed analytics, reusable data resources, and tools/prototypes. North Palos district finance and Illinois Grade 4 remain companions within the district explorer. The homepage features three projects; the full index supports search, category, maturity, and shareable filtered views. Each project has a complete static case page, readable without JavaScript.

## Build and preview

Requires existing Node.js 22+; no packages or installation are needed.

```powershell
node scripts/build.mjs
node scripts/validate.mjs
node --test tests/filters.test.mjs
node scripts/portable-preview.mjs
node scripts/preview.mjs
```

Open `http://127.0.0.1:8789/`. The server binds to loopback only. Stop it with Ctrl+C. You can also open `site/index.html` directly: all content is statically rendered, with no fetch calls, remote fonts, third-party runtime, or tracking requests. The self-contained `review/portfolio-private-review.html` embeds CSS, search behavior, and expandable case summaries for transfer or offline review.

## Add or update a project

1. Copy the object in `content/project-template.json` into the `projects` array in `content/projects.json`.
2. Choose a unique lowercase hyphenated `id`. It becomes `site/projects/<id>/index.html`, so preserve existing IDs when updating.
3. Select one or more existing categories exactly as written in the manifest. The first category appears on the card.
4. Write a short summary, audience, question, your contribution, sources/methods, result/deliverable, and meaningful limits. Describe prototypes as prototypes; do not infer adoption or impact.
5. Add verified HTTPS links and evidence URLs. Put the most useful demo or guide first. Link kinds are `demo`, `code`, `source`, and `download`.
6. Set `featured` to `false` for the normal index. `true` also adds a featured card, using the question as its visual for new projects. The established district feature and two study fact panels retain their reviewed design.
7. Run build, validation, and filter tests above. The tests assert the current nine-project release; update intentional count expectations when adding projects. Regenerate the portable preview after final changes.

To add or update a publication, edit the `publications` array in the same manifest; each record contains a title, URL, citation, summary, and contribution. To change global name/about/contact content, edit `profile` in the manifest. Never edit generated HTML for project copy: rebuilding replaces it. The layout is in `scripts/build.mjs` and `site/assets/portfolio.css`.

## Publication

The owner authorized GitHub publication on November 14, 2026. The existing GitHub Pages workflow deploys only `site/` on a push to `main`. Run the build and checks before a release. Public pages permit normal indexing; the standalone review copy retains `noindex,nofollow` as a review hint, which is not access control. The separate owner-private Sites preview keeps its existing audience.

Original assets remain in this repository to preserve the baseline; the new page references only `portfolio.css` and `portfolio.js`. The old visitor logging script is not loaded by the portfolio. The portable review bundle includes only the new site runtime, content, documentation, tests, and reports; it excludes Git metadata, unrelated working files, and application materials.

See `docs/INVENTORY.md`, `docs/REVIEW.md`, and `reports/` for source selection, verification, and outstanding visual QA.
