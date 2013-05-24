/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(
function(  ) {
  'use strict';  

  function World(w, h) { 
    this.w = w;
    this.h = h;
  }  
  
  return World;
 
});