/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(function() {
  'use strict';  

  function InputStore() {
    this.inputs = [];
    //this.last_input_time = null;
    this.processed_input_seq = 0;
  }  

  var proto = InputStore.prototype;

  proto.clear = function(){
    this.inputs = [];
  };

  proto.add = function(inputs, input_time, input_seq){    
    this.inputs.push({inputs:inputs, time:input_time, seq:input_seq});    
  };

  proto.get_latest_input_sequence = function(){    
    return this.inputs.length > 0 ? this.inputs[this.inputs.length - 1].seq : 0;
  };  

  proto.clear_upto_and_including = function(index){
    this.inputs.splice(0, index +1);
  };

  proto.mark_all_processed = function(){
    this.processed_input_seq = this.get_latest_input_sequence();
  };

  proto.get_index_from_sequence = function(sequence){
    var count = this.inputs.length,
        index = -1;    

    for(var i = 0 ; i < count; i++){
      if(this.inputs[i].seq === sequence){
        index = i;
        break;
      }
    }

    return index;
  };

  proto.unprocessed = function(){
    var unprocessed = [];

    var l = this.inputs.length;

    for(var i = 0; i < l; i++){
      if(this.inputs[i].seq > this.processed_input_seq){
        unprocessed.push(this.inputs[i]);  
      }
    }

    return unprocessed;    
  };

  return InputStore;
 
});