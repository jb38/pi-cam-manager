var IS_TEST = true;

// parse the command line parameters
var args = process.argv.splice(2);
var argPort = 80;
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
var fs      = require('fs');
var http    = require('http');
var path    = require('path');
var exec    = require('child_process').exec;

var app = express();
app.set('port', argPort || process.env.PORT || 80);

var CAMERA_OUTPUT_DIR = path.join(__dirname, './src/app/camera/');

app.use('/components', express.static(path.join(__dirname, './bower_components')));

app.use('/get.items', function(req, res) {

  fs.readdir(CAMERA_OUTPUT_DIR, function(err, files) {
    
    files = [].concat(files || []);

    files.sort();

    var fileStr = ('"camera/' + files.join('", "camera/') + '"').replace('""', '');

    res.send('{ "files": [ ' + fileStr + ' ] }');

  });

});

app.use('/take.picture', function(req, res) {
  
  if (IS_TEST) {
    
    fs.readdir(CAMERA_OUTPUT_DIR, function(err, files) {
    
      files = [].concat(files || []);

      files.sort();
      files.reverse();

      var fileStr = ('"camera/' + files.join('", "camera/') + '"').replace('""', '');

      res.send('{ "files": [ ' + fileStr + ' ] }');

    });
  
  } else {

    var filename =  new Date().getTime() + '.png'; 

    var output_file = path.join(CAMERA_OUTPUT_DIR + filename);

    var child = exec(
      '/opt/vc/bin/raspistill -t 500 -e png -o ' + output_file,
      function(error, stdout, stderr) {

        if (!!error) {
          res.send(error);
        } else {
          res.send('{ "files": [ "' + filename + '" ] }');
        }

      });
  }

});

app.use('/', express.static(path.join(__dirname, './src/app')));

app.use(function(req, res) {
  res.send(500, 'Something broke!');
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port') + ' in ' + app.get('env') + ' mode');
});
