if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
  function() {
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
    
    //Simple linear interpolation
    lerp : function(p, n, t) {
      var _t = Number(t); 
      _t = (Math.max(0, Math.min(1, _t))); 
      return (p + _t * (n - p)); 
    },

    //Simple linear interpolation between 2 vectors
    v_lerp : function(v,tv,t) { 
      return { x: this.lerp(v.x, tv.x, t), y:this.lerp(v.y, tv.y, t) }; 
    }

  };
 
});
