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
      
      var bool = new Boolean();
      bool = true;
      
      if(parseInt(data[i].year) < f_year){
          bool = false;
      }
      else if(parseInt(data[i].year) == f_year){
        if(parseInt(data[i].month) < f_month)
          bool = false;
      };
      
      if(parseInt(data[i].year) > t_year){
        bool = false;
      }else if(parseInt(data[i].year) == t_year){
        if(parseInt(data[i].month) > t_month)
          bool = false;
      };
     
      if(bool){
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


    var html = '<b>' + totalKilled + '</b> people were killed due to Terrorism between '
                  + f_year +'/'+ f_month +" and "+ t_year +'/'+ t_month + '.'
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

    console.log(this.world_data);
    $("#map svg").remove();
    
    var currentMap = new Datamap({
      element: document.getElementById('map'),
      fills: {
        0: "#800000",
        1: "#8A1818",
        2: "#943131",
        3: "#9F4949",
        4: "#A96262",
        5: "#B37A7A",
        6: "#BE9393",
        7: "#C8ABAB",
        8: "#D2C4C4",
        defaultFill: 'DDDDDD'
      },
      data: this.world_data,
      geographyConfig:{
	      highlightBorderColor: '#AAAAAA',
	      highlightFillColor: '#000000',
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
  init: function (callback) {
    var countries=[];
    var that = this;
    
    svg = d3.select("div#map");	
    svg.on("click", function() {
      var event;
      event = d3.mouse(this);
      total = d3.selectAll("div#map svg.datamap g.datamaps-subunits path")[0].length;
      var clickedCountry = d3.selectAll("div#map svg.datamap g.datamaps-subunits path")[0][total-1].getAttribute("class").split(" ")[1];
      
      if(countries.indexOf(clickedCountry) == -1) {
        countries.push(clickedCountry);
      } else {
        countries.splice(countries.indexOf(clickedCountry), 1);
      }
      that.countries = countries;
      
      var html ='';
      for(var country in countries){
        html += '<p>' + countries[country] + '</p>';
      }
      console.log(countries);
      document.getElementById('country_list').innerHTML = html;
    });

	  d3.json("data/gtd.json", function(error, data) {
	    if (error) return console.warn(error);
	    this.data = data;
      callback();
	  }); 
  } // end of init function
}

// event heatmap
var heatmap = (function(){


  return {
  
  };
})();

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
  
  var dataset = []
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
                        d3.max(dataset, function(d) { return d.nkill; })]
    var time_range = [d3.min(dataset, function(d) { return d.time; }),
                        d3.max(dataset, function(d) { return d.time; })]
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
                        .range([0,w])
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
        })
        ;

       
    // Draw the Chart
    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr({
          x: function(d, i) { return i* (w/dataset.length);},
          y: function(d) { return h - yScale(d.nkill);},
          width: w / dataset.length - barPadding,
          height: function(d) { return yScale(d.nkill); },
          fill: function(d) { return "hsla(13, 100%, " + (95 -cScale(d.nkill)) + "%,1)";}
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

    // update the heat map
    // code goes here
  }

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


WORLDMAP.init(slider.init);
