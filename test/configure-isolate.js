var Isolate = require('isolate');

global.isolate = Isolate.isolate;


Isolate.map('./window', {
  window: function() {
    return "hello";
  }
});