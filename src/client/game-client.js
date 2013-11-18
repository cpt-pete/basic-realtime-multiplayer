/*jshint browser:true */
/*global define:true */

define(["underscore","./../core/delta-timer", "./mixins/input-funcs", "./../core/math-functions", "./../core/vector-functions", "./update-store", "./../core/point"],
  function ( _, DeltaTimer, input_functions, math, vectors, UpdateStore, Point) {

    'use strict';


    var defaults = {
      net_offset : 100,
      client_smooth : 25,
      physics_rate: 15,
      physics_delta: 15 / 1000
    };
    
    function GameClient(options, io, state, renderer){          
      this.data = _.extend(defaults, options);

      this.state = state; 
      this.renderer = renderer;
      this.updateid = 0;

      this.updates = new UpdateStore();     

      this.server_time = 0;
      this.client_time = 0;

      this.connect(io);  
    }    

    GameClient.prototype = {

      start: function(me, others){
               
        this.state.add_players([me]);
        this.state.add_players(others);
        this.me = this.state.find_player(me.id);

        this.state.start();

        this.update_loop = new DeltaTimer(this.data.physics_rate, this.update.bind(this));
        
        this.renderer.start();      
      },  
     
      stop: function(){
        this.state.stop();
        this.update_loop.stop();
        this.renderer.stop();
      },
     
      update: function(delta, time){
      
        this.process_server_updates();

        this.state.client_update( this.data.physics_delta, this.me );  

        var t = this.state.time();
        var move = this.sample_inputs();

        this.me.moves.add(move, t);
        this.move_autonomous( move, this.data.physics_delta );
        this.server_move(t, move, this.me.accel, this.me.pos);                           
      },
        
      server_move: function(time, move, accel, pos){   
        this.send_server_message(
          this.socket, 
          "server_move", {
            t:time,
            m:move,
            p:pos.toObject(),
            a:accel.toObject()
          });         
      },

      send_server_message: function(socket, message, data){ 
        setTimeout(function(){
          socket.emit( message , data ); 
        }, 0);         
      },

      move_autonomous : function(move, delta){    
        this.me.apply_move( move );  
        this.me.update(delta);        
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
        var now = this.state.time(); 
        this.ping = now - t;
      },
     
      process_server_updates : function() {

        if(!this.updates.any()){
          return;
        } 
       
       var previous, target, 
            latest = this.updates.latest(),
            surrounding = this.updates.surrounding( this.time );

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
          var player = this.state.find_player( playerid );      

          player.process_update(player_target, target.t, player_previous, previous.t, this.data.physics_delta, this.time);
      
        }      

      },

      
      on_disconnect : function(){

      },
     
     on_serverupdate_recieved : function(data){
        this.time = Math.floor(data.t - this.ping / 2 / 1000);
        this.updates.record(data);   
      },

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

        socket.on('onserverupdate', this.on_serverupdate_recieved.bind(this));

        socket.on('good_move', this.on_good_move.bind(this));

        socket.on('ajust_move', this.on_ajust_move.bind(this));       
    }

  };

  input_functions.call(GameClient.prototype);

  return GameClient;
    
});
