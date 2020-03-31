import {Game, Item} from "./game";
import {PlayerCell} from "./cell/player-cell";
import {Files} from "./Files";
import * as fs from 'fs';
import {CellAttributes, CellConfig} from "./cell/cell";
import {shopItems} from "./utils/shop-items";
import {craftItems} from "./utils/craft-items";
import {PlayerPersistence} from "./player-persistence";
const app = require('express')();
const http = require('http').createServer(app);
export let io = require('socket.io')(http);
const fabric = require('fabric').fabric;

const gameEngineFileContent = fs.readFileSync(__dirname + '/files/game-engine.js', 'utf-8');
const connections = [];
const game = new Game(connections);
const canvasSize = game.getCanvasSize();
// const files = new Files([{name: 'game-engine.js', content: gameEngineFileContent, path: `${__dirname}/files/game-engine.js`}]);
const playerPersistenceMap: any = {};

game.startGame();

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
    socket.on('disconnect', function() {
        const i = connections.indexOf(socket);
        connections.splice(i, 1);
    });
    connections.push(socket);
    const playerName = 'l0w';
    const cellConfig: CellConfig = {
        attributes: {
            farm: 10,
            enchant: 10,
            craft: 10,
            energy: 50,
            exp: 0,
            power: 10,
            speed: 2.5,
            regeneration: 4,
            hp: 50,
        },
        dropList: [],
        expRange: [0, 0],
        isAttackable: true,
        respawnReach: 1600,
        type: 'PLAYER',
        respawnTimeInMS: 10000,
        spawnCoordinates: [5, 5],
        name: '',
    };

    if(playerPersistenceMap[playerName]) {
        const playerPersistence: PlayerPersistence = playerPersistenceMap[playerName];
        const [c1, c2] = playerPersistence.getCells();
        initPlayer(playerPersistence, c1, c2, playerPersistence.getFiles());
    } else {
        const files = new Files([]);
        const c1 = new PlayerCell(() => new fabric.Circle({radius: 20, fill: 'white', left: 250, top: 250}), socket, canvasSize, {...cellConfig, name: 'C1'});
        const c2 = new PlayerCell(() => new fabric.Circle({radius: 20, fill: 'white', left: 250, top: 250}), socket, canvasSize, {...cellConfig, name: 'C2'});
        const playerPersistence = new PlayerPersistence([c1, c2], 'L0w', files);
        initPlayer(playerPersistence, c1, c2, files);
        playerPersistenceMap[playerName] = playerPersistence;
    }

    function initPlayer(playerPersistence: PlayerPersistence, c1: PlayerCell, c2: PlayerCell, files: Files) {
        const config = playerPersistence.getPlayerConfig();

        if (config) {
            console.log('Initializing a player from stored config!');
            c1.initFromConfig(playerPersistence.getPlayerConfig().characters[0]);
            c2.initFromConfig(playerPersistence.getPlayerConfig().characters[1]);
        }

        c1.setSocket(socket);
        c2.setSocket(socket);
        game.addCell(c1);
        game.addCell(c2);
        socket._c1 = c1;
        socket._c2 = c2;
        socket._files = files as Files;
        socket._persistence = playerPersistence;
    }



    console.log('a user connected, creating cells!');

    socket.emit('FILES_UPDATED', socket._files.getFiles());

    socket.on('SAVE_FILE_NAME', ({oldName, newName}) => {
        socket._files.changeFileName(oldName, newName);
        socket.emit('FILES_UPDATED', socket._files.getFiles());
    });

    socket.on('DELETE_FILE', ({fileName}) => {
        socket._files.deleteFile(fileName);
        socket.emit('FILES_UPDATED', socket._files.getFiles());
    });

    socket.on('ADD_FILE', (fileName) => {
        socket._files.addFile(fileName);
        socket.emit('FILES_UPDATED', socket._files.getFiles());
    });

    socket.on('LOAD_FILE', (fileName, ack) => {
        const content = socket._files.loadFile(fileName);

        if(content !== undefined) {
            ack(content);
        }
    });

    socket.on('CHANGE_FILE', ({fileName, code}) => {
        socket._files.changeFile(fileName, code)
    });

    socket.on('MOVE', ({cell, degrees}) => {
        const socketCell = socket['_' + cell] as PlayerCell;
        if(socketCell) {
            socketCell.move(parseInt(degrees));
        }
    });

    socket.on('STOP', ({cell}) => {
        const socketCell = socket['_' + cell] as PlayerCell;
        if(socketCell) {
            socketCell.stop();
        }
    });

    socket.on('ATTACK', ({cell}) => {
        const socketCell = socket['_' + cell] as PlayerCell;
        if(socketCell) {
            socketCell.stop();
            game.attack(socketCell, 'power');
        }
    });

    socket.on('HARVEST', ({cell}) => {
        const socketCell = socket['_' + cell] as PlayerCell;
        if(socketCell) {
            socketCell.stop();
            game.attack(socketCell, 'farm');
        }
    });

    socket.on('USE_ITEM', ({cell, args}) => {
        const socketCell = socket['_' + cell] as PlayerCell;
        if(socketCell) {
            socketCell.useItem(...args)
        }
    });

    socket.on('GET_ATTRIBUTES', ({cell}, ack) => {
        const socketCell = socket['_' + cell] as PlayerCell;
        if(socketCell) {
            ack(socketCell.getAttributes());
        }
    });

    socket.on('BUY_ITEM', ({cell, itemId}, ack) => {
        const socketCell = socket['_' + cell] as PlayerCell;
        if(socketCell) {
            socketCell.buyItem(itemId);
        }
    });

    socket.on('CRAFT_ITEM', ({cell, itemId}, ack) => {
        const socketCell = socket['_' + cell] as PlayerCell;
        if(socketCell) {
            socketCell.craftItem(itemId);
        }
    });

    socket.on('GET_SHOP_ITEMS', ({cell}, ack) => {
        const socketCell = socket['_' + cell] as PlayerCell;
        if(socketCell) {
            ack(shopItems);
        }
    });

    socket.on('GET_CRAFT_ITEMS', ({cell}, ack) => {
        const socketCell = socket['_' + cell] as PlayerCell;
        if(socketCell) {
            ack(craftItems);
        }
    });

    socket.on('GET_ITEMS', ({cell}, ack) => {
        const socketCell = socket['_' + cell] as PlayerCell;
        if(socketCell) {
            ack(socketCell.getItems());
        }
    });

});

http.listen(3001, function(){
    console.log('listening on *:3000');
});
