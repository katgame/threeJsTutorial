const express = require('express');
const path = require('path');

const Server = require('socket.io');
const http = require('http');


const  fileURLToPath = require('url');
const app = express();
const server = http.createServer(app);
const io = new Server.Server(server);

// const __filenames = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filenames); 
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    
    res.sendFile(__dirname + '/index.html');
  });

  app.get('/throwdice', (req, res) => {
    io.emit('throwdice');
    res.statusCode = 200;
    res.end('working !!!');
  
  });

io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Broadcast received messages to all clients
  socket.on('html_change', (data) => {
    socket.broadcast.emit('html_update', data);
  });

    // Handle drawing data from a client and broadcast it to all others
    socket.on('diceroll', (data) => {
        socket.broadcast.emit('diceroll', data);
      });

      socket.on('scoreResult', (data) => {
        socket.broadcast.emit('scoreResult', data);
      });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});
server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });


