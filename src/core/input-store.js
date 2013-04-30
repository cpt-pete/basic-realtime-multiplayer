if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
  'use strict';  

  function InputStore() {
    this.inputs = [];
    //this.last_input_time = null;
    this.last_input_seq = null;
  }  

  var proto = InputStore.prototype;

  proto.clear = function(){
    this.inputs = [];
  };

  proto.add = function(inputs, input_time, input_seq){
    this.inputs.push({inputs:inputs, time:input_time, seq:input_seq});
    console.log(this.inputs);
  };

 /* proto.unprocessed = function(){
    var unprocessed = [];

    var l = this.inputs.length;

    for(var i = 0; i < l; i++){
      if(this.inputs[j].seq > this.last_input_seq){
        unprocessed.push(this.inputs[i]);  
      }
    }

    return unprocessed;    
  };*/

  return InputStore;
 
});