// Import required modules
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors'); // Import the cors middleware
const { GameMap } = require('./game-map');
const {Entity} = require('./entity');


// Create an Express app
const app = express();
app.use(cors());
const server = http.createServer(app);

// Create a Socket.IO instance attached to the server
export const io = socketIO(server);

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Define a route to serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start the server
const PORT = process.env.PORT || 9090;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  init();
});

export const map = new GameMap(1000, 1000);

function init() {
  const char1 = new Entity('Player', 100, 50, 1, 0, 1);
  map.generateMap();

  // Set up a connection event for new Socket.IO connections
  io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle messages from clients
    socket.on('message', (data) => {
      console.log('Message from client:', data);

      // Broadcast the received message to all connected clients
      io.emit('message', data);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });

}