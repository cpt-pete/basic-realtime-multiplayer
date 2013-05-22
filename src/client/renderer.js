/*jshint browser:true */
/*global define: true */

define(function() {
  'use strict';  
  
  function Renderer(state, view) {

    view.width = state.w;
    view.height = state.h;

    this.view = view;
    this.context = view.getContext("2d");
    this.state = state;
  }

  Renderer.prototype = {

    start: function(){
      this.updateid = 0;
      this.update();
    },

    stop: function(){
      window.cancelAnimationFrame();
    },    

    update: function(){
      var c = this.context;

      c.clearRect(0,0,this.state.w, this.state.h);      

      

      var players = this.state.players.as_array();
      var count = players.length;

      for(var i = 0; i < count; i++){
        var player = players[i];
        c.fillStyle =player.colour;
        c.fillRect(player.pos.x - 5, player.pos.y - 5, 10, 10);          
      }
      this.updateid = window.requestAnimationFrame( this.update.bind(this), this.view );      
    }
  };

  return Renderer;
 
});


 