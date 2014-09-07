var http = require('http');
var app = require('http').createServer(handler),
  io = require('socket.io').listen(app),
  fs = require('fs');

function handler(request, response)
{
  S.log({}, "http request: " + request.url);

  var url = request.url, files = {
    "/": "../client/index.html",
    "/game.js": "../client/game.js",
    "/style.css": "../client/style.css",
    '/cb_testing.js': "../client/cb_testing.js",
    '/test.js': "../client/test.js"
  };

  if (url.indexOf("/?") == 0)
  {
    url = "/";
  }

  if (!files[url])
  {
    S.log({}, " 302 redirecting");
    response.writeHead(302, { "Location": "/" } );
    response.end();
    return;
  }

  fs.readFile(files[url], function(error, data) {
    if (!error)
    {
      S.log({}, "  200 found");
      response.writeHead(200);
      return response.end(data);
    }
    S.log({}, " 404 not found");
    response.writeHead(404);
    response.end("not found");
  });
}

var S = {};

S.games = [];
S.unique_number = 1;

// DEBUG BEGIN
S.log = function(socket, s)
{
  console.log("[" + (new Date()).getTime() + "] [" + socket.id + "] " + s);
}
// DEBUG END


io.sockets.on('connection', function(socket){
  S.log(socket, "connected");
  // Emit a "message" to the socket who just connected.
  socket.emit('chat message', {message: 'Welcome to my test chat.' });
  // "recieve" event handler
  socket.on('chat message', function(data){
    io.sockets.in('r'+data.rn).emit('chat message', data);
  });
  socket.on('pairing_option', function(data){
    switch (data.type){
      case 'create':
        S.log(socket, "Room Number: "+S.unique_number);
        socket.join('r'+S.unique_number);
        socket.emit('session_created', S.unique_number);
        S.unique_number++;
      break;
      case 'join':
        S.log(socket, "Join Number: "+data.number);
        socket.join('r'+data.number);
        socket.emit('session_created', data.number);
      break;
    }

  });
});


app.listen(8000);

console.log(typeof testing);

console.log('Ready!');