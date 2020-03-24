// var width = 960,
// var height = 850,
// var innerRadius = 40,
// var outerRadius = 640,
//   majorAngle = (2 * Math.PI) / 3,
//   minorAngle = (1 * Math.PI) / 12;

// var angle = d3.scale
//   .ordinal()
//   .domain(["source", "source-target", "target-source", "target"])
//   .range([0, majorAngle - minorAngle, majorAngle + minorAngle, 2 * majorAngle]);

// var color = d3.scale.category10();
// var radius = d3.scale.linear().range([innerRadius, outerRadius]);
// function drawCanvas() {
//   return d3
//     .select("body")
//     .append("svg")
//     .attr("width", width)
//     .attr("height", height)
//     .append("g")
//     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
// }
// function drawAxes(svg) {
//   svg
//     .selectAll(".axis")
//     .data(d3.range(3))
//     .enter()
//     .append("line")
//     .attr("class", "axis")
//     .attr("transform", function(d) {
//       return "rotate(" + degrees(angle(d)) + ")";
//     })
//     .attr("x1", radius.range()[0])
//     .attr("x2", radius.range()[1]);
// }

var width = 960,
  height = 850,
  innerRadius = 40,
  outerRadius = 425,
  majorAngle = (2 * Math.PI) / 3,
  minorAngle = (1 * Math.PI) / 12;

var angle = d3.scale
    .ordinal()
    .domain(d3.range(4))
    .rangePoints([0, 2 * Math.PI]),
  radius = d3.scale.linear().range([innerRadius, outerRadius]),
  color = d3.scale.category10();

var nodes = [
  { x: 0, y: 0.1 },
  { x: 0, y: 0.9 },
  { x: 1, y: 0.2 },
  { x: 1, y: 0.3 },
  { x: 2, y: 0.1 },
  { x: 2, y: 0.8 }
];

var links = [
  { source: nodes[0], target: nodes[2] },
  { source: nodes[1], target: nodes[3] },
  { source: nodes[2], target: nodes[4] },
  { source: nodes[2], target: nodes[5] },
  { source: nodes[3], target: nodes[5] }
];

// draw Canvas
var svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// draw Axes
svg
  .selectAll(".axis")
  .data(d3.range(3))
  .enter()
  .append("line")
  .attr("class", "axis")
  .attr("transform", function(d) {
    return "rotate(" + degrees(angle(d)) + ")";
  })
  .attr("x1", radius.range()[0])
  .attr("x2", radius.range()[1]);

// draw links
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
      .angle(function(d) {
        return angle(d.x);
      })
      .radius(function(d) {
        return radius(d.y);
      })
  )
  .style("stroke", function(d) {
    return color(d.source.x);
  })
  .on("mouseover", linkMouseover)
  .on("mouseout", mouseout);

// draw nodes
svg
  .selectAll(".node")
  .data(nodes)
  .enter()
  .append("circle")
  .attr("class", "node")
  .attr("transform", function(d) {
    return "rotate(" + degrees(angle(d.x)) + ")";
  })
  .attr("cx", function(d) {
    return radius(d.y);
  })
  .attr("r", 5)
  .style("fill", function(d) {
    return color(d.x);
  })
  .on("mouseover", nodeMouseover)
  .on("mouseout", mouseout);

function drawLinks(svg) {}
function drawNodes(svg) {
  svg
    .append("g")
    .attr("class", "nodes")
    .selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .style("fill", d => color(d.type))
    .selectAll("circle")
    .data(function(d) {
      return d.connectors;
    })
    .enter()
    .append("circle")
    .attr("transform", function(d) {
      return "rotate(" + degrees(angle(d.type)) + ")";
    })
    .attr("cx", function(d) {
      return radius(d.node.index);
    })
    .attr("r", 4)
    .on("mouseover", nodeMouseover)
    .on("mouseout", mouseout);
}
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
  d3.select(this).classed("turnedOn", true);
}

// clear highlighted nodes or links
function mouseout() {
  svg.selectAll(".turnedOn").classed("turnedOn", false);
  svg.selectAll(".turnedOff").classed("turnedOff", false);
}

function degrees(radians) {
  return (radians / Math.PI) * 180 - 90;
}

