(() => {
  const palette = ["#087f8c", "#a46b19", "#8c4a73", "#355ca8", "#417b69"];
  fetch("assets/preview.json")
    .then((response) => {
      if (!response.ok) throw new Error("Preview data could not be loaded.");
      return response.json();
    })
    .then((data) => {
      function draw() {
        const b = d3.select("#borrowing-preview"),
          w = b.node().clientWidth,
          h = b.node().clientHeight;
        b.attr("viewBox", `0 0 ${w} ${h}`).selectAll("*").remove();
        const rows = data.debt.filter((r) =>
          ["Engineering", "Education", "Psychology"].includes(r.name),
        );
        const nodes = [
          ...rows.map((r, i) => ({ id: "f" + i, label: r.name })),
          ...data.debt_bins.map((c, j) => ({ id: "b" + j, label: c })),
        ];
        const links = rows.flatMap((r, i) =>
          r.counts.map((v, j) => ({
            source: "f" + i,
            target: "b" + j,
            value: v,
            category: j,
          })),
        );
        const graph = d3
          .sankey()
          .nodeId((d) => d.id)
          .nodeWidth(7)
          .nodePadding(14)
          .nodeSort(null)
          .extent([
            [80, 26],
            [w - 61, h - 25],
          ])({ nodes, links });
        b.append("g")
          .selectAll("path")
          .data(graph.links)
          .join("path")
          .attr("d", d3.sankeyLinkHorizontal())
          .attr("fill", "none")
          .attr("stroke", (d) => palette[d.category])
          .attr("stroke-width", (d) => Math.max(1, d.width))
          .attr("stroke-opacity", 0.55);
        b.selectAll("rect")
          .data(graph.nodes)
          .join("rect")
          .attr("x", (d) => d.x0)
          .attr("y", (d) => d.y0)
          .attr("height", (d) => d.y1 - d.y0)
          .attr("width", 7)
          .attr("fill", "#183040");
        b.selectAll("text")
          .data(graph.nodes)
          .join("text")
          .attr("x", (d) => (d.id[0] === "f" ? d.x0 - 6 : d.x1 + 6))
          .attr("y", (d) => (d.y0 + d.y1) / 2)
          .attr("dominant-baseline", "middle")
          .attr("text-anchor", (d) => (d.id[0] === "f" ? "end" : "start"))
          .attr("font-size", 10)
          .attr("fill", "#183040")
          .text((d) => d.label);
        const c = d3.select("#careers-preview"),
          cw = c.node().clientWidth,
          ch = c.node().clientHeight;
        c.attr("viewBox", `0 0 ${cw} ${ch}`).selectAll("*").remove();
        const n = data.careers.length + data.sectors.length,
          matrix = Array.from({ length: n }, () => Array(n).fill(0));
        data.careers.forEach((r, i) =>
          r.counts.forEach((v, j) => (matrix[i][data.careers.length + j] = v)),
        );
        const chords = d3.chordDirected().padAngle(0.025)(matrix),
          radius = Math.min(cw * 0.35, ch * 0.39),
          g = c.append("g").attr("transform", `translate(${cw / 2},${ch / 2})`);
        g.selectAll("path.flow")
          .data(chords)
          .join("path")
          .attr("class", "flow")
          .attr("d", d3.ribbonArrow().radius(radius - 6))
          .attr(
            "fill",
            (d) => palette[(d.target.index - data.careers.length) % 5],
          )
          .attr("fill-opacity", 0.48);
        g.selectAll("path.arc")
          .data(chords.groups)
          .join("path")
          .attr("class", "arc")
          .attr(
            "d",
            d3
              .arc()
              .innerRadius(radius)
              .outerRadius(radius + 7),
          )
          .attr("fill", (d) =>
            d.index < data.careers.length
              ? "#183040"
              : palette[(d.index - data.careers.length) % 5],
          );
      }
      draw();
      let last = 0;
      new ResizeObserver(() => {
        const w = document.body.clientWidth;
        if (w !== last) {
          last = w;
          draw();
        }
      }).observe(document.body);
    })
    .catch(() => {
      document.querySelectorAll(".study-preview").forEach((el) => {
        el.style.background = "#edf3f6";
      });
    });
})();
