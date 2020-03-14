import * as fs from "fs";
import {generateNumberBetween} from "./utils/between";
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fabric = require('fabric').fabric;

const connections = [];
const canvasSize = 5000;
const canvas = new fabric.StaticCanvas(null, { width: canvasSize, height: canvasSize });
let localCanvas = new fabric.StaticCanvas(null, { width: canvasSize, height: canvasSize });
const CONFIG = {
    visibilityRadius: 300
};

startGame();

function startGame() {
    const text = new fabric.Text('Welcome!', {
        left: 2,
        top: 2,
        fill: '#ff0e4c',
        angle: 15,
    });
    canvas.add(text);

    setInterval(() => {
        console.log('generating an object!');
        const left = generateNumberBetween(0, canvasSize);
        const top = generateNumberBetween(0, canvasSize);
        const circle = new fabric.Circle({
            radius: 10, fill: 'blue', left, top
        });
        canvas.add(circle);
    }, 2000);

    (async function _tick() {
        for(let i = 0; i < connections.length; i++) {
            connections[i].emit('DRAW_GAME', renderGame(connections[i]._gameObject));
        }
        await waitFor(45);
        _tick();
    })();

    (async function _move() {
        for(let i = 0; i < connections.length; i++) {
            const socket = connections[i];
            const circle = socket._gameObject;

            if(circle._degree === undefined || ! circle._isMoving) continue;

            const movement = {
                degrees: parseInt(circle._degree),
                amount: 3.5
            };

            const angle = (movement.degrees - 90) / 180 * Math.PI;
            const left = circle.left + (movement.amount * Math.cos(angle));
            const top = circle.top + (movement.amount * Math.sin(angle));

            if(left <= 0 || left >= canvasSize - (circle.radius * 2) || top <= 0 || top >= canvasSize - (circle.radius * 2)) {
                continue;
            }

            circle.left = left;
            circle.top = top;
            circle.setCoords();
        }
        await waitFor(50);
        _move();
    })()
}

function waitFor(ms: number): Promise<void> {
    return new Promise((res) => setTimeout(res, ms));
}

function renderGame(gameObject) {
    localCanvas.clear();
    canvas.getObjects().forEach((o) => {
        if(Math.abs(o.left - gameObject.left) <= CONFIG.visibilityRadius && Math.abs(o.top - gameObject.top) <= CONFIG.visibilityRadius) {
            localCanvas.add(fabric.util.object.clone(o));
        }
    });

    const result = JSON.stringify(localCanvas);

    return result;
}

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket){
    connections.push(socket);
    const circle = new fabric.Circle({
        radius: 20, fill: 'green', left: 250, top: 250
    });
    canvas.add(circle);
    socket._gameObject = circle;
    console.log('a user connected');

    socket.on('MOVE_ANGLE', (degree: number) => {
        // socket._gameObject = circle;
        socket._gameObject._degree = degree;
        socket._gameObject._isMoving = true;
        console.log('moving degree: ', degree);
    });

});

http.listen(3001, function(){
    console.log('listening on *:3000');
});
