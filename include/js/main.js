var WORLDMAP = {

  data: {},
  world_data: {},
  
  update: function (f_year, f_month, t_year, t_month) {
    this.world_data = {};

    f_year = typeof f_year !== 'undefined' ? f_year : 2000;
    f_month = typeof f_month !== 'undefined' ? f_month : 1;
    t_year = typeof t_year !== 'undefined' ? t_year : 2011;
    t_month = typeof t_month !== 'undefined' ? t_month : 1;

    var totalKilled = 0;
    //console.log(data);

    for(var i=0; i < data.length; i++){
      
      var flag = new Boolean();
      flag = true;
      
      if(parseInt(data[i].year) < f_year){
          flag = false;
      }
      else if(parseInt(data[i].year) == f_year){
        if(parseInt(data[i].month) < f_month)
          flag = false;
      };
      
      if(parseInt(data[i].year) > t_year){
        flag = false;
      }else if(parseInt(data[i].year) == t_year){
        if(parseInt(data[i].month) > t_month - 1)
          flag = false;
      };
     
      if(flag){
        totalKilled += parseInt(data[i].nkill);
        if(this.world_data[data[i].country] == null){
          this.world_data[data[i].country] = parseInt(data[i].nkill)
        }
        else{
          this.world_data[data[i].country] = parseInt(data[i].nkill) + this.world_data[data[i].country];
        };	
      };
    };
   
    totalKilled = totalKilled.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    var get3LetterMonth = function(month) {
    	
    	var name = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC' ];
    	return name[month-1];
    }

    var html = '<b>' + totalKilled + '</b> people were killed due to Terrorism between '
                  + get3LetterMonth(f_month)+', ' + f_year + " and "+ get3LetterMonth(t_month)+', '+ t_year+'.';
    //console.log(html);

    document.getElementById('totalKill').innerHTML = html;
    //console.log(this.world_data);

    // create the color scale on the world map
    var colorScale = d3.scale.log()
                        .clamp(true)
                        .domain([1, 3000])
                        .range([0, 8])
                        .nice();

    for (var country in this.world_data) {
      var obj = {}
      obj['fillKey'] = Math.ceil(colorScale(this.world_data[country]));
      obj['nkill'] = this.world_data[country];
      this.world_data[country] = obj;
    }

    //console.log(this.world_data);
    $("#map svg").remove();
    
    var currentMap = new Datamap({
      element: document.getElementById('map'),
      fills: {
        8: "#800000",
        7: "#8A1818",
        6: "#943131",
        5: "#9F4949",
        4: "#A96262",
        3: "#B37A7A",
        2: "#BE9393",
        1: "#C8ABAB",
        0: "#D2C4C4",
        defaultFill: '#DDDDDD'
      },
      data: this.world_data,
      geographyConfig:{
        borderColor: 'hsl(0,0%,80%)',
        //highlightBorderColor: 'hsl(0,0%,4%)',
        //highlightBorderColor: '#ddd',
        highlightFillColor: 'hsl(0,0%,20%)',
	      highlightOnHover: true,
        highlightBorderWidth: 0,
        fillOpacity: 0.9,
	      popupTemplate: function(geography, data) {
          if(data)
            return '<div class="hoverinfo">' + geography.properties.name + '<br>' +  data.nkill + ' people killed</div>'; 
          else
            return '<div class="hoverinfo">' + geography.properties.name + '<br>nobody killed</div>'; 
	      }
      }
    });
  }, // end of update function

  
  countries :[],
  //country_names: [],
  init: function () {
    var countries=[];
    var that = this;
    
    svg = d3.select("div#map");	
    svg.on("click", function() {
      var event;
      event = d3.mouse(this);
      total = d3.selectAll("div#map svg.datamap g.datamaps-subunits path")[0].length;
      var clickedCountry = d3.selectAll("div#map svg.datamap g.datamaps-subunits path")[0][total-1].getAttribute("class").split(" ")[1];
      var clickedCountryColor = d3.selectAll("div#map svg.datamap g.datamaps-subunits path")[0][total-1].getAttribute("style").split(" ")[1];
      
      if(clickedCountryColor=='#333333;'){
	      if(countries.indexOf(clickedCountry) == -1) {
	        countries.push(clickedCountry);
	      } else {
	        countries.splice(countries.indexOf(clickedCountry), 1);
	      }
      }
      console.log(countries);
      that.countries = countries;
      // update circlesmap when clicked countries changes
      circlesmap.update();
      
      var html ='';
      for(var country in countries){
        html += '<p>' + countries[country] + '</p>';
      }
      document.getElementById('country_list').innerHTML = html;
    });

	  d3.json("data/gtd.json", function(error, data) {
	    if (error) return console.warn(error);
	    this.data = data;
      that.data = data;
      slider.init();
      circlesmap.init();
	  }); 
  } // end of init function
};


