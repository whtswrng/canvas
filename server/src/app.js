// Import required modules
const express = require('express');
const {Entity} = require('./entity');
const {map, app, io, server} = require('./globals');
const { MobEntity } = require('./mob-entity');



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
  const player = new Entity('Player', 100, 50, 0, 1, 'player');
  player.placeEntity(7, 7); // Place the player at the center of the map
  player.goToPosition(player.x+30, player.y);

  setTimeout(() => {
    player.goToPosition(player.x-30, player.y);
  }, 15000)

  // const enemy = new MobEntity('Rat', 80, 0, 0, 1);
  // enemy.placeEntity(11, 11); // Place an enemy nearby
  // enemy.guardArea(7)

  // player.attackEnemy(enemy)

  setInterval(printMap, 2000);

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

  function printMap() {
    console.log('--------------------------')
    const playerMapView = map.getEntityMap(player);
    map.print(playerMapView);
  }
}

