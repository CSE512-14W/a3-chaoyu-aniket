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

    console.log(world_data);

    for (var country in world_data) {

      var obj = {}
      if(world_data[country]>3000)
        {
          obj['fillKey'] = 'HIGH';

        }
        else if (world_data[country]>500)
          {
            obj['fillKey'] = 'MED';	
          }
          else
            {
              obj['fillKey'] = 'LOW';
            }
            obj['nkill'] = world_data[country];
            world_data[country] = obj;


    }

    //console.log(world_data);

    var map = new Datamap({
      element: document.getElementById('map'),
      fills: {
        HIGH: 'rgb(200,0,0)',
        MED: 'rgb(200,100,100)',
        LOW: 'rgb(200,200,200)',
        defaultFill: 'rgb(200,200,200'
      },
      data: world_data
    });


  });

};

generateWorld_data(2000,1,2010,12); 

//generateWorld_data(2000,1,2005,1); 
