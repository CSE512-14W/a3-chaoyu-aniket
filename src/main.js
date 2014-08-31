var circlesmap;
var slider;

$(document).ready(function(){
  circlesmap = circlesmap_generator();
  slider = slider_generator();
  WORLDMAP.init();
});

$(window).resize(function(){
  circlesmap.initCanvasSize();
  slider.redraw();
});
