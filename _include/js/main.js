//
(function() {
	var countries=[];
	nevents = 0;
	
	svg = d3.select("div#map");	
	svg.on("click", function() {
    	var event;
    	event = d3.mouse(this);
    	total = d3.selectAll("div#map svg.datamap g.datamaps-subunits path")[0].length;
    	var clickedCountry = d3.selectAll("div#map svg.datamap g.datamaps-subunits path")[0][total-1].getAttribute("class").split(" ")[1];
    	
    	if(countries.indexOf(clickedCountry)==-1){
	    	countries.push(clickedCountry);
    	}else
    	{
	    	countries.splice(countries.indexOf(clickedCountry),1);
    	}
    	var html ='';
    	
    	for(var country in countries){
    		html += '<p>' + countries[country] + '</p>';
    	}
    	console.log(html);
    	document.getElementById('country_list').innerHTML = html;
    	
    });
  
}).call(this);

//
var generateWorld_data = function (f_year, f_month, t_year, t_month) {

  f_year = typeof f_year !== 'undefined' ? f_year : 2000;
  f_month = typeof f_month !== 'undefined' ? f_month : 1;
  t_year = typeof t_year !== 'undefined' ? t_year : 2010;
  t_month = typeof t_month !== 'undefined' ? t_month : 12;

  var world_data = {};

  d3.json("_data/gtd.json", function(error, data) {
    if (error) return console.warn(error);

    data.forEach(function(data){ 
      if(data.year >=f_year && data.year <=t_year){
        if(data.month >=f_month && data.month <=t_month)	
          if(world_data[data.country]==null){
            world_data[data.country] = parseInt(data.nkill)
          }
          else{
            world_data[data.country] = parseInt(data.nkill) + world_data[data.country];
          }
      }
    });

    //console.log(world_data);

    for (var country in world_data) {

      var obj = {}
      if(world_data[country]>3000)
        {
          obj['fillKey'] = 'HIGH';

        }
        else if (world_data[country]>300)
          {
            obj['fillKey'] = 'MED';	
          }
          else if (world_data[country]>30)
            {
              obj['fillKey'] = 'LOW';
            }
            obj['nkill'] = world_data[country];
            world_data[country] = obj;

    }

    console.log(world_data);

    var map = new Datamap({
      element: document.getElementById('map'),
      fills: {
        HIGH: 'rgb(200,0,0)',
        MED: 'rgb(180,75,75)',
        LOW: 'rgb(200,150,150)',
        defaultFill: 'rgb(200,200,200)'
      },
      data: world_data,
      geographyConfig:{
	      highlightBorderColor: '#AAAAAA',
	      highlightFillColor: '#000000',
	      popupTemplate: function(geography, data) {
	      if(data)
	      	return '<div class="hoverinfo">' + geography.properties.name + '<br>' +  data.nkill + ' poeple killed</div>'; 
	      else
	      	return '<div class="hoverinfo">' + geography.properties.name + '<br>nobody killed</div>'; 
	      }
      }
    });


  });

};

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

generateWorld_data(2000,1,2010,12);

slider_bg.init();
