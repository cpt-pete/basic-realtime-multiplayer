if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
  'use strict';  

  return {

    toFixed : function(number, places) { 
      places = places || 3; 
      return parseFloat(number.toFixed(places));
    }
  
  };
 
});
