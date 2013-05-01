/*global 
    define, 
    require: true 
*/

define(["./../core/delta-timer", "./mixins/input-funcs", "./../core/math-functions", "./../core/vector-functions"],
  function ( DeltaTimer, input_functions, math, vector_functions) {

    'use strict';
    
    function GameClient(io, state, renderer){     
      this.state = state; 
      this.renderer = renderer;
      this.updateid = 0;
      this.net_offset = 100;
      this.buffer_size = 2;               //The size of the server history to keep for rewinding/interpolating.      
      this.client_smoothing = true;       //Whether or not the client side prediction tries to smooth things out
      this.client_smooth = 25;            //amount of smoothing to apply to client update dest

      this.server_updates = [];
      this.input_seq = 0;

      this.connect(io);  
    }    

    GameClient.prototype = {

      start: function(me, others){
        
        this.local_time = 0;

        this.state.add_players([me]);
        this.state.add_players(others);

        this.me = this.state.find_player(me.id);
          
        new DeltaTimer(4, function(delta, time){
          this.local_time = time;
        }.bind(this));

        this.physics_loop = new DeltaTimer(15, this.update_physics.bind(this));

        this.update(new Date().getTime());
        
      },  
     
      stop: function(){
        this.physics_loop.stop();
        window.cancelAnimationFrame(this.updateid);
      },
     
      update: function(t){
        
        var inputs = this.sample_inputs();
        
        if(inputs.length){
          this.send_inputs(inputs);
        }

        this.process_net_updates();

        this.renderer.update();
        
        this.updateid = window.requestAnimationFrame( this.update.bind(this), this.viewportEl );
      },

      client_process_net_prediction_correction : function() {

        if(!this.server_updates.length){ 
          return;
        }

        var latest_server_data = this.server_updates[this.server_updates.length-1];
        var my_server_pos = latest_server_data.s[this.me.id].pos;
        var my_last_input_seq_on_server = latest_server_data.s[this.me.id].is;
        var input_store = this.me.input_store;
       
        if(my_last_input_seq_on_server !== input_store.processed_input_seq) {
          
          var lastinputseq_index = input_store.get_index_from_sequence(my_last_input_seq_on_server);

          console.log(input_store.inputs, my_last_input_seq_on_server, lastinputseq_index);

          if(lastinputseq_index !== -1) {

            input_store.clear_upto_and_including(lastinputseq_index);                  
            input_store.processed_input_seq = my_last_input_seq_on_server;

            this.me.pos.x = my_server_pos.x;
            this.me.pos.y = my_server_pos.y;
         
          console.log(this.me.pos);
          //  this.client_update_physics();
          //  this.client_update_local_position();

          } 
        } 
      },

      update_physics: function(){

      },

      send_inputs: function(inputs){
          
        //Update what sequence we are on now
        this.input_seq += 1;

        var time = this.local_time.toFixed(3);

        this.state.store_input(this.me.id, inputs, time, this.input_seq);
       
        //Send the packet of information to the server.
        //The input packets are labelled with an 'i' in front.
        var server_packet = 'i.';
        server_packet += inputs.join('-') + '.';
        server_packet += time.replace('.','-') + '.';
        server_packet += this.input_seq;
        //Go
        this.socket.send(  server_packet  );  
         
      },

      update_time_from_server : function(server_time){
        this.client_time = server_time - (this.net_offset/1000);        
      },

      record_server_update: function(server_update){        

        this.server_updates.push(server_update);

            //we limit the buffer in seconds worth of updates
            //60fps*buffer seconds = number of samples
        if(this.server_updates.length >= ( 60*this.buffer_size )) {
            this.server_updates.splice(0,1);
        } 
      },

      process_net_updates : function() {

          if(!this.server_updates.length){
            return;
          } 

          //First : Find the position in the updates, on the timeline
          //We call this current_time, then we find the past_pos and the target_pos using this,
          //searching throught the server_updates array for current_time in between 2 other times.
          // Then :  other player position = lerp ( past_pos, target_pos, current_time );

              //Find the position in the timeline of updates we stored.
          var current_time = this.client_time;
          var count = this.server_updates.length-1;
          var target = null;
          var previous = null;

              //We look from the 'oldest' updates, since the newest ones
              //are at the end (list.length-1 for example). This will be expensive
              //only when our time is not found on the timeline, since it will run all
              //samples. Usually this iterates very little before breaking out with a target.
          for(var i = 0; i < count; ++i) {

              var point = this.server_updates[i];
              var next_point = this.server_updates[i+1];

                  //Compare our point in time with the server times we have
              if(current_time > point.t && current_time < next_point.t) {
                  target = next_point;
                  previous = point;
                  break;
              }
          }

              //With no target we store the last known
              //server position and move to that instead
          if(!target) {
              target = this.server_updates[0];
              previous = this.server_updates[0];
          }

              //Now that we have a target and a previous destination,
              //We can interpolate between then based on 'how far in between' we are.
              //This is simple percentage maths, value/target = [0,1] range of numbers.
              //lerp requires the 0,1 value to lerp to? thats the one.

           if(target && previous) {

              var target_time = target.t;

              var difference = target_time - current_time;
              var max_difference = math.toFixed(target.t - previous.t, 3);
              var time_point = math.toFixed(difference/max_difference, 3);

                  //Because we use the same target and previous in extreme cases
                  //It is possible to get incorrect values due to division by 0 difference
                  //and such. This is a safe guard and should probably not be here. lol.
              if( isNaN(time_point) ) {
                time_point = 0;
              }
              if(time_point === -Infinity) {
                time_point = 0;
              }
              if(time_point === Infinity){
                time_point = 0;
              } 

                  //The most recent server update
              var latest_server_data = this.server_updates[ this.server_updates.length-1 ];
    
              for(var playerid in latest_server_data.s){

                /*if(this.me.id == playerid){
                  continue;
                }*/

                var player_latest = latest_server_data.s[playerid];

                if(!target.s[playerid] || !previous.s[playerid]){
                  continue;
                }

                var player_target = target.s[playerid];
                var player_previous = previous.s[playerid];

                var server_pos = player_latest.pos;
                var target_pos = player_target.pos;
                var past_pos = player_previous.pos;

                var pos_lerp = vector_functions.v_lerp(past_pos, target_pos, time_point);

                var player = this.state.find_player(playerid);

                if(this.client_smoothing) {
                    player.pos = vector_functions.v_lerp( player.pos, pos_lerp, this.physics_loop.delta * this.client_smooth);
                } else {
                    player.pos.x = pos_lerp.x;
                    player.pos.y = pos_lerp.y;
                }
              }

           

                  //Now, if not predicting client movement , we will maintain the local player position
                  //using the same method, smoothing the players information from the past.
              /*if(!this.client_predict) {

                      //These are the exact server positions from this tick, but only for the ghost
                  var my_server_pos = this.players.self.host ? latest_server_data.hp : latest_server_data.cp;

                      //The other players positions in this timeline, behind us and in front of us
                  var my_target_pos = this.players.self.host ? target.hp : target.cp;
                  var my_past_pos = this.players.self.host ? previous.hp : previous.cp;

                      //Snap the ghost to the new server position
                //  this.ghosts.server_pos_self.pos = this.pos(my_server_pos);
                  var local_target = this.v_lerp(my_past_pos, my_target_pos, time_point);

                      //Smoothly follow the destination position
                  if(this.client_smoothing) {
                      this.players.self.pos = this.v_lerp( this.players.self.pos, local_target, this._pdt*this.client_smooth);
                  } else {
                      this.players.self.pos = this.pos( local_target );
                  }
              }*/

          } //if target && previous

      }, //game_core.client_process_net_updates
 
      on_netmessage : function(data) {
       
      },

      on_disconnect : function(){

      },
     
      on_serverupdate_recieved : function(data){
        this.update_time_from_server(data.t);
        this.record_server_update(data);      
        this.client_process_net_prediction_correction();
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

      connect : function (io) {
          
        //Store a local reference to our connection to the server
        var socket = this.socket = io.connect();

        socket.on('entered-game', this.on_entered_game.bind(this));

        socket.on('player-joined', this.on_player_joined.bind(this));

        socket.on('player-left', this.on_player_left.bind(this));

        socket.on('onserverupdate', this.on_serverupdate_recieved.bind(this));


       /* //Sent when we are disconnected (network, server down, etc)
        this.socket.on('disconnect', this.on_disconnect.bind(this) );
        //Sent each tick of the server simulation. This is our authoritive update
        this.socket.on('onserverupdate', this.on_serverupdate_recieved.bind(this) );
        //Handle when we connect to the server, showing state and storing id's.
        this.socket.on('onconnected', this.on_connected.bind(this) );
        //On error we just show that we are not connected for now. Can print the data.
        this.socket.on('error', this.on_disconnect.bind(this) );
        //On message from the server, we parse the commands and send it to the handlers
        this.socket.on('message', this.on_netmessage.bind(this) );*/

    }

  };

  input_functions.call(GameClient.prototype);

  return GameClient;
    
});
