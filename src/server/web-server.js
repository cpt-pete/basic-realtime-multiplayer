/*jshint node:true */
/*jshint -W079 */
/*global define */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(['express'], function (express) {

  'use strict'; 

  return function(port){
    var app = express();    
   
    console.log('\t :: Express :: Listening on port ' + port );

    app.get('/', function (req, res) {
      res.sendfile('./index.html');
    });

    app.get('/*', function(req, res, next) {

      var file = req.params[0];
      res.sendfile( './' + file );

    }); 

    return app.listen( port );
  };  

});
