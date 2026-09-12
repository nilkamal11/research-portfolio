export const colors = [
  "#087f8c",
  "#a46b19",
  "#8c4a73",
  "#355ca8",
  "#417b69",
  "#bd554f",
];
export const number = (value) =>
  value == null ? "Not available" : d3.format(",")(value);
export const percent = (v) =>
  v == null ? "Not available" : d3.format(".1f")(v) + "%";
export const money = (v) => (v == null ? "Not available" : d3.format("$,")(v));
export function element(id) {
  return document.getElementById(id);
}
export async function load(url) {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Data request failed (${response.status}).`);
  return response.json();
}
export function text(id, value) {
  element(id).textContent = value;
}
export function optionSelect(id, options, value, onchange) {
  const select = element(id);
  select.replaceChildren();
  for (const o of options) {
    const option = document.createElement("option");
    option.value = o.id;
    option.textContent = o.label;
    option.selected = String(o.id) === String(value);
    select.append(option);
  }
  select.onchange = (e) => onchange(e.target.value);
}
export function params(defaults) {
  const q = new URLSearchParams(location.search);
  return Object.fromEntries(
    Object.entries(defaults).map(([k, v]) => [k, q.has(k) ? q.get(k) : v]),
  );
}
export function updateUrl(state) {
  const q = new URLSearchParams();
  Object.entries(state).forEach(([k, v]) => {
    if (v !== null && v !== "") q.set(k, String(v));
  });
  history.replaceState(null, "", location.pathname + "?" + q + location.hash);
}
export function tabs(onchange) {
  const buttons = [...document.querySelectorAll("[data-panel]")];
  buttons[0]?.parentElement.setAttribute("role", "tablist");
  function activate() {
    const requested = location.hash.slice(1);
    const target =
      buttons.find((button) => button.dataset.panel === requested) ||
      buttons[0];
    buttons.forEach((button) => {
      const selected = button === target;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      element(button.dataset.panel).hidden = !selected;
    });
    onchange?.(target.dataset.panel);
  }
  buttons.forEach((button, index) => {
    button.setAttribute("role", "tab");
    button.id = "tab-" + button.dataset.panel;
    button.setAttribute("aria-controls", button.dataset.panel);
    const panel = element(button.dataset.panel);
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", button.id);
    button.onclick = () => {
      if (location.hash === "#" + button.dataset.panel) activate();
      else location.hash = button.dataset.panel;
    };
    button.onkeydown = (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? buttons.length - 1
            : (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) %
              buttons.length;
      buttons[next].focus();
      buttons[next].click();
    };
  });
  window.addEventListener("hashchange", activate);
  window.addEventListener("popstate", activate);
  activate();
}
export function legend(id, labels, palette = colors) {
  const box = element(id);
  box.replaceChildren();
  labels.forEach((label, i) => {
    const span = document.createElement("span");
    const swatch = document.createElement("i");
    swatch.className = "swatch";
    swatch.style.background = palette[i % palette.length];
    span.append(swatch, document.createTextNode(label));
    box.append(span);
  });
}
const tooltip = document.createElement("div");
tooltip.className = "tooltip";
tooltip.setAttribute("role", "tooltip");
document.body.append(tooltip);
export function showTip(event, value) {
  tooltip.textContent = value;
  tooltip.classList.add("visible");
  tooltip.style.left =
    Math.max(8, Math.min(event.clientX + 14, innerWidth - 330)) + "px";
  tooltip.style.top =
    Math.min(event.clientY + 16, innerHeight - tooltip.offsetHeight - 10) +
    "px";
}
export function hideTip() {
  tooltip.classList.remove("visible");
}
export function chart(id, height, title, minWidth = 0) {
  const box = element(id);
  box.replaceChildren();
  const measured = Math.floor(box.getBoundingClientRect().width);
  const w = Math.max(270, minWidth, measured);
  box.classList.toggle("chart-overflow", minWidth > measured);
  const s = d3
    .select(box)
    .append("svg")
    .attr("viewBox", `0 0 ${w} ${height}`)
    .attr("width", w)
    .attr("height", height)
    .attr("role", "img")
    .attr("aria-label", title);
  s.append("title").text(title);
  return { s, w, h: height };
}
export function shortLabel(label) {
  return label
    .replace("Biological and biomedical sciences", "Biological sciences")
    .replace("Computer and information sciences", "Computer science")
    .replace(
      "Agricultural sciences and natural resources",
      "Agricultural sciences",
    )
    .replace("Geosciences, atmospheric, and ocean sciences", "Geosciences")
    .replace(
      "Multidisciplinary/interdisciplinary sciences",
      "Interdisciplinary",
    )
    .replace(
      "Multidisciplinary/ interdisciplinary sciences",
      "Interdisciplinary",
    )
    .replace("Visual and performing arts", "Visual & performing arts")
    .replace("Other non-science and engineering", "Other fields")
    .replace("Mathematics and statistics", "Math & statistics");
}
function labelLines(selection, maxWidth) {
  selection.each(function () {
    const t = d3.select(this),
      words = t.text().split(/\s+/),
      x = t.attr("x"),
      y = +t.attr("y");
    t.text("");
    let line = [],
      lineNo = 0;
    let span = t.append("tspan").attr("x", x).attr("y", y);
    for (const word of words) {
      line.push(word);
      span.text(line.join(" "));
      if (span.node().getComputedTextLength() > maxWidth && line.length > 1) {
        line.pop();
        span.text(line.join(" "));
        line = [word];
        lineNo++;
        span = t
          .append("tspan")
          .attr("x", x)
          .attr("y", y + lineNo * 15)
          .text(word);
      }
    }
    if (lineNo) t.attr("transform", `translate(0,${-lineNo * 7.5})`);
  });
}
export function sankey(
  id,
  rows,
  categories,
  selected,
  onselect,
  { unit = "people", normalize = false } = {},
) {
  const h = Math.max(420, rows.length * 43 + 50),
    { s, w } = chart(
      id,
      h,
      `Fields and ${unit} distributions. Ribbon widths represent ${normalize ? "within-field percentages" : unit}.`,
      600,
    );
  const left = w < 500 ? 100 : 160,
    right = w < 500 ? 85 : 140;
  const nodes = [
    ...rows.map((r, i) => ({ id: "r" + i, label: r.label, row: r })),
    ...categories.map((c, j) => ({ id: "c" + j, label: c, categoryIndex: j })),
  ];
  const links = rows
    .flatMap((r, i) =>
      r.values.map((v, j) => ({
        source: "r" + i,
        target: "c" + j,
        value: normalize ? (v / r.total) * 100 : v,
        raw: v,
        row: r,
        categoryIndex: j,
      })),
    )
    .filter((l) => l.raw != null && l.value > 0);
  const graph = d3
    .sankey()
    .nodeId((d) => d.id)
    .nodeWidth(10)
    .nodePadding(22)
    .nodeSort(null)
    .extent([
      [left, 22],
      [w - right, h - 22],
    ])({ nodes, links });
  s.append("g")
    .selectAll("path")
    .data(graph.links)
    .join("path")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("fill", "none")
    .attr("stroke", (d) => colors[d.categoryIndex % colors.length])
    .attr("stroke-width", (d) => Math.max(1, d.width))
    .attr("stroke-opacity", (d) =>
      !selected || d.row.id === selected ? 0.72 : 0.16,
    )
    .style("cursor", "pointer")
    .on("pointermove", (e, d) =>
      showTip(
        e,
        `${d.row.label} · ${categories[d.categoryIndex]}: ${number(d.raw)} ${unit}; ${percent((d.raw / d.row.total) * 100)}`,
      ),
    )
    .on("pointerleave", hideTip)
    .on("click", (e, d) => onselect(d.row.id));
  const g = s.append("g").selectAll("g").data(graph.nodes).join("g");
  g.append("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", 10)
    .attr("height", (d) => Math.max(1, d.y1 - d.y0))
    .attr("fill", (d) =>
      d.row ? "#183040" : colors[d.categoryIndex % colors.length],
    );
  g.append("text")
    .attr("x", (d) => (d.row ? d.x0 - 9 : d.x1 + 9))
    .attr("y", (d) => (d.y0 + d.y1) / 2)
    .attr("text-anchor", (d) => (d.row ? "end" : "start"))
    .attr("dominant-baseline", "middle")
    .attr("font-weight", (d) => (d.row?.id === selected ? 700 : 400))
    .text((d) => shortLabel(d.label))
    .call((t) => labelLines(t, w < 500 ? 86 : 135));
  return s;
}
export function matrix(
  id,
  rows,
  categories,
  selected,
  onselect,
  { shares = true, unit = "%", palette = colors } = {},
) {
  const rowH = 44,
    top = 74,
    left = 160,
    h = top + rowH * rows.length + 30,
    { s, w } = chart(
      id,
      h,
      "Matrix with directly labeled values for every field and category.",
      620,
    );
  const margin = w < 500 ? 98 : left,
    cw = (w - margin - 6) / categories.length;
  const values = rows
      .flatMap((r) =>
        r.values.map((v) =>
          v == null ? null : shares ? (v / r.total) * 100 : v,
        ),
      )
      .filter((v) => v != null),
    max = d3.max(values) || 1;
  categories.forEach((c, j) =>
    s
      .append("text")
      .attr("x", margin + (j + 0.5) * cw)
      .attr("y", 35)
      .attr("text-anchor", "middle")
      .text(shortLabel(c))
      .call((t) => labelLines(t, cw - 6)),
  );
  rows.forEach((r, i) => {
    s.append("text")
      .attr("x", margin - 10)
      .attr("y", top + i * rowH + 24)
      .attr("text-anchor", "end")
      .attr("font-weight", r.id === selected ? 700 : 400)
      .text(shortLabel(r.label))
      .call((t) => labelLines(t, margin - 17));
    r.values.forEach((raw, j) => {
      const v = raw == null ? null : shares ? (raw / r.total) * 100 : raw;
      const g = s
        .append("g")
        .style("cursor", "pointer")
        .on("click", () => onselect(r.id))
        .on("pointermove", (e) =>
          showTip(
            e,
            `${r.label} · ${categories[j]}: ${v == null ? "Not available" : d3.format(".1f")(v) + unit}`,
          ),
        )
        .on("pointerleave", hideTip);
      g.append("rect")
        .attr("x", margin + j * cw + 2)
        .attr("y", top + i * rowH + 2)
        .attr("width", Math.max(5, cw - 4))
        .attr("height", rowH - 4)
        .attr("fill", v == null ? "#dce3e8" : palette[j % palette.length])
        .attr("fill-opacity", v == null ? 0.7 : 0.08 + (0.65 * v) / max);
      g.append("text")
        .attr("x", margin + (j + 0.5) * cw)
        .attr("y", top + i * rowH + 27)
        .attr("text-anchor", "middle")
        .text(v == null ? "—" : d3.format(".1f")(v) + unit);
    });
  });
  return s;
}
export function chord(
  id,
  rows,
  categories,
  selected,
  onselect,
  { unit = "estimated people", roundTo = 1 } = {},
) {
  const height = Math.max(560, rows.length * 43 + 60);
  const { s, w, h } = chart(
    id,
    height,
    "Directed chord diagram connecting doctoral fields to the selected categories.",
    700,
  );
  const count = rows.length + categories.length;
  const values = Array.from({ length: count }, () => Array(count).fill(0));
  rows.forEach((row, i) =>
    row.values.forEach((value, j) => (values[i][rows.length + j] = value ?? 0)),
  );
  const chords = d3.chordDirected().padAngle(0.025)(values);
  const radius = Math.min((w - 330) / 2, (h - 100) / 2);
  const group = s.append("g").attr("transform", `translate(${w / 2},${h / 2})`);
  group
    .selectAll("path.ribbon")
    .data(chords)
    .join("path")
    .attr("class", "ribbon")
    .attr(
      "d",
      d3
        .ribbonArrow()
        .radius(radius - 8)
        .padAngle(0.004),
    )
    .attr("fill", (d) => colors[(d.target.index - rows.length) % colors.length])
    .attr("fill-opacity", (d) =>
      !selected || rows[d.source.index].id === selected ? 0.78 : 0.12,
    )
    .style("cursor", "pointer")
    .on("pointermove", (event, d) =>
      showTip(
        event,
        `${rows[d.source.index].label} · ${categories[d.target.index - rows.length]}: ${number(Math.round(d.source.value / roundTo) * roundTo)} ${unit}`,
      ),
    )
    .on("pointerleave", hideTip)
    .on("click", (event, d) => onselect(rows[d.source.index].id));
  group
    .selectAll("path.arc")
    .data(chords.groups)
    .join("path")
    .attr("class", "arc")
    .attr(
      "d",
      d3
        .arc()
        .innerRadius(radius)
        .outerRadius(radius + 10),
    )
    .attr("fill", (d) =>
      d.index < rows.length
        ? "#183040"
        : colors[(d.index - rows.length) % colors.length],
    );
  const labels = chords.groups.map((d) => {
    const angle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
    return {
      ...d,
      x: Math.cos(angle) * (radius + 12),
      y: Math.sin(angle) * (radius + 12),
      label:
        d.index < rows.length
          ? rows[d.index].label
          : categories[d.index - rows.length],
    };
  });
  for (const side of [-1, 1]) {
    const items = labels
      .filter((d) => (d.x < 0 ? -1 : 1) === side)
      .sort((a, b) => a.y - b.y);
    const spread = Math.min(
      h / 2 - 38,
      Math.max(radius * 0.88, (items.length - 1) * 21),
    );
    items.forEach((item, i) => {
      const y =
        items.length === 1
          ? 0
          : -spread + (2 * spread * i) / (items.length - 1);
      const x = side * (radius + 26);
      group
        .append("path")
        .attr(
          "d",
          `M${item.x},${item.y}L${side * (radius + 19)},${y}L${x},${y}`,
        )
        .attr("stroke", "#aebbc4")
        .attr("stroke-width", 0.8)
        .attr("fill", "none");
      const label = group
        .append("text")
        .attr("x", x + side * 4)
        .attr("y", y)
        .attr("text-anchor", side < 0 ? "end" : "start")
        .attr("dominant-baseline", "middle")
        .attr(
          "font-weight",
          item.index < rows.length && rows[item.index].id === selected
            ? 700
            : 400,
        )
        .text(shortLabel(item.label));
      labelLines(label, 132);
    });
  }
  return s;
}
export function profile(
  id,
  title,
  total,
  labels,
  values,
  { unit = "Respondents", valuesArePercent = false } = {},
) {
  const box = element(id);
  box.replaceChildren();
  const h = document.createElement("h3");
  h.textContent = title;
  box.append(h);
  const label = document.createElement("div");
  label.className = "small";
  label.textContent = unit;
  const count = document.createElement("div");
  count.className = "selected-value";
  count.textContent = number(total);
  box.append(label, count);
  labels.forEach((label, i) => {
    const raw = values[i],
      v = raw == null ? null : valuesArePercent ? raw : (raw / total) * 100;
    const row = document.createElement("div");
    row.className = "profile-row";
    const line = document.createElement("div");
    line.className = "profile-label";
    const name = document.createElement("span");
    name.textContent = label;
    const value = document.createElement("span");
    value.textContent = percent(v);
    line.append(name, value);
    const track = document.createElement("div");
    track.className = "profile-track";
    const fill = document.createElement("div");
    fill.className = "profile-fill";
    fill.style.width = (v ?? 0) + "%";
    fill.style.background = colors[i % colors.length];
    track.append(fill);
    row.append(line, track);
    box.append(row);
  });
}
export function table(id, headers, rows) {
  const box = element(id);
  box.replaceChildren();
  const t = document.createElement("table");
  t.className = "data-table";
  const head = document.createElement("thead"),
    tr = document.createElement("tr");
  headers.forEach((label) => {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = label;
    tr.append(th);
  });
  head.append(tr);
  t.append(head);
  const body = document.createElement("tbody");
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value == null ? "Not available" : String(value);
      if (typeof value === "number") td.className = "numeric";
      tr.append(td);
    });
    body.append(tr);
  });
  t.append(body);
  box.append(t);
}
function exportFigure(chartId) {
  const svg = element(chartId).querySelector("svg");
  if (!svg) return;
  const copy = svg.cloneNode(true);
  const originals = [svg, ...svg.querySelectorAll("*")];
  const clones = [copy, ...copy.querySelectorAll("*")];
  originals.forEach((node, i) => {
    const style = getComputedStyle(node);
    for (const property of [
      "font-family",
      "font-size",
      "font-weight",
      "fill",
      "stroke",
      "stroke-width",
      "opacity",
      "fill-opacity",
      "stroke-opacity",
      "paint-order",
    ]) {
      clones[i].style.setProperty(property, style.getPropertyValue(property));
    }
  });
  const box = svg.viewBox.baseVal;
  const width = Math.max(720, box.width + 48);
  const namespace = "http://www.w3.org/2000/svg";
  const output = document.createElementNS(namespace, "svg");
  output.setAttribute("xmlns", namespace);
  output.setAttribute("width", width);
  const background = document.createElementNS(namespace, "rect");
  background.setAttribute("width", "100%");
  background.setAttribute("height", "100%");
  background.setAttribute("fill", "#fff");
  output.append(background);
  const measure = document.createElement("canvas").getContext("2d");
  let cursor = 28;
  function paragraph(value, size = 13, color = "#526775", weight = 400) {
    measure.font = `${weight} ${size}px Arial`;
    let line = [];
    const lines = [];
    for (const word of value.split(/\s+/)) {
      if (
        line.length &&
        measure.measureText([...line, word].join(" ")).width > width - 48
      ) {
        lines.push(line.join(" "));
        line = [];
      }
      line.push(word);
    }
    if (line.length) lines.push(line.join(" "));
    for (const value of lines) {
      const node = document.createElementNS(namespace, "text");
      node.setAttribute("x", 24);
      node.setAttribute("y", cursor);
      node.setAttribute("font-family", "Arial");
      node.setAttribute("font-size", size);
      node.setAttribute("font-weight", weight);
      node.setAttribute("fill", color);
      node.textContent = value;
      output.append(node);
      cursor += size * 1.45;
    }
    cursor += 7;
  }
  paragraph(element("figure-title").textContent, 22, "#183040", 700);
  paragraph(element("figure-subtitle").textContent, 14);
  paragraph(
    "Selected: " + element("profile").innerText.replace(/\s+/g, " "),
    12,
  );
  element("legend")
    .querySelectorAll("span")
    .forEach((item) => {
      const swatch = document.createElementNS(namespace, "rect");
      swatch.setAttribute("x", 24);
      swatch.setAttribute("y", cursor - 10);
      swatch.setAttribute("width", 10);
      swatch.setAttribute("height", 10);
      swatch.setAttribute(
        "fill",
        getComputedStyle(item.querySelector("i")).backgroundColor,
      );
      output.append(swatch);
      const node = document.createElementNS(namespace, "text");
      node.setAttribute("x", 42);
      node.setAttribute("y", cursor);
      node.setAttribute("font-family", "Arial");
      node.setAttribute("font-size", 12);
      node.setAttribute("fill", "#183040");
      node.textContent = item.textContent;
      output.append(node);
      cursor += 20;
    });
  cursor += 10;
  copy.setAttribute("x", (width - box.width) / 2);
  copy.setAttribute("y", cursor);
  copy.setAttribute("width", box.width);
  copy.setAttribute("height", box.height);
  output.append(copy);
  cursor += box.height + 24;
  paragraph(element("figure-note").textContent, 12);
  paragraph("Nilkamal Shah · " + location.href, 11);
  output.setAttribute("height", cursor + 12);
  output.setAttribute("viewBox", `0 0 ${width} ${cursor + 12}`);
  const blob = new Blob([new XMLSerializer().serializeToString(output)], {
    type: "image/svg+xml",
  });
  downloadBlob(
    blob,
    document.title.split("|")[0].trim().toLowerCase().replaceAll(" ", "-") +
      ".svg",
  );
  text(
    "status",
    "Figure downloaded with its legend, selection and source notes.",
  );
}
export function tools(chartId) {
  element("copy-view")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      text("status", "Link copied.");
    } catch {
      text("status", "Copy this page’s address from your browser.");
    }
  });
  element("print-view")?.addEventListener("click", () => window.print());
  element("save-figure")?.addEventListener("click", () =>
    exportFigure(chartId),
  );
}
export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function resize(draw) {
  let last = 0;
  new ResizeObserver(() => {
    const w = document.body.clientWidth;
    if (Math.abs(w - last) > 3) {
      last = w;
      draw();
    }
  }).observe(document.body);
}
export function failure(error) {
  const box = element("chart");
  if (box) {
    box.replaceChildren();
    const p = document.createElement("p");
    p.className = "error";
    p.textContent = "The data could not be loaded. Please reload the page.";
    box.append(p);
  }
  console.error(error);
}
