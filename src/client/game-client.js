/*jshint browser:true */
/*global define */

define(["underscore","./../core/utils/delta-timer", "./input", "./update-store", "./renderer", "./../core/state", "./../core/utils/math-functions", "./../core/utils/point", "./../core/player", "./../core/world", "./transport-client"],
  function ( _, DeltaTimer, input, UpdateStore, Renderer, State, math, Point, Player, World, Transport) {

    'use strict';

    var defaults = {
      physics_rate: 15,
      physics_delta: 15 / 1000
    };

    function GameClient(options){
      this.data = _.extend(defaults, options);

      this.state = new State();
      this.world = new World(400, 500);
      this.renderer = new Renderer({}, this, this.world);

      this.updates = new UpdateStore();

      this.client_time = 0;

      this.start_time = new Date().getTime();
          
      this.connect();
    }

    GameClient.prototype = {

      start: function(me){
        this.update_loop = new DeltaTimer(this.data.physics_rate, this.update.bind(this));

        this.renderer.start();
      },

      stop: function(){
        this.update_loop.stop();
        this.renderer.stop();
      },

     time: function(){
        return new Date().getTime() - this.start_time;
      },

      update: function(delta, time){

        // update other players
        this.process_server_updates();

        var t = this.time();

        // get move based on inputs
        var move = input.get_move();

        // save move
        this.me.moves.add(move, t);
        this.move_autonomous( move, this.data.physics_delta );
        this.server_move(t, move, this.me.accel, this.me.pos);
      },

      server_move: function(time, move, accel, pos){
        this.transport.to_server(        
          'move', 
          {
            t:time,
            m:move,
            p:pos.toObject(),
            a:accel.toObject()
          });
      },
     
      move_autonomous : function(move, delta){
        this.me.controller.apply_move( move , delta );
      },

      move_corrected: function(time, pos, vel){
        this.me.pos.set( pos );
        this.me.vel.set( vel );
        this.me.moves.clear_from_time( time );

        var moves = this.me.moves.all();
        var l = moves.length;

        for(var i = 0; i < l; i++){
          this.move_autonomous( moves[i].move, this.data.physics_delta );
        }
      },

      move_confirmed:function(time){
        this.me.moves.clear_from_time(time);
      },

      update_ping: function(t){
        var now = this.time();
        this.ping = now - t;
      },

      process_server_updates : function() {

        if(!this.updates.any()){
          return;
        }

       var previous, target,
            latest = this.updates.latest(),
            surrounding = this.updates.surrounding( this.client_time );

        if(surrounding === null) {
          return;
        }

        previous = surrounding.before;
        target = surrounding.after;

        for(var playerid in latest.s){
          if(this.me.id === parseInt(playerid, 10)){
            continue;
          }

          if(!target.s[playerid] || !previous.s[playerid]){
            continue;
          }

          var player_target = target.s[ playerid ];
          var player_previous = previous.s[ playerid ];
          var player = this.state.find( playerid );

          if(player){
            this.process_update( player, player_previous, previous.t, player_target, target.t, this.data.physics_delta, this.client_time );
          }
        }
      },

      find_pos : function(past_pos, past_time, target_pos, target_time, time){

        var range = target_time - past_time;
        var difference = time - past_time;
        var time_point = math.toFixed( difference / range, 3);

        return Point.lerp(past_pos, target_pos, time_point);
      },

      process_update: function( player, past, past_time, target, target_time, delta, time){
        var past_pos = new Point( past.pos.x, past.pos.y );
        var target_pos = new Point( target.pos.x, target.pos.y );

        var new_pos = this.find_pos( past_pos, past_time, target_pos, target_time, time );
        var smoothed = Point.lerp( player.pos, new_pos, delta * 20 );

        player.pos = smoothed;
      },

      on_disconnect : function(){
        this.stop();
        this.state.clear();
        this.me = null;
      },

      on_serverupdate_recieved : function(data){
        this.client_time = Math.floor(data.t - this.ping / 2 / 1000);
        this.updates.record(data);
      },

      on_joined : function(data){

        var state_snapshot = data.state;
        var player_id = parseInt(data.id, 10);

        for(var id in state_snapshot){
          var player = Player.from_snapshot(state_snapshot[id]);
          this.state.add(player);

          if(parseInt(id, 10) === player_id){
            this.me = player;
          }
        }

        this.start();
      },

      on_player_joined : function(snapshot){
        var player = Player.from_snapshot(snapshot);
        this.state.add(player);
      },

      on_player_left : function(id){
        this.state.remove(id);
      },

      on_event: function(e){
        switch(e.name){
          case "player-joined": this.on_player_joined(e.data);
            break;
          case "player-left": this.on_player_left(e.data);
            break;
          case "joined": this.on_joined(e.data);
            break;
        }
      },

      on_good_move : function(time){
        this.update_ping(time);
        this.move_confirmed(time);
      },

      on_ajust_move : function(correction){
        this.update_ping(correction.t);
        this.move_corrected(correction.t, correction.p, correction.v);
      },

      connect : function () {
    
        this.transport = new Transport();
        this.transport.connect();

        this.transport.on('disconnect', this.on_disconnect.bind(this));
        this.transport.on('event', this.on_event.bind(this));
        this.transport.on('onserverupdate', this.on_serverupdate_recieved.bind(this));
        this.transport.on('good_move', this.on_good_move.bind(this));
        this.transport.on('ajust_move', this.on_ajust_move.bind(this));
    }

  };

  return GameClient;

});
