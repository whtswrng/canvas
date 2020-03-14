import React, {useEffect, useState} from 'react';
import './App.css';
import MonacoEditor from 'react-monaco-editor';
import io from 'socket.io-client';
import './utils/Game';
import {Cell} from "./utils/Game";

declare var fabric: any;
declare var socket: any;

declare global {
    interface Window { game: any; socket: any, c1: Cell, c2: Cell, c3: Cell }
}

window.socket = io('http://localhost:3001');

function App() {
    const [code, setCode] = useState(localStorage.getItem('code') || 'const foo = 123;');
    let canvas: any;

    useEffect(() => {
        const map: any = {};
        onkeydown = onkeyup = function(e){
            map[e.keyCode] = e.type == 'keydown';
            if(map['13'] && map['16']) {
                e.preventDefault();
                eval(code);
                localStorage.setItem('code', code);
            }
        };
    }, [code]);

    useEffect(() => {
        window.socket.on('DRAW_GAME', (data: string) => {
            if(canvas) {
                const origClear = canvas.clear;
                canvas.clear = () => undefined;
                canvas.getObjects().forEach((o: any, i) => {
                    canvas.remove(o);
                });
                canvas.loadFromJSON(data);
                canvas.getObjects().forEach((o: any) => {
                    o.set('selectable', false);
                });
                canvas.clear = origClear;
            }
        });
        canvas = new fabric.Canvas('gameCanvas');
        canvas.selection = false;
        canvas.setBackgroundColor({source: 'https://i.pinimg.com/originals/a3/ab/61/a3ab617780e86740e3c0b4053b760c99.jpg', repeat: 'repeat'}, function () {
            canvas.renderAll();
        });
        handleCanvasMovement(canvas);
    }, []);

    const options = {
        selectOnLineNumbers: true
    };

    return (
        <div className="App">
            <MonacoEditor
                width="650"
                height="800"
                language="javascript"
                theme="vs-dark"
                value={code}
                options={options}
                onChange={setCode}
            />
            <canvas id="gameCanvas" width="500" height="500"></canvas>
        </div>
    );

    function handleCanvasMovement(canvas: any) {
        canvas.on('mouse:down', function(opt: any) {
            const evt = opt.e;
            canvas.isDragging = true;
            canvas.selection = false;
            canvas.lastPosX = evt.clientX;
            canvas.lastPosY = evt.clientY;
        });
        canvas.on('mouse:move', function(opt: any) {
            if (canvas.isDragging) {
                const e = opt.e;
                canvas.viewportTransform[4] += e.clientX - canvas.lastPosX;
                canvas.viewportTransform[5] += e.clientY - canvas.lastPosY;
                canvas.requestRenderAll();
                canvas.lastPosX = e.clientX;
                canvas.lastPosY = e.clientY;
            }
        });
        canvas.on('mouse:up', function(opt: any) {
            canvas.isDragging = false;
            canvas.selection = true;
        });

        canvas.on('mouse:wheel', (opt: any) => {
            const delta = opt.e.deltaY;
            let zoom = canvas.getZoom();
            zoom = zoom + delta/800;
            if (zoom > 3) zoom = 3;
            if (zoom < 0.10) zoom = 0.10;
            canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
            opt.e.preventDefault();
            opt.e.stopPropagation();
        })

    }
}

export default App;
