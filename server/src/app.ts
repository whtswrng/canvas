import {Game} from "./game";
import {PlayerCell} from "./cell/player-cell";
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fabric = require('fabric').fabric;

const connections = [];
const game = new Game(connections);
const canvasSize = game.getCanvasSize();
game.startGame();

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
    connections.push(socket);
    const c1 = new PlayerCell(() => new fabric.Circle({radius: 20, fill: 'white', left: 250, top: 250}), 'c1', socket, canvasSize);
    const c2 = new PlayerCell(() => new fabric.Circle({radius: 20, fill: 'white', left: 250, top: 250}), 'c2', socket, canvasSize);
    const c3 = new PlayerCell(() => new fabric.Circle({radius: 20, fill: 'white', left: 250, top: 250}), 'c3', socket, canvasSize);

    game.addCell(c1);
    game.addCell(c2);
    game.addCell(c3);
    socket._c1 = c1;
    socket._c2 = c2;
    socket._c3 = c3;
    console.log('a user connected, creating cells!');

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
            game.attack(socketCell);
        }
    });

    socket.on('GET_SPECIALIZATION', ({cell}, ack) => {
        const socketCell = socket['_' + cell] as PlayerCell;
        if(socketCell) {
            ack(socketCell.getSpecialization());
        }
    });

    socket.on('GET_ATTRIBUTES', ({cell}, ack) => {
        const socketCell = socket['_' + cell] as PlayerCell;
        if(socketCell) {
            ack(socketCell.getAttributes());
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
