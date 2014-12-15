//Node js Producer/Consumer server
'use strict';

//Node modules
var fs = require('fs');
var cluster = require('cluster');
var http = require('http');
var os = require('os');
var url = require('url');
var cluster = require('cluster');

//My modules
var Fractal = require('./FractalComputer');
var hsv = require('./hsv');
var PNG = require('pngjs').PNG;

//variables
var queue = [];
var idle = [process.argv[2]];
var work = [process.argv[2]];
var res = [];

for (var i = 0; i < process.argv[2]; i++) {
	idle[i] = 'f';
}

var server = http.createServer(function(request, response){
	//parse url
	var path = url.parse(request.url).pathname;
	var str = path.split("/"); // /m/width/height/minx/maxx/miny/maxy/maxiter
	var width = parseInt(str[2], 10);
	var height = parseInt(str[3], 10);
	var minx = parseInt(str[4]), maxx = parseInt(str[5]), miny = parseInt(str[6]), maxy = parseInt(str[7]), maxi = parseInt(str[8]);
	
	console.log(width, height);

	//check if url given is compatible
	if( str[1] != 'm' || str.length != 9 ){
		console.log("error");
		response.writeHead(400, {"Content-Type": "text/html"});
		response.write("<!DOCTYPE html>");
		response.write("<html>");
		response.write("<head>");
		response.write("<title>Hello World Page</title>");
		response.write("</head>");
		response.write("<body>");
		response.write("Error: Give /m/width/height/minx/maxx/miny/maxy/maxiter");
		response.write("</body>");
		response.write("</html>");
		response.end();
		return;
	}

	//push all the data needed into an array (0-7)
	var a = [width, height, minx, maxx, miny, maxy, maxi, response];

	//check if the queue is full
	if (queue.length > process.argv[3] - 1){
		response.writeHead(503, {"Content-Type": "text/html"});
		response.write("<!DOCTYPE html>");
		response.write("<html>");
		response.write("<head>");
		response.write("<title>Hello World Page</title>");
		response.write("</head>");
		response.write("<body>");
		response.write("Error: queue is full");
		response.write("</body>");
		response.write("</html>");
		response.end();
		return;
	} else{
		queue.push(a);
		for (var i = 0; i < idle.length; i++) {
			if(idle[i] == 'f'){
				console.log('got in');
				var q = queue.pop();
				res[i] = q[7];
				cluster.workers[i+1].send({width:q[0], height:q[1], minx:q[2], maxx:q[3], miny:q[4], maxy:q[5], maxi:q[6], id:i});
				idle[i] = 't';
				return;
			}
		}
	}

	/*else{
		
		for (var i = 0; i < idle.length; i++) {
			if(idle[i] == 'f'){
				res[i] = response;
				cluster.workers[i+1].send({width:width, height:height, minx:minx, maxx:maxx, miny:miny, maxy:maxy, maxi:maxi, id:i});
				idle[i] = 't';
				return;
			}
		}
	}*/

});

if (cluster.isMaster) {
  // Fork workers
  for (var i = 0; i < 5; i++) {
    var worker = cluster.fork();
    worker.id = i;
    worker.on('message', function(msg){
    	var r = res[msg.id];
    	fs.createReadStream('out' + msg.id + '.png')
    		.pipe(new PNG({
	        filterType: -1
	    }))
	    .on('parsed', function() {
	    	r.writeHead(200, {"Content-Type": "image/png"});
	        this.pack().pipe(r);
	    });
		
		//check if anything in queue
		if(queue.length > 0){
			var q = queue.pop();
			res[msg.id] = q[7];
			cluster.workers[msg.id+1].send({width:q[0], height:q[1], minx:q[2], maxx:q[3], miny:q[4], maxy:q[5], maxi:q[6], id:msg.id});
		} else{
			idle[msg.id] = 'f';
		}
  	});
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('worker ' + worker.process.pid + ' died');
  });

  server.listen(8080);
} 
else {
  	// Workers can share any TCP connection
  	// In this case its a HTTP server
  	process.on('message', function(msg){
  		var width = msg.width, height = msg.height;
  		var minx = msg.minx, maxx = msg.maxx;
  		var miny = msg.miny, maxy = msg.maxy;
  		var maxi = msg.maxi;

	 	var png = new PNG({width:width, height:height, filterType: -1});
		for(var i=0; i<height; ++i){
			var y = miny + (i * 1.0/(height-1)) * (maxy-miny);
			for(var j=0; j<width; ++j){
				//Jim stuff
				var x = minx + (j*1.0/(width-1))*(maxx-minx);
				var iter = Fractal.iterations_to_infinity(x,y,maxi);
				var a = hsv.map_color(iter,maxi);
				
				//my stuff
				var indx = (width * i + j) << 2;
				png.data[indx] = a[0];
				png.data[indx+1] = a[1];
				png.data[indx+2] = a[2];
				png.data[indx+3] = 255;
			}
		}
		var dst = fs.createWriteStream('out' + msg.id + '.png');
		png.pack().pipe(dst);

		dst.on('finish', function(){
			process.send({id:msg.id});
		});
		return;

  	});
}