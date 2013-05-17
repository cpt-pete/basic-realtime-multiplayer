/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(function() {
  'use strict';  

  function MoveStore() {
    this.moves = [];
    //this.last_input_time = null;
   // this.processed_seq = 0;
  }  

  var proto = MoveStore.prototype;

  proto.clear = function(){
    this.moves = [];
  };

  proto.all = function(){
    return this.moves;
  };

  proto.any = function(){
    return this.moves.length > 0;
  };

  proto.add = function(moves, time, seq){    
    this.moves.push({moves:moves, time:time, seq:seq});    
  };

 /* proto.get_last_sequence = function(){    
    return this.moves.length > 0 ? this.moves[this.moves.length - 1].seq : 0;
  };  */

  proto.clear_from_time = function(time){
    var index = this.get_index_from_time(time);
    this.moves.splice(0, index +1);
  };
/*
  proto.mark_all_processed = function(){
    this.processed_seq = this.get_last_sequence();
  };
*/
  proto.get_index_from_time = function(time){
    var count = this.moves.length,
        index = -1;    

    for(var i = 0 ; i < count; i++){
      if(this.moves[i].time === time){
        index = i;
        break;
      }
    }

    return index;
  };
/*
  proto.unprocessed = function(){
    var unprocessed = [];

    var l = this.moves.length;

    for(var i = 0; i < l; i++){
      if(this.moves[i].seq > this.processed_seq){
        unprocessed.push(this.moves[i]);  
      }
    }

    return unprocessed;    
  };*/

  return MoveStore;
 
});