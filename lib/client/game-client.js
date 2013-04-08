/*global 
    define, require: true 
*/

define(["./../core/game-state"],function (GameState) {

    'use strict';
    
    function GameClient(io){
      
      this.connect(io);      
    }    

    GameClient.prototype = {

      on_netmessage : function(data) {
       
      },

      on_disconnect : function(){

      },

      on_connected : function(data){       
      },

      on_serverupdate_recieved : function(){

      },

      on_entered_game : function(data){   
        console.log(data);
        this.game_state = new GameState();
        this.me = this.game_state.add_player(data.me);

        for(var i = 0; i < data.others.length; i++){
          this.game_state.add_player(data.others[i]);          
        }      
      },

      on_player_joined : function(data){
        console.log("on_player_joined", data);
        this.game_state.add_player(data.player);                 
      },

      on_player_left : function(data){
        console.log("on_player_left", data);
        this.game_state.remove_player(data.player);         
        
      },

      update : function() {
      
      },
      
      connect : function (io) {
          
        //Store a local reference to our connection to the server
        var socket = this.socket = io.connect();

        socket.on('connect', this.on_connected.bind(this));

        socket.on('entered-game', this.on_entered_game.bind(this));

        socket.on('player-joined', this.on_player_joined.bind(this));

        socket.on('player-left', this.on_player_left.bind(this));


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

  return GameClient;
    
});
