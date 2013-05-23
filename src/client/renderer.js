/*jshint browser:true */
/*global define: true */

define(["underscore"], function(_) {
  'use strict';  

  var defaults = {
    viewport_el:"viewport"      
  };
  
  function Renderer(options, game_client) {

    this.data = _.extend(defaults, options);

    var view = document.getElementById(this.data.viewport_el);

    this.game_client = game_client;
    this.view = view;
    this.state = game_client.state;

    view.width = this.state.w;
    view.height = this.state.h;
   
    this.context = this.view.getContext("2d");    
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

      c.font = "12px Arial";
      c.fillText( this.game_client.ping, this.state.w - 30 , 10 );

      this.updateid = window.requestAnimationFrame( this.update.bind(this), this.view );      
    }
  };

  return Renderer;
 
});


 