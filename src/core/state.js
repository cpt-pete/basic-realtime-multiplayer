/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(["underscore"], function(_) {
  'use strict';  

  function State(){   
    this.indexes = {};
    this.actors = [];
  }

  State.prototype = {

    add : function(actor){
      this.actors.push(actor);
      this.indexes[actor.id] = this.actors.length - 1;
    },

    remove : function(id){       
      var index = this.get_index(id);   
      this.actors.splice( index , 1);

      delete this.indexes[id];

      for(var key in this.indexes){
        this.indexes[key] -= 1;
      }
    },
    
    get_index: function(id){
      return this.indexes[id];
    },

    find : function(id){
      
      return this.actors[ this.indexes[id] ];    
    },    

    as_array : function(){
      return this.actors;
    },

    snapshot : function(){
      
      var count = this.actors.length;
      var snapshot = {};

      for(var i = 0; i < count; i++){
        var actor = this.actors[i];
        snapshot[actor.id] = actor.snapshot();
      }

      return snapshot;
    }
  };

  return State;
 
});


 