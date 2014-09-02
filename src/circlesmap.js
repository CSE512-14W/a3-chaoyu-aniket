// event circlesmap
var circlesmap_generator = function(){
  var margin = {top:20, right:20, bottom: 20, left: 60},
      height = 40,
      cell_height = 40,
      canvas_width,
      width;

  var initCanvasSize = function(){
      canvas_width = +(d3.select('#circlesmap').style('width').replace('px', ''));
      width = canvas_width - margin.left - margin.right;
  }

  var current_month_range = [new Date(2007, 1), new Date(2008, 1)]

  var gtd_data = {};
  var formatting_data = function(raw_data) {
    // if gtd data is already formatted, then return it
    if (!_.isEmpty(gtd_data)) { return gtd_data; }

    //console.log(raw_data)
    for(var i=0; i < raw_data.length; i++){
      var country = raw_data[i].country,
      year    = +raw_data[i].year,
      month   = +raw_data[i].month,
      day     = +raw_data[i].day,
      nkill   = +raw_data[i].nkill;

      if(_.isEmpty(gtd_data[country])) { gtd_data[country] = []; }

      date = new Date(year, month-1, day)

      gtd_data[country].push({
        time  : date,
        nkill : nkill
      });
    }

    // sort all the events by time
    _.each(gtd_data, function(country_event_list){
      country_event_list = country_event_list.sort(function(a, b){
        return a.time - b.time;
      });
    });
    return gtd_data;
  };

  var dateDiff = function(from, to) {
    var milliseconds = to - from;
    return milliseconds / 86400000;

  };

  var update_view = function(time_range) {
    // get the time range
    if(typeof time_range !== 'undefined'){
      current_month_range = time_range;
    }

    // countries added to list
    var countries = WORLDMAP.countries; // ["3_Letters_Country_Code"]

    if(countries.length == 0){
      //console.log("empty list");

      // Remove old circlesmap if there is one
      d3.select("div#circlesmap svg").remove();
      return ;
    }

    // calculate svg height
    height = countries.length * cell_height;

    // generating data to draw with
    var data = _.map(countries, function(country) {
      var i, j;
      var res = {
        country: country, 
        days: []
      };

      var days = gtd_data[country];
      if(days === undefined) {
        return res;
      }

      var flag = true;
      for(i=0; i<days.length; i++) {
        if(days[i].time < current_month_range[0]) {
          continue;
        } 

        for(j=i; j<days.length; j++) {
          if(days[j].time > current_month_range[1]) {
            break;
          } else {
            res.days.push(days[j]);
          }
        }
        break;
      }

      return res;
    });

    //console.log(current_month_range);
    //console.log(data);

    // Remove old circlesmap if there is one
    d3.select("div#circlesmap svg").remove();

    // update the time scale to current range
    var xScale = d3.time.scale()
    .range([0, width])
    .domain(current_month_range);

    var rScale = d3.scale.log()
    .domain([1, 3000])
    .range([0, 20])

    // Draw the updated circlesmap
    var svg = d3.select("#circlesmap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Draw the xAxis text
    var days = dateDiff(current_month_range[0], current_month_range[1])
    var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('top');

    if( days < 95)
      xAxis.ticks(d3.time.month, 1)
    .tickFormat(d3.time.format('%Y-%B'))
    else if (days < 500)
      xAxis.ticks(d3.time.month, 3)
    .tickFormat(d3.time.format('%Y-%B'))
    else 
      xAxis.ticks(d3.time.year, 1)
    .tickFormat(d3.time.format('%Y'))

    // Draw xAxis grid
    svg.append("g")
    .attr("class", "x grid")
    .call(xAxis);

    var circles = new Array();
    for(var i=0; i<data.length; i++){
      // draw each counrty separately
      var g = svg.append("g")

      g.selectAll("circle")
      .data(data[i]['days'])
      .enter()
      .append("circle")
      .attr("cx", function(d, i) { return xScale(d.time) })
      .attr("cy", function(d) { return (i + 0.5) * cell_height; })
      .attr("r", function(d) { return rScale(d.nkill);})
      .style("stroke", 'none')
      .style("fill", "#800000")
      .style("fill-opacity", 0.5);

      g.append("g")
      .attr("class", "x grid")
      .attr("transform", "translate(0," + (cell_height * (i+1)) + ")")
      .call(xAxis
            .ticks(d3.time.month, 1)
            .tickFormat(d3.time.format(''))
           );

           var full_country_name = country_name_mapping[data[i].country]

           g.append("text")
           .attr("y", function() { return (cell_height * i) + margin.top; })
           .attr("x", 0)
           .text(_.isEmpty(full_country_name) ? data[i].country : full_country_name)
           .attr("transform", "translate( -" + margin.left + ", 0)");
    }
    // end of drawing circlesmap
  };

  var init = function() {
    var that = this;
    initCanvasSize();

    d3.json("data/circles.json", function(error, data) {
      if (error) return console.warn(error);
      that.raw_data = data;
      formatting_data(data);
      update_view();
    }); 
  };

  return {
    init: init,
    initCanvasSize: initCanvasSize,
    gtd_data: function() { return gtd_data; },
    update: update_view
  };
};
