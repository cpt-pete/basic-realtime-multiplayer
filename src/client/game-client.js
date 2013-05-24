/*jshint browser:true */
/*global define:true */

define(["underscore","./../core/delta-timer", "./mixins/input-funcs", "./update-store", "./renderer", "./../core/state", "./../core/math-functions", "./../core/point", "./../core/player", "./../core/world"],
  function ( _, DeltaTimer, input_functions, UpdateStore, Renderer, State, math, Point, Player, World) {

    'use strict';

    var defaults = {
      physics_rate: 15,
      physics_delta: 15 / 1000
    };
    
    function GameClient(options, io){          
      this.data = _.extend(defaults, options);

      this.state = new State();
      this.world = new World(400, 500);
      this.renderer = new Renderer({}, this, this.world);

      this.updates = new UpdateStore();     

      this.server_time = 0;
      this.client_time = 0;

      this.start_time = new Date().getTime();

      this.connect(io);  
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
      
        this.process_server_updates();

        //this.state.client_update( this.data.physics_delta, this.me );  

        var t = this.time();
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
            console.log(playerid, latest.s);
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
        var past_pos = new Point( past.pos_x, past.pos_y );
        var target_pos = new Point( target.pos_x, target.pos_y );

        var new_pos = this.find_pos( past_pos, past_time, target_pos, target_time, time );  
        var smoothed = Point.lerp( player.pos, new_pos, delta * 20 );

        player.pos = smoothed;   
      },
      
      on_disconnect : function(){

      },
     
     on_serverupdate_recieved : function(data){
       console.log(data);
        this.client_time = Math.floor(data.t - this.ping / 2 / 1000);
        this.updates.record(data);   
      },

      on_joined : function(snapshot){   
        console.log(snapshot);
        this.me = Player.from_snapshot(snapshot);
        this.state.add(this.me);  
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

      connect : function (io) {
          
        var socket = this.socket = io.connect();

        //socket.on('joined', this.on_joined.bind(this));

        //socket.on('player-joined', this.on_player_joined.bind(this));

        socket.on('event', this.on_event.bind(this));

        socket.on('onserverupdate', this.on_serverupdate_recieved.bind(this));

        socket.on('good_move', this.on_good_move.bind(this));

        socket.on('ajust_move', this.on_ajust_move.bind(this));       
    }

  };

  input_functions.call(GameClient.prototype);

  return GameClient;
    
});
