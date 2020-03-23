var width = 960,
  height = 850,
  innerRadius = 40,
  outerRadius = 640,
  majorAngle = (2 * Math.PI) / 3,
  minorAngle = (1 * Math.PI) / 12;

var angle = d3.scale
  .ordinal()
  .domain(["source", "source-target", "target-source", "target"])
  .range([0, majorAngle - minorAngle, majorAngle + minorAngle, 2 * majorAngle]);

var color = d3.scale.category10();
var radius = d3.scale.linear().range([innerRadius, outerRadius]);
function drawCanvas() {
  return d3
    .select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .appen("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
}
function drawAxes(svg) {
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
}

function renderGraph() {
  const svg = drawCanvas();
  d3.json("master_onionscan_results.json",nodes =>{
    var nodeTypes = []
    edges = []
    nodes.array.forEach(node => {
        if(node.linkedSites !== ""){
            edges.push(node.linkedSites)
        }
        if(node.relatedOnionDomians !== ""){
            edges.push(node.relatedOnionDomians)
        }
        if(node.relatedOnionServices !== ""){
            edges.push(node.relatedOnionServices)
        }
    
       if(edges.length){
           edges.forEach(edge =>{
               if(edge.endsWith(".onion")){
                   //add Hidden service node
                   

               }
               else{
                   //add Clearnet node
                   //add connection between Clearnet node and node.hiddenService
               }
               if(node.ipAddresses !== ""){
                //add IPaddress node
                //add connection between node IP and associated hideen service node.hiddenService
            }
               
           })
       }
    });

})


function drawLinks(svg){

}
function drawNodes(svg){
    
}







// Highlight the link and connected nodes on mouseover.
function linkMouseover(d) {
    svg.selectAll(".link").classed("active", function(p) { return p === d; });
    svg.selectAll(".node circle").classed("active", function(p) { return p === d.source || p === d.target; });
    info.text(d.source.node.name + " → " + d.target.node.name);
  }

  // Highlight the node and connected links on mouseover.
  function nodeMouseover(d) {
    svg.selectAll(".link").classed("active", function(p) { return p.source === d || p.target === d; });
    d3.select(this).classed("active", true);
    info.text(d.node.name);
  }

  // Clear any highlighted nodes or links.
  function mouseout() {
    svg.selectAll(".active").classed("active", false);
    info.text(defaultInfo);
  }
  
// A shape generator for Hive links, based on a source and a target.
// The source and target are defined in polar coordinates (angle and radius).
// Ratio links can also be drawn by using a startRadius and endRadius.
// This class is modeled after d3.svg.chord.
function link() {
    var source = function(d) {
        return d.source;
      },
      target = function(d) {
        return d.target;
      },
      angle = function(d) {
        return d.angle;
      },
      startRadius = function(d) {
        return d.radius;
      },
      endRadius = startRadius,
      arcOffset = -Math.PI / 2;
  
    function link(d, i) {
      var s = node(source, this, d, i),
        t = node(target, this, d, i),
        x;
      if (t.a < s.a) (x = t), (t = s), (s = x);
      if (t.a - s.a > Math.PI) s.a += 2 * Math.PI;
      var a1 = s.a + (t.a - s.a) / 3,
        a2 = t.a - (t.a - s.a) / 3;
      return s.r0 - s.r1 || t.r0 - t.r1
        ? "M" +
            Math.cos(s.a) * s.r0 +
            "," +
            Math.sin(s.a) * s.r0 +
            "L" +
            Math.cos(s.a) * s.r1 +
            "," +
            Math.sin(s.a) * s.r1 +
            "C" +
            Math.cos(a1) * s.r1 +
            "," +
            Math.sin(a1) * s.r1 +
            " " +
            Math.cos(a2) * t.r1 +
            "," +
            Math.sin(a2) * t.r1 +
            " " +
            Math.cos(t.a) * t.r1 +
            "," +
            Math.sin(t.a) * t.r1 +
            "L" +
            Math.cos(t.a) * t.r0 +
            "," +
            Math.sin(t.a) * t.r0 +
            "C" +
            Math.cos(a2) * t.r0 +
            "," +
            Math.sin(a2) * t.r0 +
            " " +
            Math.cos(a1) * s.r0 +
            "," +
            Math.sin(a1) * s.r0 +
            " " +
            Math.cos(s.a) * s.r0 +
            "," +
            Math.sin(s.a) * s.r0
        : "M" +
            Math.cos(s.a) * s.r0 +
            "," +
            Math.sin(s.a) * s.r0 +
            "C" +
            Math.cos(a1) * s.r1 +
            "," +
            Math.sin(a1) * s.r1 +
            " " +
            Math.cos(a2) * t.r1 +
            "," +
            Math.sin(a2) * t.r1 +
            " " +
            Math.cos(t.a) * t.r1 +
            "," +
            Math.sin(t.a) * t.r1;
    }
  
    function node(method, thiz, d, i) {
      var node = method.call(thiz, d, i),
        a =
          +(typeof angle === "function" ? angle.call(thiz, node, i) : angle) +
          arcOffset,
        r0 = +(typeof startRadius === "function"
          ? startRadius.call(thiz, node, i)
          : startRadius),
        r1 =
          startRadius === endRadius
            ? r0
            : +(typeof endRadius === "function"
                ? endRadius.call(thiz, node, i)
                : endRadius);
      return { r0: r0, r1: r1, a: a };
    }
  
    link.source = function(_) {
      if (!arguments.length) return source;
      source = _;
      return link;
    };
  
    link.target = function(_) {
      if (!arguments.length) return target;
      target = _;
      return link;
    };
  
    link.angle = function(_) {
      if (!arguments.length) return angle;
      angle = _;
      return link;
    };
  
    link.radius = function(_) {
      if (!arguments.length) return startRadius;
      startRadius = endRadius = _;
      return link;
    };
  
    link.startRadius = function(_) {
      if (!arguments.length) return startRadius;
      startRadius = _;
      return link;
    };
  
    link.endRadius = function(_) {
      if (!arguments.length) return endRadius;
      endRadius = _;
      return link;
    };
  
    return link;
  }
  
  function degrees(radians) {
    return (radians / Math.PI) * 180 - 90;
  }
