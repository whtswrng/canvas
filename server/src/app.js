// Import required modules
const express = require("express");
const { map, app, io, server } = require("./globals");
const { Connection } = require("./connection");
const { Entity } = require("./entity/entity");
const { getRandomInt } = require("./utils");
const { enemy } = require("./mocks");
const { EntityControl } = require("./entity/entity-control");
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
    const connection = new Connection(socket, map);
    const player = new Entity({
      id: getRandomInt(0, 1000000),
      name: "Player",
      hp: 100,
      kind: "light-mage",
      mana: 50,
      speed: 0,
      experience: 1,
      attackRange: 4,
      connection,
      map,
      inventory: [
        {
          type: "hands",
          equiped: true,
          name: "Hands of Aros",
          attrs: { hp: 10, mana: 10, power: 2, defense: 10 },
        },
        {
          type: "weapon",
          kind: "axe",
          equiped: true,
          name: "Harvesting tool",
          attrs: { hp: 10, mana: 10, power: 2, defense: 10 },
        },
      ],
    });
    const controls = [
      {
        type: "autoDefend",
        actionValue: true,
      },
      {
        type: "controls",
        actionValue: true,
      },
      {
        type: "basic",
        actionType: "attackEnemy",
        actionValue: "",
        condition: "ifTargetLvl",
        conditionValue: "isLowerThan",
        conditionComparisonValue: "99",
      },
      {
        type: "pathing",
        actionType: "goToPosition",
        actionValue: "5 9",
        condition: "",
        conditionValue: "",
        conditionComparisonValue: "",
      },
      {
        type: "pathing",
        actionType: "goToPosition",
        actionValue: "7 13",
        condition: "",
        conditionValue: "",
        conditionComparisonValue: "",
      },
    ];
    const entityControl = new EntityControl(player, controls);
    player.placeEntity(5, 5); // Place the player at the center of the map
    entityControl.init();

    // player.attackEnemy(enemy)

    // player.goToPosition(8, 9); // Place the player at the center of the map

    // setInterval(printMap, 2000);

    function printMap() {
      console.log("--------------------------");
      const playerMapView = map.getEntityMap(player);
      map.print(playerMapView);
    }

    socket.on("UPDATE_CONTROLS", ({ playerId, list }) => {
      console.log("============", list);
      // entityControl.setControls(list);
    });

    // Handle messages from clients
    socket.on("message", (data) => {
      console.log("Message from client:", data);

      // Broadcast the received message to all connected clients
      io.emit("message", data);
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}
