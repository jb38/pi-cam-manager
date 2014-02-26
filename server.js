// parse the command line parameters
var args = process.argv.splice(2);
var argPort = 8080;
args.forEach(function(arg) {
  var a = arg.split('=');
  var param = a[0];
  var val = a[1];
  switch(param){
  case "-port" :
    argPort = val;
    break;
  }
});

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
app.set('port', argPort || process.env.PORT || 8080);

var CAMERA_STATES = [
  'FREE',
  'BUSY_VIDEO',
  'BUSY_IMAGE'
];

var CAMERA_STATE = CAMERA_STATES[0];

app.use('camera.js', function(err, req, res, next) {
  
});

app.use('/', express.static(path.join(__dirname, './src/app')));

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.send(500, 'Something broke!');
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port') + ' in ' + app.get('env') + ' mode');
});
