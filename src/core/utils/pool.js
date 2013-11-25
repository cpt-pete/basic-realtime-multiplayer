/*jshint -W079 */
/*global define, module, require: true */

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(function () {
  'use strict'; 

  function Pool(){   
    this.oItems = {};
    this.aItems = [];
  }

  Pool.prototype = {

    add : function(item, id){
      this.oItems[id] = item;
      this.aItems.push(item);
    },

    remove : function(id){    
      var item = this.find_by_id(id);
      this.aItems.splice(this.aItems.indexOf(item), 1);
      delete this.oItems[id];
    },

    find_by_id : function(id){
      return this.oItems[id] ? this.oItems[id] : null;      
    },

    as_array : function(){
      return this.aItems;
    }
  };

  return Pool;

});