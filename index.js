/*** Reference for Socket.io app: https://blog.xmartlabs.com/2012/12/21/geographic-chat-app-with-nodejs-part2/ **/

var sslRedirect = require('heroku-ssl-redirect');
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

http.listen(port, function(){
  console.log('listening on *:' + port);
});

// enable ssl redirect
app.use(sslRedirect());

// Routing
app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + 'index.html');
});

// Chatroom
var numUsers = 0;

io.on('connection', function (socket) {
  var addedUser = false;
  console.log('server connection');

  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    console.log('new message');
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    console.log('add user ', username);
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    console.log('user join');
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
    console.log(numUsers);
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    console.log('typing');
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // start listening for coords
  // socket.on('send coords', function(data) {
  //   socket.broadcast.emit('load coords', data);
  // });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    console.log('disconnect');
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
