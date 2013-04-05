/*jshint node:true */
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function () {
  'use strict'; 

  function Pool(){   
    this.items = {};
  }

  Pool.prototype = {

    add : function(item, id){
      if(!id){
        throw "pool requires an id";
      }

      this.items[id] = item;
    },

    remove : function(id){      
      delete this.items[id];
    },

    findById : function(id){
      return this.items[id] ? this.items[id] : null;      
    },

    all : function(){
      return this.items;
    },

    count : function(){
      var key, count = 0;

      for (key in this.items) {
          if (this.items.hasOwnProperty(key)) {
              count++;
          }
      }

      return count;
    }
  };

  return Pool;

});