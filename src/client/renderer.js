/*jshint browser:true */
/*global define: true */

define(["underscore"], function(_) {
  'use strict';

  var defaults = {
    viewport_el:"viewport"
  };

  function Renderer(options, game_client, world) {

    this.data = _.extend(defaults, options);

    var view = document.getElementById(this.data.viewport_el);

    this.game_client = game_client;
    this.view = view;
    this.state = game_client.state;
    this.world = world;


    view.width = this.world.w;
    view.height = this.world.h;

    this.context = this.view.getContext("2d");
  }

  Renderer.prototype = {

    start: function(){
      this.updateid = 0;
      this.update();
    },

    stop: function(){
      window.cancelAnimationFrame(this.updateid);
    },

    update: function(){
      var c = this.context;

      c.clearRect(0,0,this.world.w, this.world.h);

      var actors = this.state.as_array();
      var count = actors.length;

      for(var i = 0; i < count; i++){
        var actor = actors[i];
        actor.render(c);
      }

      c.font = "12px Arial";
      c.fillText( 'ping : ' +  this.game_client.ping, this.world.w - 70 , 10 );

      this.updateid = window.requestAnimationFrame( this.update.bind(this), this.view );
    }
  };

  return Renderer;

});


