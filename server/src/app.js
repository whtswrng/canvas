// Import required modules
const express = require("express");
const { map, app, io, server } = require("./globals");
const { User } = require("./user");
const { createPlayer } = require("./mocks");
require("./mocks");

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Define a route to serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Start the server
const PORT = process.env.PORT || 9090;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  init();
});

async function init() {
  // Set up a connection event for new Socket.IO connections
  io.on("connection", (socket) => {
    console.log("A user connected");
    const user = new User(socket, [createPlayer('Ferda', socket, 2, 2), createPlayer('Blobko', socket, 5, 9)]);
    user.init();

    // function printMap() {
    //   console.log("--------------------------");
    //   const playerMapView = map.getEntityMap(player);
    //   map.print(playerMapView);
    // }
  });
}
