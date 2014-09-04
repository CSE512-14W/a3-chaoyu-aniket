// Slider area
var slider_generator = function(){
  // svg attributes
  var margin = {top:0, right:15, bottom: 20, left: 15},
      canvas_width,
      w,
      h = 60,
      barPadding = 1;

  var initCanvasSize = function(){
      canvas_width = +(d3.select('#slider').style('width').replace('px', ''));
      w = canvas_width - margin.left - margin.right;
  }

  // Parsing data from sumTable.csv
  // csv format example: 
  //    time, nkill
  //    2010-1, 10

  // Time format
  // usage: format.parse("2010-1"), reuturns a Date object
  // doc: https://github.com/mbostock/d3/wiki/Time-Formatting
  var format = d3.time.format("%Y-%m");

  var upper_time_limit = new Date(2010, 12);
  var lower_time_limit = new Date(1999, 12);
  
  var dataset = [];
  var draw = function(dataset) {
    // append svg
    //console.log("create svg");
    var svg = d3.select("#slider")
                .append("svg")
                .attr("width", w + margin.left + margin.right)
                .attr("height", h + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

                //svg.append("rect")
                //.attr("width", w)
                //.attr("height", h)
                //.attr("class", "grid-background")
                //.append("g")
                //.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
              
                
    // setting up scale
    var nkill_range = [d3.min(dataset, function(d) { return d.nkill; }),
                        d3.max(dataset, function(d) { return d.nkill; })];
    var time_range = [d3.min(dataset, function(d) { return d.time; }),
                        d3.max(dataset, function(d) { return d.time; })];
    // y-axis scale
    var yScale = d3.scale.linear()
                         .domain(nkill_range)
                         .range([0.05*h,h])
                         .nice();
                        
    // color scale
    var cScale = d3.scale.log()
                         .domain(nkill_range)
                         .range([80, 0]);                                                                        
    
    // time scale for x-axis
    var tScale = d3.time.scale()
                        .domain(time_range)
                        .nice(d3.time.year)
                        .range([0,w]);
                        //.ticks(d3.time.month, 1)
                        //.tickFormat(d3.time.format('%Y-%B'))

    var brush = d3.svg.brush()
        .x(tScale)
        .extent([new Date(2007, 12), new Date(2008, 12)])
        .on("brushend", function() {
          if (!d3.event.sourceEvent) return; // only transition after input

          var extent0 = brush.extent(),
          extent1 = extent0.map(d3.time.month.round);

          // if empty when rounded, use floor & ceil instead
          if (extent1[0] >= extent1[1]) {
            extent1[0] = d3.time.month.offset(d3.time.month.ceil(extent0[0]), -6);
            extent1[1] = d3.time.month.offset(d3.time.month.ceil(extent0[1]), 6);
          }

          if (extent1[0] < lower_time_limit) {
            extent1[0] = d3.time.month.ceil(lower_time_limit);
          }

          if (extent1[1] > upper_time_limit) {
            extent1[1] = d3.time.month.ceil(upper_time_limit);
          }

          //console.log(extent1);

          d3.select(this).transition()
            .call(brush.extent(extent1))
            .call(brush.event);
            //d3.select(this).call(brush.extent(extent1));

          update_view(extent1);
        })
        .on("brush", function(){
          var extent0 = brush.extent(),
          extent1 = extent0.map(d3.time.month.round);

          if (extent1[0] >= extent1[1]) {
            extent1[0] = d3.time.month.floor(extent0[0]);
            extent1[1] = d3.time.month.ceil(extent0[1]);
          }

          update_view(extent1);
        });
       
    // Draw the Chart
    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr({
          x: function(d, i) { return i* (w/dataset.length);},
          y: function(d) { return h - yScale(d.nkill);},
          width: w / dataset.length - barPadding,
          height: function(d) { return yScale(d.nkill);},
          fill: function(d) { return "hsl(0, 0%,"+ cScale(d.nkill) + "%)";}
        });
      
    
    // Draw grid
    svg.append("g")
      .attr("class", "x grid")
      .attr("transform", "translate(0," + h + ")")
      .call(d3.svg.axis()
            .scale(tScale)
            .orient("bottom")
            .ticks(d3.time.year, 1)
            .tickFormat(""))
          .selectAll(".tick")
            .classed("minor", function(d) { return d.getFullYear(); });

    var xAxis = d3.svg.axis()
                    .scale(tScale)
                    .orient("bottom")
                    .ticks(d3.time.year, 1)
                    .tickFormat(d3.time.format('%Y'))

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis);

    var gBrush = svg.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.event);

    gBrush.selectAll("rect")
      .attr("height", h);
  };

  var current_month_range;
  var update_view = function(month_range) {
    //console.log(month_range);
    current_month_range = month_range;

    // update the world map
    WORLDMAP.update(
      month_range[0].getFullYear(), month_range[0].getMonth()+1,
      month_range[1].getFullYear(), month_range[1].getMonth()+1
    );

    // update the circlesmap
    circlesmap.update(month_range);
  };

  var init = function() {
    initCanvasSize();

    // Read csv file
    d3.csv("data/sumTable.csv", function(data){
      dataset = data.map(function(d) {
        return {
          time: format.parse(d.time), 
          nkill: +d.nkill
        }
      });
      draw(dataset);
    });
  };

  var redraw = function(){
    d3.select("div#slider svg").remove();
    initCanvasSize();
    draw(dataset);
    update_view(current_month_range);
  };

  return {
    init: init,
    redraw: redraw,
    dataset: function() { return dataset; }
  };
};