// A shape generator for Hive links, based on a source and a target.
// The source and target are defined in polar coordinates (angle and radius).
// Ratio links can also be drawn by using a startRadius and endRadius.
// This class is modeled after d3.svg.chord.
// function link() {
//   var source = function(d) {
//       return d.source;
//     },
//     target = function(d) {
//       return d.target;
//     },
//     angle = function(d) {
//       return d.angle;
//     },
//     startRadius = function(d) {
//       return d.radius;
//     },
//     endRadius = startRadius,
//     arcOffset = -Math.PI / 2;

//   function link(d, i) {
//     var s = node(source, this, d, i),
//       t = node(target, this, d, i),
//       x;
//     if (t.a < s.a) (x = t), (t = s), (s = x);
//     if (t.a - s.a > Math.PI) s.a += 2 * Math.PI;
//     var a1 = s.a + (t.a - s.a) / 3,
//       a2 = t.a - (t.a - s.a) / 3;
//     return s.r0 - s.r1 || t.r0 - t.r1
//       ? "M" +
//           Math.cos(s.a) * s.r0 +
//           "," +
//           Math.sin(s.a) * s.r0 +
//           "L" +
//           Math.cos(s.a) * s.r1 +
//           "," +
//           Math.sin(s.a) * s.r1 +
//           "C" +
//           Math.cos(a1) * s.r1 +
//           "," +
//           Math.sin(a1) * s.r1 +
//           " " +
//           Math.cos(a2) * t.r1 +
//           "," +
//           Math.sin(a2) * t.r1 +
//           " " +
//           Math.cos(t.a) * t.r1 +
//           "," +
//           Math.sin(t.a) * t.r1 +
//           "L" +
//           Math.cos(t.a) * t.r0 +
//           "," +
//           Math.sin(t.a) * t.r0 +
//           "C" +
//           Math.cos(a2) * t.r0 +
//           "," +
//           Math.sin(a2) * t.r0 +
//           " " +
//           Math.cos(a1) * s.r0 +
//           "," +
//           Math.sin(a1) * s.r0 +
//           " " +
//           Math.cos(s.a) * s.r0 +
//           "," +
//           Math.sin(s.a) * s.r0
//       : "M" +
//           Math.cos(s.a) * s.r0 +
//           "," +
//           Math.sin(s.a) * s.r0 +
//           "C" +
//           Math.cos(a1) * s.r1 +
//           "," +
//           Math.sin(a1) * s.r1 +
//           " " +
//           Math.cos(a2) * t.r1 +
//           "," +
//           Math.sin(a2) * t.r1 +
//           " " +
//           Math.cos(t.a) * t.r1 +
//           "," +
//           Math.sin(t.a) * t.r1;
//   }

//   function node(method, thiz, d, i) {
//     var node = method.call(thiz, d, i),
//       a =
//         +(typeof angle === "function" ? angle.call(thiz, node, i) : angle) +
//         arcOffset,
//       r0 = +(typeof startRadius === "function"
//         ? startRadius.call(thiz, node, i)
//         : startRadius),
//       r1 =
//         startRadius === endRadius
//           ? r0
//           : +(typeof endRadius === "function"
//               ? endRadius.call(thiz, node, i)
//               : endRadius);
//     return { r0: r0, r1: r1, a: a };
//   }

//   link.source = function(_) {
//     if (!arguments.length) return source;
//     source = _;
//     return link;
//   };

//   link.target = function(_) {
//     if (!arguments.length) return target;
//     target = _;
//     return link;
//   };

//   link.angle = function(_) {
//     if (!arguments.length) return angle;
//     angle = _;
//     return link;
//   };

//   link.radius = function(_) {
//     if (!arguments.length) return startRadius;
//     startRadius = endRadius = _;
//     return link;
//   };

//   link.startRadius = function(_) {
//     if (!arguments.length) return startRadius;
//     startRadius = _;
//     return link;
//   };

//   link.endRadius = function(_) {
//     if (!arguments.length) return endRadius;
//     endRadius = _;
//     return link;
//   };

//   return link;
// }

// function degrees(radians) {
//   return (radians / Math.PI) * 180 - 90;
// }
