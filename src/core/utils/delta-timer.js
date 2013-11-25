/*jshint -W079 */
/*global define, module, require, setInterval, clearInterval: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(function() {
  'use strict';  

  function DeltaTimer(rate, callback) {
    this.rate = rate || 100;
    this.callback = callback;
    this.delta = 0;
    this.lastCall = new Date().getTime();
    this.intervalId = null;
    this.time = 0;
    this.start();
  }

  var proto = DeltaTimer.prototype;

  proto.start = function () {
    if(this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(function(){
      var now = new Date().getTime();
      this.delta = (now - this.lastCall) / 1000.0;
      this.lastCall = now;
      this.time += this.delta;
      this.callback.call(this, this.delta, this.time);
    }.bind(this), this.rate);

  };

  proto.stop = function(){
    clearInterval(this.intervalId);
    this.intervalId = null;
  };

  return DeltaTimer;
 
});


 