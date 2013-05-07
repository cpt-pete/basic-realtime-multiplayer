
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
function() {
  'use strict';  

  function Point(x, y) { 
    this.x = x || 0;
    this.y = y || 0;
  }  

  var proto = Point.prototype;

  proto.clone = function(){
    return new Point(this.x, this.y);
  };

  proto.fromObject = function(obj){
    this.x = obj.x;
    this.y = obj.y;
  };

  proto.toObject = function() {
    return Object.create(null, {
      x: { value: this.x },
      y: { value: this.y }
    });
  };

  return Point;
 
});