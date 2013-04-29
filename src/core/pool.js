
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
      this.items[id] = item;
    },

    remove : function(id){      
      delete this.items[id];
    },

    find_by_id : function(id){
      return this.items[id] ? this.items[id] : null;      
    },

    all : function(){
      return this.items;
    },

    to_array: function(){
      var key, ids = [];

      for (key in this.items) {
          if (this.items.hasOwnProperty(key)) {
              ids.push(this.items[key]);
          }
      }

      return ids;
    },

    list_ids : function(){
      var key, ids = [];

      for (key in this.items) {
          if (this.items.hasOwnProperty(key)) {
              ids.push(key);
          }
      }

      return ids;
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