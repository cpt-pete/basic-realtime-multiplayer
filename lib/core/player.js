if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function() {
  'use strict';  

  function Player(game_instance, player_instance) {
    this.instance = player_instance;
    this.game = game_instance;

     //Set up initial values for our state information
    this.pos = { x:0, y:0 };
    this.size = { x:16, y:16, hx:8, hy:8 };
    this.state = 'not-connected';
    this.color = 'rgba(255,255,255,0.1)';
    this.info_color = 'rgba(255,255,255,0.1)';
    this.id = '';

        //These are used in moving us around later
    this.old_state = {pos:{x:0,y:0}};
    this.cur_state = {pos:{x:0,y:0}};
    this.state_time = new Date().getTime();

        //Our local history of inputs
    this.inputs = [];

        //The world bounds we are confined to
    this.pos_limits = {
        x_min: this.size.hx,
        x_max: this.game.world.width - this.size.hx,
        y_min: this.size.hy,
        y_max: this.game.world.height - this.size.hy
    };

  }

  var proto = Player.prototype;

  proto.draw = function () {
  
       //Set the color for this player
    this.game.ctx.fillStyle = this.color;

        //Draw a rectangle for us
    this.game.ctx.fillRect(this.pos.x - this.size.hx, this.pos.y - this.size.hy, this.size.x, this.size.y);

        //Draw a status update
    this.game.ctx.fillStyle = this.info_color;
    this.game.ctx.fillText(this.state, this.pos.x+10, this.pos.y + 4);

  };

  return Player;
 
});