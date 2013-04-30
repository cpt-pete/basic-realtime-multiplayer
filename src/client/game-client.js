/*global 
    define, 
    require: true 
*/

define(["./../core/game-state", "./../client/renderer", "./../core/delta-timer", "./mixins/input-funcs"],
  function (GameState, Renderer, DeltaTimer, input_functions) {

    'use strict';
    
    function GameClient(io, viewportEl){      
      this.viewportEl = viewportEl; 
      this.updateid = 0;
      this.net_offset = 100;
      this.buffer_size = 2;               //The size of the server history to keep for rewinding/interpolating.

      this.connect(io);  
    }    

    GameClient.prototype = {

      start_game: function(me, others){
        
        this.local_time = 0;
        this.state = new GameState();
        this.renderer = new Renderer(this.state, this.viewportEl);

        this.state.add_players([me]);
        this.state.add_players(others);

        this.me = this.state.find_player(me.id);
        this.input_seq = 0;
          
        new DeltaTimer(4, function(delta, time){
          this.local_time = time;
        });
        
      },  

      start: function(){
        this.update(new Date().getTime());
      },

      stop: function(){
        window.cancelAnimationFrame(this.updateid);
      },
     
      update: function(t){
        
        var inputs = this.sample_inputs();
        
        if(inputs.length){
          this.send_inputs(inputs);
        }
        
        this.updateid = window.requestAnimationFrame( this.update.bind(this), this.viewportEl );
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

      update_time_from_server = function(server_time){
        this.client_time = server_time - (this.net_offset/1000);
        console.log(this.client_time);
      },

      record_server_update: function(server_update){        

            //One approach is to set the position directly as the server tells you.
            //This is a common mistake and causes somewhat playable results on a local LAN, for example,
            //but causes terrible lag when any ping/latency is introduced. The player can not deduce any
            //information to interpolate with so it misses positions, and packet loss destroys this approach
            //even more so. See 'the bouncing ball problem' on Wikipedia.

    

            //Cache the data from the server,
            //and then play the timeline
            //back to the player with a small delay (net_offset), allowing
            //interpolation between the points.
        this.server_updates.push(server_update);

            //we limit the buffer in seconds worth of updates
            //60fps*buffer seconds = number of samples
        if(this.server_updates.length >= ( 60*this.buffer_size )) {
            this.server_updates.splice(0,1);
        } 
      },

      update_physics: function(){

      },

      on_netmessage : function(data) {
       
      },

      on_disconnect : function(){

      },
     
      on_serverupdate_recieved : function(data){
        this.update_time_from_server(data.t);
        this.record_server_update(data);      
      },

      on_entered_game : function(data){   
        this.start_game(data.me, data.others);         
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
