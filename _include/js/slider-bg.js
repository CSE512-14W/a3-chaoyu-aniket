// Backgroud of slider area

var slider_bg = (function(){
  // svg attributes
  var margin = {top:0, right:20, bottom: 30, left: 20},
      canvas_width = +(d3.select('#slider-bg').style('width').replace('px', '')),
      w = canvas_width - margin.left - margin.right,
      h = 130,
      barPadding = 1;

  // Parsing data from sum_table.csv
  // csv format example: 
  //    time, nkill
  //    2010-1, 10

  // Time format
  // usage: format.parse("2010-1"), reuturns a Date object
  // doc: https://github.com/mbostock/d3/wiki/Time-Formatting
  var format = d3.time.format("%Y-%m");
  

  var dataset = []
  var draw = function(dataset) {
    // append svg
    console.log("create svg");
    var svg = d3.select("#slider-bg")
                .append("svg")
                .attr("width", w + margin.left + margin.right)
                .attr("height", h + margin.top + margin.bottom)
              .append("g")
                .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

    // setting up scale
    var nkill_range = [d3.min(dataset, function(d) { return d.nkill; }),
                        d3.max(dataset, function(d) { return d.nkill; })]
    var time_range = [d3.min(dataset, function(d) { return d.time }),
                        d3.max(dataset, function(d) { return d.time })]
    // y-axis scale
    var yScale = d3.scale.linear()
                         .domain(nkill_range)
                         .range([0.05*h,h])
                         .nice();

    // color scale
    var cScale = d3.scale.log()
                         .domain(nkill_range)
                         .range([15, 75]);
    
    // time scale for x-axis
    var tScale = d3.time.scale()
                        .domain(time_range)
                        .nice(d3.time.year)
                        .range([0,w]);
    
    // Draw the Chart
    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr({
          x: function(d, i) { return i* (w/dataset.length);},
          y: function(d) { return h - yScale(d.nkill)},
          width: w / dataset.length - barPadding,
          height: function(d) { return yScale(d.nkill) },
          fill: function(d) { return "hsla(13, 100%, " + (95 -cScale(d.nkill)) + "%,1)"}
        });
      
    // Draw Axis
    var xAxis = d3.svg.axis()
                    .scale(tScale)
                    .orient("bottom")
                    //.ticks(d3.time.year, 1)
                    //.tickFormat(d3.time.format('%Y'));

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + (h+1) + ")")
      .call(xAxis);

  };

  var init = function() {
    // Read csv file
    d3.csv("../../_data/sum_table.csv", function(data){
      dataset = data.map(function(d) {
        return {
          time: format.parse(d.time), 
          nkill: +d.nkill
        }
      });
      draw(dataset);
    });
  };

  return {
    init: init,
    dataset: function() { return dataset;}
  }

})();

slider_bg.init();
