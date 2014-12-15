var http = require('http');
var net = require('net');
var url = require('url');

// make a request to a tunneling proxy
var options = {
port: 8080
};

var req = http.request(options);
req.end();

req.on('connect', function(res, socket, head) {
	console.log('got connected!');

	// make a request over an HTTP tunnel
	socket.write('GET / /m/500/500/-2/2/-2/2/1000 HTTP/1.0\r\n\r\n');

	socket.on('data', function(chunk) {
	  console.log(chunk.toString());
	});

	socket.on('end', function() {
	  proxy.close();
	});

	socket.on('error', function(e){
		console.log(e.message);
		socket.destroy();
	});
});

req.on('error', function(e){
	console.log(e.message);
	req.destroy();
});