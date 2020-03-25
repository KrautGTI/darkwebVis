var width = 980,
  height = 900,
  innerRadius = 40,
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
  const colors = ["#8b0000", "#128a67", "#d45c03", "#BF13C2", "#C29F40"];

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
  return d3
    .select("body")
    .attr("class", "svg")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (3 * height) / 5 + ")");
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
  }

  // clear highlighted nodes or links
  function mouseout() {
    svg.selectAll(".turnedOn").classed("turnedOn", false);
    svg.selectAll(".turnedOff").classed("turnedOff", false);
    tooltip.style("display", "none");
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