// Slider area
var slider = (function(){
  // svg attributes
  var margin = {top:0, right:20, bottom: 30, left: 20},
      canvas_width = +(d3.select('#slider').style('width').replace('px', '')),
      w = canvas_width - margin.left - margin.right,
      h = 70,
      barPadding = 1;

  // Parsing data from sumTable.csv
  // csv format example: 
  //    time, nkill
  //    2010-1, 10

  // Time format
  // usage: format.parse("2010-1"), reuturns a Date object
  // doc: https://github.com/mbostock/d3/wiki/Time-Formatting
  var format = d3.time.format("%Y-%m");
  
  var dataset = [];
  var draw = function(dataset) {
    // append svg
    console.log("create svg");
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
        .extent([new Date(2007, 1), new Date(2008, 1)])
        .on("brushend", function() {
          if (!d3.event.sourceEvent) return; // only transition after input

          var extent0 = brush.extent(),
          extent1 = extent0.map(d3.time.month.round);

          // if empty when rounded, use floor & ceil instead
          if (extent1[0] >= extent1[1]) {
            extent1[0] = d3.time.month.floor(extent0[0]);
            extent1[1] = d3.time.month.ceil(extent0[1]);
          }

          d3.select(this).transition()
            .call(brush.extent(extent1))
            .call(brush.event);
          //d3.select(this).call(brush.extent(extent1));
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
      .attr("transform", "translate(0," + (h+1) + ")")
      .call(xAxis);

    var gBrush = svg.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.event);

    gBrush.selectAll("rect")
      .attr("height", h);
  };

  var update_view = function(month_range) {
    //console.log(month_range);

    // update the world map
    WORLDMAP.update(
      month_range[0].getFullYear(), month_range[0].getMonth()+1,
      month_range[1].getFullYear(), month_range[1].getMonth()+1
    );

    // update the circlesmap
    circlesmap.update(month_range);
  };

  var init = function() {
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

  return {
    init: init,
    dataset: function() { return dataset; }
  };
})();


// event circlesmap
var circlesmap = (function(){
  var margin = {top:0, right:20, bottom: 20, left: 60},
      canvas_width = +(d3.select('#circlesmap').style('width').replace('px', '')),
      width = canvas_width - margin.left - margin.right,
      height = 40,
      cell_height = 40;

  var current_time_range = [new Date(2007, 1), new Date(2008, 1)]

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

    console.log(gtd_data);
    return gtd_data;
  };

  var update_view = function(time_range) {
    // get the time range
    if(typeof time_range !== 'undefined'){
      current_month_range = time_range;
    }

    // countries added to list
    var countries = WORLDMAP.countries; // ["3_Letters_Country_Code"]

    if(countries.length == 0){
      console.log("empty list");
      return ;
    }

    // calculate svg height
    height = countries.length * cell_height;

    // generating data to draw with
    var data = _.map(countries, function(country) {
      return {
        country: country,
        days:_.filter(gtd_data[country], function(day){
          return day.time > current_month_range[0] &&
                  day.time < current_month_range[1];
        })
      }
    });
    //console.log(current_month_range);
    //console.log(data);

    // Remove old circlesmap if there is one
    $("#circlesmap svg").remove();

    // Draw the updated circlesmap
    // Set the time scale for the x ais
    var xScale = d3.time.scale()
                      .range([0, width])
                      .domain(current_month_range);

    var svg = d3.select("#circlesmap")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      ;

    //var circles = new Array();
    for(var i=0; i<data.length; i++){
      // draw each counrty separately
      //var g = svg.append("g")
      //circles[i] = g.selectAll("circle")
      svg.selectAll("circle")
        .data(data[i].days)
        .enter()
        .append("circle")  
        .attr("cx", function(d, i) { return xScale(d.time) })
        .attr("cy", function(d, i) { return (i + 0.5) * cell_height; })
        .attr("r", function(d) { return d.nkill})
        .style("stroke", 'black')
        .style("fill", 'black');
    }

    // end of drawing circlesmap
  };

  var init = function() {
    var that = this;
    d3.json("data/circles.json", function(error, data) {
	    if (error) return console.warn(error);
	    that.raw_data = data;
      formatting_data(data);
	  }); 
  };

  return {
    init: init,
    gtd_data: function() { return gtd_data; },
    update: update_view
  };
})();


WORLDMAP.init();
