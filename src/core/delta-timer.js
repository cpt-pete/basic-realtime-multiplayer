/*global define, require, setInterval, clearInterval: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
  'use strict';  

  function DeltaTimer(rate, callback) {
    this.rate = rate || 100;
    this.callback = callback;
    this.delta = new Date().getTime();
    this.lastCall = new Date().getTime();
    this.intervalId = null;
    this.start();
  }

  var proto = DeltaTimer.prototype;

  proto.start = function () {
  
    this.intervalId = setInterval(function(){
      var now = new Date().getTime();
      this.delta = (now - this.lastCall) / 1000.0;
      this.lastCall = now;
      this.callback.call(this, this.delta);
    }.bind(this), this.rate);

  };

  proto.stop = function(){
    clearInterval(this.intervalId);
    this.intervalId = null;
  };

  return DeltaTimer;
 
});


 