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
            return '<div class="hoverinfo">' + geography.properties.name + '<br>' +  data.nkill + ' people killed' + 
                   '<br> Click to add/remove ' + '</div>'
          else
            return '<div class="hoverinfo">' + geography.properties.name + '<br>nobody killed</div>'; 
        }
      }
    });
  }, // end of update function

  
  countries :[],
  //country_names: [],
  init: function () {
    var countries=["DZA", "IND", "CHN", "THA", "IRQ"];
    var that = this;

    var render = function() {
      var event;
      event = d3.mouse(this);
      total = d3.selectAll("div#map svg.datamap g.datamaps-subunits path")[0].length;

      var clickedCountry = d3.selectAll("div#map svg.datamap g.datamaps-subunits path")[0][total-1].getAttribute("class").split(" ")[1];

      console.log(typeof clickedCountryColor);

      if(countries.indexOf(clickedCountry) == -1) {
        countries.push(clickedCountry);
      } else {
        countries.splice(countries.indexOf(clickedCountry), 1);
      }

      console.log(countries);
      that.countries = countries;
      // update circlesmap when clicked countries changes
      circlesmap.update();
      
      //var html ='';
      //for(var country in countries){
      //  html += '<p>' + countries[country] + '</p>';
      //}
      //document.getElementById('country_list').innerHTML = html;
    }
    
    svg = d3.select("div#map"); 
    svg.on("click", render);
    that.countries = countries;

    d3.json("data/gtd.json", function(error, data) {
      if (error) return console.warn(error);
      this.data = data;
      slider.init();
      circlesmap.init();
    }); 
  } // end of init function
};
