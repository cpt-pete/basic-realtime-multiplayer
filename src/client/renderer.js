/*jshint browser:true */
/*global define: true */

define([], function() {
  'use strict';  
  
  function Renderer(state, context) {
    this.context = context;
    this.state = state;
  }

  Renderer.prototype = {
    update: function(){
      var c = this.context;

      c.clearRect(0,0,this.state.w, this.state.h);      

      c.fillStyle ="#FF0000";

      var players = this.state.players.as_array();
      var count = players.length;

      for(var i = 0; i < count; i++){
        var player = players[i];
        c.fillRect(player.pos.x - 5, player.pos.y - 5, 10, 10);  
      }
      
    }
  };

  return Renderer;
 
});


 