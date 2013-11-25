/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(function() {
  'use strict';  

  return {

    toFixed : function(number, places) { 
      places = places || 3; 
      return parseFloat(number.toFixed(places));
    },

     //Simple linear interpolation
    lerp : function(p, n, t) {
      /*var _t = Number(t); 
      _t = (Math.max(0, Math.min(1, _t))); */
      return (p + t * (n - p)); 
    }
  
  };
 
});
