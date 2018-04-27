var sslRedirect = require('heroku-ssl-redirect');
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 5000;
var _ = require('lodash')


http.listen(port, function() {
    // console.log('listening on *:' + port);
});

// enable ssl redirect
app.use(sslRedirect());

// Routing
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + 'index.html');
});

// Chatroom
var numUsers = 0;
var users = {}

io.on('connection', function (socket) {
    var addedUser = false;
    // console.log('server connection');

    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        var user = users[socket.id];
        if (user) {
            console.log('new message from', user.username);

            // we tell the client to execute 'new message'
            socket.broadcast.emit('new message', {
                username: user.username,
                message: data
            });
        }
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        console.log('add user ', username);

        // first connection
        users[socket.id] = {
            username: username,
            status: 'connected',
            lat: null,
            lon: null
        }

        // emit a new user login
        socket.emit('login', {
            username: username,
            numUsers: Object.keys(users).length
        });

        // broadcast that all users
        socket.broadcast.emit('user joined', {
            username: username,
            numUsers: Object.keys(users).length
        });

        // update all users
        socket.broadcast.emit('users', users);

        console.log('add users: ', users);
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
      // console.log('typing');
      var user = users[socket.id]
      if (user) {
          socket.broadcast.emit('typing', {
              username: user.username
          });
      }
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
      var user = users[socket.id]
      if (user) {
          socket.broadcast.emit('stop typing', {
              username: user.username
          });
      }
  });


  socket.on('set_status', function (status) {
      var user = users[socket.id]
      if (user) {
          user.status = status;

          // update all users
          socket.broadcast.emit('users', users);
      }

      console.log("set status", users);
  })

  // update locations from client
  socket.on('location', function (data) {
    console.log('update location');

      // break;
      var user = users[socket.id];
      if (user) {
          if (user.status == 'requested_help') {
              socket.broadcast.emit('user_requested_help',
              {
                username: user.username,
                numUsers: _.size(users)
              }
            );
          }

          user.lat = data.lat;
          user.lon = data.lon;

          console.log('adding location', user);

          // update all users
          socket.broadcast.emit('users', users);
      }
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {

      var user = users[socket.id];

      if (user) {
          var username = user.username;
          delete users[socket.id];

          // echo globally that this client has left
          socket.broadcast.emit('user left', {
              username: username,
              numUsers: _.size(users)
          });

          // update all locations
          socket.broadcast.emit('locations', users);

          console.log('user disconnected', user);
      } else {
          console.log('no user found');
      }
  })

});
