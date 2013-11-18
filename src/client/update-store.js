/*jshint browser:true */
/*global define, undescore: true */



define(["underscore"], function(_) {
  'use strict';  
  
  var defaults = { buffer_size : 120};

  function UpdateStore(options) {
    this.data = _.extend(defaults, options);
    this.updates = [];
  }

  UpdateStore.prototype = {

    record : function(update){

      this.updates.push(update);

      if(this.updates.length >= ( this.data.buffer_size )) {
        this.updates.splice(0,1);
      }
    },

    any : function(){
      return this.updates.length > 0;
    },

    latest : function(){
      return this.updates[this.updates.length - 1];
    },

    surrounding: function(time){
      var count = this.updates.length-1;      
    
          //We look from the 'oldest' updates, since the newest ones
          //are at the end (list.length-1 for example). This will be expensive
          //only when our time is not found on the timeline, since it will run all
          //samples. Usually this iterates very little before breaking out with a target.
      for(var i = 0; i < count; ++i) {

          var before = this.updates[i];
          var after = this.updates[i+1];

          //Compare our point in time with the server times we have
          if(time > before.t && time < after.t) {            
            return{ before:before, after:after };
          }
      }

      return null;

    }

  };

  return UpdateStore;
 
});




 