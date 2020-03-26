var innerRadius = 40,
  outerRadius = 440,
  majorAngle = (2 * Math.PI) / 3,
  minorAngle = (1 * Math.PI) / 12;

var angle = d3.scale
  .ordinal()
  .domain([0, 1, 2, 3])
  .range([0, majorAngle - minorAngle, majorAngle + minorAngle, 2 * majorAngle]);
var radius = d3.scale.linear().range([innerRadius, outerRadius]);

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("display", "none");

const tooltipContent = tooltip.append("div").attr("class", "tooltip-content");

function color(n) {
  const colors = ["#8b0000", "#128a67", "#BF13C2", "#d45c03", "#FFFF00"];

  return colors[n % colors.length];
}

function typeColors(type) {
  const types = [
    "hidden_service",
    "clearnet_service",
    "ip_address",
    "ssh_key",
    "pgp_key"
  ];

  return color(types.indexOf(type));
}

// draw Canvas
function drawCanvas() {
  const size = document.body.getBoundingClientRect();

  return d3
    .select("#chart")
    .append("svg")
    .attr("width", size.width)
    .attr("height", size.height)
    .append("g")
    .attr(
      "transform",
      "translate(" + size.width / 2 + "," + (3 * size.height) / 5 + ")"
    );
}

// draw Axes
function drawAxes(svg) {
  svg
    .selectAll(".axis")
    .data(d3.range(4))
    .enter()
    .append("line")
    .attr("class", "axis")
    .attr("transform", function(d) {
      return "rotate(" + degrees(angle(d)) + ")";
    })
    .attr("x1", radius.range()[0])
    .attr("x2", radius.range()[1]);
}

function degrees(radians) {
  return (radians / Math.PI) * 180 - 90;
}
function renderGraph() {
  var svg = drawCanvas();
  drawAxes(svg);
  var nodeDisplay = d3.select("#nodeChart");

  // highlight link and connected nodes on mouseover
  function linkMouseover(d) {
    svg
      .selectAll(".link")
      .classed("turnedOn", function(dl) {
        return dl === d;
      })
      .classed("turnedOff", function(dl) {
        return !(dl === d);
      });

    svg.selectAll(".node").classed("turnedOn", function(dl) {
      return dl === d.source || dl === d.target;
    });
  }

  // highlight node and connected links on mouseover
  function nodeMouseover(d) {
    svg
      .selectAll(".link")
      .classed("turnedOn", function(dl) {
        return dl.source === d || dl.target === d;
      })
      .classed("turnedOff", function(dl) {
        return !(dl.source === d || dl.target === d);
      });

    tooltip
      .style("display", "inline")
      .style("left", this.getBoundingClientRect().left + "px")
      .style("top", this.getBoundingClientRect().top + "px");
    tooltipContent.text(d.name);

    d3.select(this).classed("turnedOn", true);

    nodeDisplay
      .append("div")
      .append("p")
      .attr("class", "nodeDisplay-title")
      .text(() => {
        switch (d.type) {
          case "hidden_service":
            return "Hidden Service";
          case "clearnet_service":
            return "Clearnet TLD";
          case "ssh_key":
            return "SSH Key";
          case "pgp_key":
            return "PGP Fingerprint";
          case "ip_address":
            return "IP Address";
        }
      });

    const titleRow = nodeDisplay.append("div");

    titleRow
      .append("svg")
      .append("circle")
      .attr("r", 4)
      .attr("cx", 5)
      .attr("cy", 5)
      .style("fill", () => typeColors(d.type));

    titleRow.append("p").text(() => {
      switch (d.type) {
        case "hidden_service":
          return d.name;
        case "clearnet_service":
          return d.name;
        case "ssh_key":
          return d.name;
        case "pgp_key":
          return d.name;
        case "ip_address":
          return d.name;
      }
    });

    const infoRows = nodeDisplay
      .selectAll("div.nodeDisplay-info")
      .data(d.info || [])
      .enter()
      .append("div")
      .attr("class", "nodeDisplay-info");

    infoRows
      .append("svg")
      .append("circle")
      .attr("r", 4)
      .attr("cx", 5)
      .attr("cy", 5)
      .style("fill", d => typeColors(d.type));

    infoRows.append("p").text(d => {
      switch (d.label) {
        case "sshKey":
          return "SSH Key: " + d.value;
        case "pgpKeys":
          return d.value + " PGP keys";
        case "clearnetCount":
          return d.value + " related clearnet " + pluralize("service", d.value);
        case "onionCount":
          return d.value + " related hidden " + pluralize("service", d.value);
        case "ipAddress":
          return d.value + " IP " + pluralize("address", d.value);
        case "score":
          return "Security score of " + d.value;
      }
    });
  }

  // clear highlighted nodes or links
  function mouseout() {
    svg.selectAll(".turnedOn").classed("turnedOn", false);
    svg.selectAll(".turnedOff").classed("turnedOff", false);
    tooltip.style("display", "none");
    nodeDisplay.selectAll("*").remove();
  }

  d3.json("hive_data.json", data => {
    var links = [];
    data.links.forEach(link => {
      sourceNode = data.nodes.find(node => node.id === link.sourceNodeId);
      targetNode = data.nodes.find(node => node.id === link.targetNodeId);
      links.push({
        source: sourceNode,
        target: targetNode
      });
    });

    svg
      .selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr(
        "d",
        d3.hive
          .link()
          .angle(d => angle(d.x))
          .radius(d => radius(d.y))
      )
      .style("stroke", d => typeColors(d.source.type))
      .on("mouseover", linkMouseover)
      .on("mouseout", mouseout);

    svg
      .selectAll(".node")
      .data(data.nodes)
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("transform", d => "rotate(" + degrees(angle(d.x)) + ")")
      .attr("cx", d => radius(d.y))
      .attr("r", 5)
      .style("fill", d => typeColors(d.type))
      .on("mouseover", nodeMouseover)
      .on("mouseout", mouseout);

    window.addEventListener("resize", e => {
      const docSize = document.body.getBoundingClientRect();
      d3.select("svg")
        .attr("width", docSize.width)
        .attr("height", docSize.height);
    });
  });

  svgPanZoom("svg", {
    panEnabled: true,
    controlIconsEnabled: false,
    zoomEnabled: true,
    dblClickZoomEnabled: true,
    mouseWheelZoomEnabled: true,
    preventMouseEventsDefault: true,
    zoomScaleSensitivity: 0.1,
    fit: false,
    contain: false,
    center: false,
    refreshRate: "auto",
    eventsListenerElement: null
  });
}

renderGraph();
