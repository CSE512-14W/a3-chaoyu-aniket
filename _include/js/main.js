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

//UI Range Slider
(function( $, undefined ) {
  $.widget("ui.dragslider", $.ui.slider, {
    options: $.extend({},$.ui.slider.prototype.options,{rangeDrag:false}),

    _create: function() {
      $.ui.slider.prototype._create.apply(this,arguments);
      this._rangeCapture = false;
    },

    _mouseCapture: function( event ) { 
      var o = this.options;
      if ( o.disabled ) return false;
      if(event.target == this.range.get(0) && o.rangeDrag == true && o.range == true) {
        this._rangeCapture = true;
        this._rangeStart = null;
      }
      else {
        this._rangeCapture = false;
      }
      $.ui.slider.prototype._mouseCapture.apply(this,arguments);
      if(this._rangeCapture == true) {	
        this.handles.removeClass("ui-state-active").blur();	
      }
      return true;
    },

    _mouseStop: function( event ) {
      this._rangeStart = null;
      return $.ui.slider.prototype._mouseStop.apply(this,arguments);
    },

    _slide: function( event, index, newVal ) {
      if(!this._rangeCapture) { 
        return $.ui.slider.prototype._slide.apply(this,arguments);
      }
      if(this._rangeStart == null) {
        this._rangeStart = newVal;
      }
      var oldValLeft = this.options.values[0],
      oldValRight = this.options.values[1],
      slideDist = newVal - this._rangeStart,
      newValueLeft = oldValLeft + slideDist,
      newValueRight = oldValRight + slideDist,
      allowed;
      if ( this.options.values && this.options.values.length ) {
        if(newValueRight > this._valueMax() && slideDist > 0) {
          slideDist -= (newValueRight-this._valueMax());
          newValueLeft = oldValLeft + slideDist;
          newValueRight = oldValRight + slideDist;
        }
        if(newValueLeft < this._valueMin()) {
          slideDist += (this._valueMin()-newValueLeft);
          newValueLeft = oldValLeft + slideDist;
          newValueRight = oldValRight + slideDist;
        }
        if ( slideDist != 0 ) {
          newValues = this.values();
          newValues[ 0 ] = newValueLeft;
          newValues[ 1 ] = newValueRight;
          // A slide can be canceled by returning false from the slide callback
          allowed = this._trigger( "slide", event, {
            handle: this.handles[ index ],
            value: slideDist,
            values: newValues
          } );
          if ( allowed !== false ) {
            this.values( 0, newValueLeft, true );
            this.values( 1, newValueRight, true );
          }
          this._rangeStart = newVal;
        }
      }
    },
  });
})(jQuery);


$(function(){
  var months=new Array("JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC");
  // Slider
  $('#slider').dragslider({
    animate: true,
    range: true,
    rangeDrag: true,
    values: [0, 131],
    min: 0,
    max: 131,
    step: 1,
    slide: function (event, ui) {
      $( "#from-year" ).val(months[ui.values[ 0 ]%12] + ', ' + Math.floor(2000+ui.values[ 0 ]/12));
      $( "#to-year" ).val(months[ui.values[ 1 ]%12] + ', ' + Math.floor(2000+ui.values[ 1 ]/12));
    }
  });
  $( "#from-year" ).val($( "#slider" ).slider( "values", 0 ));
  $( "#to-year" ).val($( "#slider" ).slider( "values", 1 ));
});
