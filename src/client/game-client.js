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

      update_physics: function(){

      },

      on_netmessage : function(data) {
       
      },

      on_disconnect : function(){

      },
     
      on_serverupdate_recieved : function(data){
        console.log(data);
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
