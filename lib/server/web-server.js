/*jshint node:true */
/*global define: true */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['http', 'express'], function (http, express) {

  'use strict'; 

  var app;

  return function(port){
    app = express();    
   
    console.log('\t :: Express :: Listening on port ' + port );

    app.get('/', function (req, res) {
      res.sendfile('./index.html');
    });

    app.get('/*', function(req, res, next) {

      var file = req.params[0];

      res.sendfile( './' + file );

    }); 

    return  app.listen( port );
  };  

});
