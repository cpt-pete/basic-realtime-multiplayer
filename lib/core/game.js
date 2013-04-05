

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(["./../core/player"], function(Player) {
  'use strict';  

  var players = [];

  function Game() {
    
  }

  var proto = Game.prototype;

  proto.addPlayer = function () {

  };

  proto.check_collision = function( item ) {

    //Left wall.
    if(item.pos.x <= item.pos_limits.x_min) {
      item.pos.x = item.pos_limits.x_min;
    }

    //Right wall
    if(item.pos.x >= item.pos_limits.x_max ) {
      item.pos.x = item.pos_limits.x_max;
    }

    //Roof wall.
    if(item.pos.y <= item.pos_limits.y_min) {
      item.pos.y = item.pos_limits.y_min;
    }

    //Floor wall
    if(item.pos.y >= item.pos_limits.y_max ) {
      item.pos.y = item.pos_limits.y_max;
    }

    //Fixed point helps be more deterministic
    item.pos.x = item.pos.x.fixed(4);
    item.pos.y = item.pos.y.fixed(4);

  }; //game_core.check_collision


  proto.process_input = function( player ) {

    //It's possible to have recieved multiple inputs by now,
    //so we process each one
    var x_dir = 0;
    var y_dir = 0;
    var ic = player.inputs.length;
    if(ic) {
        for(var j = 0; j < ic; ++j) {
                //don't process ones we already have simulated locally
            if(player.inputs[j].seq <= player.last_input_seq) {
              continue;
            }

            var input = player.inputs[j].inputs;
            var c = input.length;
            for(var i = 0; i < c; ++i) {
                var key = input[i];
                if(key === 'l') {
                    x_dir -= 1;
                }
                if(key === 'r') {
                    x_dir += 1;
                }
                if(key === 'd') {
                    y_dir += 1;
                }
                if(key === 'u') {
                    y_dir -= 1;
                }
            } //for all input values

        } //for each input command
    } //if we have inputs

        //we have a direction vector now, so apply the same physics as the client
    var resulting_vector = this.physics_movement_vector_from_direction(x_dir,y_dir);
    if(player.inputs.length) {
        //we can now clear the array since these have been processed

        player.last_input_time = player.inputs[ic-1].time;
        player.last_input_seq = player.inputs[ic-1].seq;
    }

        //give it back
    return resulting_vector;

}; //game_core.process_input

  return Game;
 
});


 