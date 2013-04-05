if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
  'use strict';  

  function Player() {
    this.id = null;
  }

  var proto = Player.prototype;

  proto.draw = function () {
  
     
  };

  return Player;
 
});