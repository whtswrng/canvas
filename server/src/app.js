// Import required modules
const express = require('express');
const {Entity} = require('./entity');
const {map, app, io, server} = require('./globals')



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


function init() {
  const char1 = new Entity('Player', 100, 50, 1, 0, 1);

  const player = new Entity('Player', 100, 50, 0, 1);
  player.placeEntity(7, 7, player); // Place the player at the center of the map

  const enemy = new Entity('Enemy', 80, 0, 0, 1);
  player.placeEntity(8, 8, enemy); // Place an enemy nearby

  const playerMapView = map.getEntityMap(player);
  map.print(playerMapView);

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
