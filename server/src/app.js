// Import required modules
const express = require('express');
const {Entity} = require('./entity');
const {map, app, io, server} = require('./globals');
const { MobEntity } = require('./mob-entity');
const { createTree } = require('./game-map');
const { Material } = require('./material');



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

async function init() {
  // map.placeObject(10, 7, createTree())
  // map.placeObject(10, 6, createTree())
  const tree = new Material('tree', 30, 12, 7, 5, 'green', true, 'logs')
  tree.placeMaterial();
  const player = new Entity('Player', 100, 50, 0, 1, 'player');
  player.placeEntity(7, 7); // Place the player at the center of the map
  console.log('promise start')
  // await player.harvest(12, 7);
  console.log('promise end')

  setTimeout(() => {
    // player.goToPosition(player.x-30, player.y);
  }, 15000)

  const enemy = new MobEntity('Rat', 10, 0, 0, 1, 2, [{type: 'Varnish', min: 1, max: 4, chance: 80}]);
  enemy.placeEntity(11, 11); // Place an enemy nearby
  enemy.guardArea(7)

  player.attackEnemy(enemy)

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

