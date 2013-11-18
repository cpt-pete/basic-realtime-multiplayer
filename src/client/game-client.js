/*jshint browser:true */
/*global define:true */

define(["underscore","./../core/delta-timer", "./mixins/input-funcs", "./../core/math-functions", "./../core/vector-functions", "./update-store"],
  function ( _, DeltaTimer, input_functions, math, vectors, UpdateStore) {

    'use strict';

    var defaults = {
      net_offset : 100,
      client_smooth : 25
    };
    
    function GameClient(options, io, state, renderer){          
      this.data = _.extend(defaults, options);

      this.state = state; 
      this.renderer = renderer;
      this.updateid = 0;

      this.updates = new UpdateStore();      
      this.seq = 0;

      this.server_time = 0;
      this.client_time = 0;

      this.connect(io);  
    }    

    GameClient.prototype = {

      start: function(me, others){
               
        this.state.add_players([me]);
        this.state.add_players(others);

        this.me = this.state.find_player(me.id);

        this.time_loop = new DeltaTimer(4, function(){});
        this.update_loop = new DeltaTimer(15, this.update.bind(this));
        
        this.renderer.start();      
      },  
     
      stop: function(){
        this.update_loop.stop();
        this.renderer.stop();
      },
     
      update: function(delta, time){
              
        var move = this.sample_inputs();

        if(move.length){          
          var t = math.toFixed(time, 3);   

          this.me.moves.add(move, t);

          var result = this.state.calculate_move(this.me.pos, this.me.vel, move, 0.015);
          this.me.accel = result.accel;

          this.server_move(t, move, result.accel, result.pos);          

          
        }
        
        this.state.tick(0.015);
        
    
       // this.process_server_updates();

      },
        
      server_move: function(time, move, accel, pos){         
        this.socket.emit("server_move", 
          {
            t:time,
            m:move,
            p:pos.toObject(),
            a:accel.toObject()
          }
        );  
         
      },

      move_autonomous : function(move, delta){
       
        var a = this.state.move_tick(this.me.pos, this.me.vel, this.me.accel, delta);
        
        this.me.pos = a.pos;
        this.me.vel = a.vel;             
      },

      move_corrected: function(time, pos, vel){       
        console.log("corrected", arguments);
        this.me.pos.set(pos);
        this.me.vel.set(vel);

        this.me.moves.clear_from_time(time);

        var moves = this.me.moves.all();
        var l = moves.length;
        for(var i = 0; i < l; i++){
          this.move_autonomous(moves[i], 0.015);
        }
      },

      move_confirmed:function(time){
        console.log("confirmed", arguments);
        this.me.moves.clear_from_time(time);
      },

      update_ping: function(t){
        this.ping = this.time_loop.time - t;
        console.log(this.ping);
      },
     
      process_server_updates : function() {

        if(!this.updates.any()){
          return;
        } 
       
       var previous, target, 
            latest = this.updates.latest(),
            surrounding = this.updates.surrounding( this.client_time );

        if(surrounding === null) {
          surrounding = {before: latest, after: latest };          
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
          var player = this.state.find_player( playerid );

          player.process_update(player_target, player_previous, this.physics_loop.delta, this.client_time, this.data.client_smooth);

          



          //player.pos.fromObject(actual_pos);
      
        }      

      },

      
      on_disconnect : function(){

      },
     
     /* on_serverupdate_recieved : function(data){
        this.update_time_from_server(data.t);
        this.updates.record(data);   

        if(data.s[this.me.id]) {
          this.adjust_position(data.t, data.s[this.me.id].pos);
        }
      },*/

      on_entered_game : function(data){   
        this.start(data.me, data.others);         
      },

      on_player_joined : function(data){
        this.state.add_players([data.player]);                 
      },

      on_player_left : function(data){
        var player = this.state.find_player(data.playerid);
        this.state.remove_player(player);        
      },

      on_good_move : function(time){
        this.update_ping(time);
        this.move_confirmed(time);
      },

      on_ajust_move : function(correction){
        this.update_ping(correction.t);
        this.move_corrected(correction.t, correction.p, correction.v);
      },

      connect : function (io) {
          
        var socket = this.socket = io.connect();

        socket.on('entered-game', this.on_entered_game.bind(this));

        socket.on('player-joined', this.on_player_joined.bind(this));

        socket.on('player-left', this.on_player_left.bind(this));

        //socket.on('onserverupdate', this.on_serverupdate_recieved.bind(this));

        socket.on('good_move', this.on_good_move.bind(this));

        socket.on('ajust_move', this.on_ajust_move.bind(this));       
    }

  };

  input_functions.call(GameClient.prototype);

  return GameClient;
    
});
