const express = require('express');
const path = require('path');
const Server = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server.Server(server);
const userSockets = {};
const roomSockets = {}; // To store room IDs and their corresponding socket IDs

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  res.sendFile(__dirname + `/rooms/${roomId}.html`);
});

app.get('/throwdice', (req, res) => {
  io.emit('throwdice');
  res.send('Dice roll triggered for all users');
});

app.get('/throwdice/:userId', (req, res) => {
  const userId = req.params.userId;
  const socketId = userSockets[userId];

  if (socketId) {
    io.to(socketId).emit('throwdice');
    res.send(`Dice roll triggered for user ${userId}`);
  } else {
    res.status(404).send(`User ${userId} not connected`);
  }
});

app.get('/throwdice/room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const sockets = roomSockets[roomId];

  if (sockets && sockets.length > 0) {
    sockets.forEach(socketId => {
      io.to(socketId).emit('throwdice');
    });
    res.send(`Dice roll triggered for room ${roomId}`);
  } else {
    res.status(404).send(`Room ${roomId} not found`);
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('register', (userId, roomId) => {
    userSockets[userId] = socket.id;
    if (!roomSockets[roomId]) {
      roomSockets[roomId] = [];
    }
    roomSockets[roomId].push(socket.id);
    socket.join(roomId);
    console.log(`User ${userId} connected with socket ID ${socket.id} in room ${roomId}`);
  });

  socket.on('diceroll', (data) => {
    socket.broadcast.emit('diceroll', data);
  });

  socket.on('scoreResult', (data) => {
    socket.broadcast.emit('scoreResult', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
    for (const roomId in roomSockets) {
      roomSockets[roomId] = roomSockets[roomId].filter(id => id !== socket.id);
      if (roomSockets[roomId].length === 0) {
        delete roomSockets[roomId];
      }
    }
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
