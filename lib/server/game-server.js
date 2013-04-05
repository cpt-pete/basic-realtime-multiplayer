/*jshint node:true */
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(
  ['./../server/web-server', 'socket.io', 'node-uuid', './../core/delta-timer', './../server/game-pool'], 
  function ( webserver, io, UUID, DeltaTimer, GamePool) {

  'use strict'; 

  var server, sio, client;
  var localtime = 0;  
  var messages = [];
  var verbose = true;
  var pool = new GamePool();

  function GameServer(port){    
    server = webserver(port);
    setupSocket();

    new DeltaTimer(4, function(){    
      localtime += this.delta;
    });
  }

  var setupSocket = function(){
    sio = io.listen(server);

    sio.configure(function (){

      sio.set('log level', 0);

      sio.set('authorization', function (handshakeData, callback) {
        callback(null, true); // error first callback style
      });

    });

    sio.sockets.on('connection', onConnected); //sio.sockets.on connection
  };

  var onConnected = function(client){

    client.userid = UUID();

        //tell the player they connected, giving them their id
    client.emit('onconnected', { id: client.userid } );

    console.log('\t socket.io:: player ' + client.userid + ' connected');

    var game = pool.findWithCapacity();
    
    if(game === null){
      createGame(client);
    }

            //now we can find them a game to play with someone.
            //if no game exists with someone waiting, they create one and wait.
      /* game_server.findGame(client);

            //Useful to know when someone connects
        
        

            //Now we want to handle some of the messages that clients will send.
            //They send messages here, and we send them to the game_server to handle.
        client.on('message', function(m) {

            game_server.onMessage(client, m);

        }); //client.on message

            //When this client disconnects, we want to tell the game server
            //about that as well, so it can remove them from the game they are
            //in, and make sure the other player knows that they left and so on.
        client.on('disconnect', function () {

                //Useful to know when soomeone disconnects
            console.log('\t socket.io:: client disconnected ' + client.userid + ' ' + client.game_id);
            
                //If the client was in a game, set by game_server.findGame,
                //we can tell the game server to update that game state.
            if(client.game && client.game.id) {

                //player leaving a game should destroy that game
                game_server.endGame(client.game.id, client.userid);

            } //client.game_id

        }); //client.on disconnect*/
  }

  var createGame = function(player){

  }


 /* var onMessage = function(client,message) {

    //Cut the message up into sub components
    var message_parts = message.split('.');
    //The first is always the type of message
    var message_type = message_parts[0];

    if(message_type == 'i') {
        //Input handler will forward this
      onInput(client, message_parts);
    } else if(message_type == 'p') {
      client.send('s.p.' + message_parts[1]);
    } 

  }; //game_server.onMessage

  var onInput = function(client, parts) {
    //The input commands come in like u-l,
    //so we split them up into separate commands,
    //and then update the players
    var input_commands = parts[1].split('-');
    var input_time = parts[2].replace('-','.');
    var input_seq = parts[3];

    //the client should be in a game, so
    //we can tell that game to handle the input
    if(client && client.game && client.game.gamecore) {
      client.game.gamecore.handle_server_input(client, input_commands, input_time, input_seq);
    }

  }; //game_server.onInput*/

  var proto = GameServer.prototype;

  proto.log = function() {
    if(verbose) console.log.apply(this,arguments);
  };
   
        //Define some required functions
  proto.createGame = function(player) {

          //Create a new game instance
      var thegame = {
              id : UUID(),                //generate a new id for the game
              player_host:player,         //so we know who initiated the game
              player_client:null,         //nobody else joined yet, since its new
              player_count:1              //for simple checking of state
          };

          //Store it in the list of game
      games[ thegame.id ] = thegame;

          //Keep track
      game_count++;

          //Create a new game core instance, this actually runs the
          //game code like collisions and such.
      /*thegame.gamecore = new game_core( thegame );
          //Start updating the game loop on the server
      thegame.gamecore.update( new Date().getTime() );

          //tell the player that they are now the host
          //s=server message, h=you are hosting

     player.send('s.h.'+ String(thegame.gamecore.local_time).replace('.','-'));
      console.log('server host at  ' + thegame.gamecore.local_time);
      player.game = thegame;
      player.hosting = true;
      
      this.log('player ' + player.userid + ' created a game with id ' + player.game.id);*/

          //return it
      return thegame;

  }; //game_server.createGame

      //we are requesting to kill a game in progress.
  proto.endGame = function(gameid, userid) {

      var thegame = this.games[gameid];

      if(thegame) {

              //stop the game updates immediate
          thegame.gamecore.stop_update();

              //if the game has two players, the one is leaving
          if(thegame.player_count > 1) {

                  //send the players the message the game is ending
              if(userid == thegame.player_host.userid) {

                      //the host left, oh snap. Lets try join another game
                  if(thegame.player_client) {
                          //tell them the game is over
                      thegame.player_client.send('s.e');
                          //now look for/create a new game.
                      this.findGame(thegame.player_client);
                  }
                  
              } else {
                      //the other player left, we were hosting
                  if(thegame.player_host) {
                          //tell the client the game is ended
                      thegame.player_host.send('s.e');
                          //i am no longer hosting, this game is going down
                      thegame.player_host.hosting = false;
                          //now look for/create a new game.
                      this.findGame(thegame.player_host);
                  }
              }
          }

          delete this.games[gameid];
          this.game_count--;

          this.log('game removed. there are now ' + this.game_count + ' games' );

      } else {
          this.log('that game was not found!');
      }

  }; //game_server.endGame

  proto.startGame = function(game) {

          //right so a game has 2 players and wants to begin
          //the host already knows they are hosting,
          //tell the other client they are joining a game
          //s=server message, j=you are joining, send them the host id
      game.player_client.send('s.j.' + game.player_host.userid);
      game.player_client.game = game;

          //now we tell both that the game is ready to start
          //clients will reset their positions in this case.
      game.player_client.send('s.r.'+ String(game.gamecore.local_time).replace('.','-'));
      game.player_host.send('s.r.'+ String(game.gamecore.local_time).replace('.','-'));

          //set this flag, so that the update loop can run it.
      game.active = true;

  }; //game_server.startGame

  proto.findGame = function(player) {

      this.log('looking for a game. We have : ' + this.game_count);

          //so there are games active,
          //lets see if one needs another player
      if(this.game_count) {
              
          var joined_a_game = false;

              //Check the list of games for an open game
          for(var gameid in this.games) {
                  //only care about our own properties.
              if(!this.games.hasOwnProperty(gameid)) continue;
                  //get the game we are checking against
              var game_instance = this.games[gameid];

                  //If the game is a player short
              if(game_instance.player_count < 2) {

                      //someone wants us to join!
                  joined_a_game = true;
                      //increase the player count and store
                      //the player as the client of this game
                  game_instance.player_client = player;
                  game_instance.gamecore.players.other.instance = player;
                  game_instance.player_count++;

                      //start running the game on the server,
                      //which will tell them to respawn/start
                  this.startGame(game_instance);

              } //if less than 2 players
          } //for all games

              //now if we didn't join a game,
              //we must create one
          if(!joined_a_game) {

              this.createGame(player);

          } //if no join already

      } else { //if there are any games at all

              //no games? create one!
          this.createGame(player);
      }

  }; //game_server.findGame



  return GameServer;

});





