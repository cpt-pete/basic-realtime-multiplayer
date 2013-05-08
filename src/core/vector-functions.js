/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(["./math-functions"],
  function(maths) {
  'use strict';  

  return {

    v_add : function(a,b) { 
      return { x:(a.x+b.x), y:(a.y+b.y) }; 
    },
    //Subtract a 2d vector with another one and return the resulting vector
    v_sub : function(a,b) { 
      return { x:(a.x-b.x),y:(a.y-b.y) }; 
    },
    
    //Multiply a 2d vector with a scalar value and return the resulting vector
    v_mul_scalar : function(a,b) { 
      return {x: (a.x*b) , y:(a.y*b) }; 
    },      

    //Simple linear interpolation between 2 vectors
    v_lerp : function(v,tv,t) { 
      return { x: maths.lerp(v.x, tv.x, t), y:maths.lerp(v.y, tv.y, t) }; 
    }

  };
 
});
