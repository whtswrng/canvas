const express = require('express');
const http = require('http');
const { GameMap } = require("./game-map");
const socketIO = require('socket.io');
const cors = require('cors'); // Import the cors middleware

// Create an Express app
const app = express();
app.use(cors());
const server = http.createServer(app);

const map = new GameMap(1000, 1000);
map.generateMap();

// Create a Socket.IO instance attached to the server
const io = socketIO(server);

module.exports = {
	map,
	io,
	app,
	server
}