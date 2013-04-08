/*global 
    define: true 
*/

define([], function() {
  'use strict';  
  
  function Renderer(state, el) {
    el.width = state.w;
    el.height = state.h;
  }

  Renderer.prototype = {

  };

  return Renderer;
 
});


 