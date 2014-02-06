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
