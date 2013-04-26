if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
  'use strict';  

  function InputStore() {
    this.last_input_time = null;
    this.last_input_seq = null;
  }  

  return InputStore;
 
});