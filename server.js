var IS_TEST = false;

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
var spawn   = require('child_process').spawn;
var tee     = require('tee');

var CAMERA_OUTPUT_DIR = path.join(__dirname, './src/app/camera/');

var app = express();
app.set('port', argPort || process.env.PORT || 80);

// path for bower-installed components
app.use('/components', express.static(path.join(__dirname, './bower_components')));

/**
 * List the previously captured contents
 */
app.use('/get.items', function(req, res) {

  fs.readdir(CAMERA_OUTPUT_DIR, function(err, files) {
    
    files = [].concat(files || []);

    images = files.filter(function(file) { 
      
      return file.indexOf('.jpg') !== -1 && file.indexOf('_tn') === -1; 
    
    }).sort().map(function(file) {

      return {

        image: 'camera/' + file,
        thumbnail: 'camera/' + file.replace('.jpg', '_tn.jpg') 

      };

    });

    videos = files.filter(function(file) {

      return file.indexOf('.mp4') !== -1;

    }).sort().map(function(file) {

      return {

        video: 'camera/' + file

      };

    });

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ 
      images: images,
      videos: videos
    }));

  });

});

/**
 * Take a picture
 */
app.use('/take.picture', function(req, res) {
  
  if (IS_TEST) {
    
    fs.readdir(CAMERA_OUTPUT_DIR, function(err, files) {
    
      files = [].concat(files || []);

      images = files.filter(function(file) { 
        
        return file.indexOf('.jpg') !== -1 && file.indexOf('_tn') === -1; 
      
      }).sort().map(function(file) {

        return {

          image: 'camera/' + file,
          thumbnail: 'camera/' + file.replace('.jpg', '_tn.jpg') 

        };

      });

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ images: images.splice(images.length - 1, 1) }));

    });
  
  } else {

    var filename =  new Date().getTime() + '.jpg'; 

    var output_file = path.join(CAMERA_OUTPUT_DIR + filename);

    var child = exec(
      '/opt/vc/bin/raspistill -t 50 -e jpg -th 133:100:10 -o ' + output_file,
      function() {
        exec('/usr/bin/convert ' + output_file + ' thumbnail:' + output_file.replace('.jpg', '_tn.jpg'));


            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({ images: [
              {
                image: 'camera/' + filename,
                thumbnail: 'camera/' + filename
              }
            ]}));

//          });

      });
  }

});

app.use('/take.video', function(req, res) {

  if (IS_TEST) {

    res.send(JSON.stringify({ foo: 'bar' }));

  } else {

    var filename =  new Date().getTime() + '.mp4'; 

    var output_file = path.join(CAMERA_OUTPUT_DIR + filename);

    spawn(
      '/opt/vc/bin/raspivid -o - | tee ' + output_file
    );

  }

});

app.use('/', express.static(path.join(__dirname, './src/app')));

app.use(function(req, res) {
  res.send(500, 'Something broke!');
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port') + ' in ' + app.get('env') + ' mode');
});
