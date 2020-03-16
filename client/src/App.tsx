import React, {useEffect, useState} from 'react';
import './App.css';
import MonacoEditor from 'react-monaco-editor';
import io from 'socket.io-client';
import './utils/Game';
import {Cell} from "./utils/Game";
import {Tree} from "./Tree";

declare var fabric: any;
declare var socket: any;
declare var canvas: any;

declare global {
    interface Window { game: any; socket: any, c1: Cell, c2: Cell, c3: Cell, runGameEngine: any, canvas: any }
}


function App() {
    const [currentFile, setCurrentFile] = useState('game-engine.js');
    const [code, setCode] = useState('');
    const [files, setFiles] = useState([]);

    useEffect(() => {
        onFileClick('game-engine.js');
    }, []);

    useEffect(() => {
        const map: any = {};
        onkeydown = onkeyup = function(e){
            map[e.keyCode] = e.type == 'keydown';
            if(map['13'] && map['16']) {
                e.preventDefault();
                eval(code);
                window.socket.emit('CHANGE_FILE', {fileName: currentFile, code});
            }
        };
    }, [code, currentFile]);

    useEffect(() => {
        window.socket.on('FILES_UPDATED', (files) => {
            setFiles(files);
        })
    }, [files]);

    useEffect(() => {
        window.socket.on('DRAW_GAME', ({game, c1, c2, c3}) => {
            if(canvas) {
                const origClear = canvas.clear;
                canvas.clear = () => undefined;
                canvas.getObjects().forEach((o: any, i) => {
                    canvas.remove(o);
                });
                canvas.loadFromJSON(game);
                canvas.getObjects().forEach((o: any) => {
                    o.set('selectable', false);
                });
                window.c1.setGameObject(c1);
                window.c2.setGameObject(c2);
                window.c3.setGameObject(c3);
                canvas.clear = origClear;
            }
        });
        window.canvas = new fabric.Canvas('gameCanvas');
        window.canvas.selection = false;
        window.canvas.setBackgroundColor({source: 'https://i.pinimg.com/originals/a3/ab/61/a3ab617780e86740e3c0b4053b760c99.jpg', repeat: 'repeat'}, function () {
            window.canvas.renderAll();
        });
        handleCanvasMovement(window.canvas);
    }, []);

    const options = {
        selectOnLineNumbers: true
    };

    return (
        <div className="App">
            {/*<Tree onFileClick={onFileClick} currentFile={currentFile} files={files}/>*/}
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

    function onFileClick(fileName: string) {
        window.socket.emit('LOAD_FILE', fileName, (code) => {
            setCurrentFile(fileName);
            setCode(code);
        });
    }

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
