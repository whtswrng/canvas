import React, {useEffect, useState} from 'react';
import './App.css';
import 'node_modules/react-grid-layout/css/styles.css';
import 'node_modules/react-resizable/css/styles.css';
import MonacoEditor from 'react-monaco-editor';
import './utils/Game';
import {Cell} from "./utils/Game";
import {Tree} from "./Tree";
import GridLayout from 'react-grid-layout';

declare var fabric: any;
declare var socket: any;
declare var canvas: any;

declare global {
    interface Window { game: any; socket: any, c1: Cell, c2: Cell, c3: Cell, runGameEngine: any, canvas: any }
}

function App() {
    const [currentFile, setCurrentFile] = useState('');
    const [newFileName, setNewFileName] = useState(currentFile);
    const [code, setCode] = useState('');
    const [files, setFiles] = useState([]);

    useEffect(() => {
        setNewFileName(currentFile);
    }, [currentFile]);

    useEffect(() => {
        onFileClick('game-engine.js');
    }, []);

    useEffect(() => {
        const map: any = {};
        onkeydown = onkeyup = function(e){
            map[e.keyCode] = e.type == 'keydown';
            if(map['13'] && map['16']) {
                e.preventDefault();
                eval(`(async () => {${code}})()`);
                window.socket.emit('CHANGE_FILE', {fileName: currentFile, code});
            }
        };
    }, [code, currentFile]);

    useEffect(() => {
        window.socket.on('FILES_UPDATED', (files) => {
            setFiles(files);

            if(files.find((f) => f.name === currentFile)) {
                window.socket.emit('LOAD_FILE', currentFile, (code) => {
                    setCurrentFile(currentFile);
                    setCode(code);
                });
            } else {
                console.log('loading default file');
                window.socket.emit('LOAD_FILE', files[0].name, (code) => {
                    setCurrentFile(files[0].name);
                    setCode(code);
                });
            }
        });

        return () => {
            window.socket.off('FILES_UPDATED');
        }
    }, [currentFile, files]);

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
        window.canvas = new fabric.Canvas('game-canvas');
        window.canvas.selection = false;
        window.canvas.setBackgroundColor({source: 'https://i.pinimg.com/originals/a3/ab/61/a3ab617780e86740e3c0b4053b760c99.jpg', repeat: 'repeat'}, function () {
            window.canvas.renderAll();
        });
        handleCanvasMovement(window.canvas);
    }, []);

    const options = {
        selectOnLineNumbers: true
    };
    const layout = [
        {i: 'a', x: 0, y: 0, w: 1, h: 2, static: true},
        {i: 'b', x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4},
        {i: 'c', x: 4, y: 0, w: 1, h: 2}
    ];

    return (
        <div className="App">
            <GridLayout className="layout" layout={layout} cols={12} rowHeight={30} width={1200}>
                <div key="a">a</div>
                <div key="b">b</div>
                <div key="c">c</div>
            </GridLayout>
            <Tree onFileClick={onFileClick} currentFile={currentFile} files={files}/>
            <div className={'editor-container'}>
                <div className={'header'}>
                    <input placeholder={"foo-bar.js"} onChange={(e) => setNewFileName(e.target.value)} value={newFileName}/>
                    <button onClick={saveFileName}>Save</button>
                    <button onClick={deleteCurrentFile}>Delete</button>
                </div>
                <MonacoEditor
                    width="100%"
                    height="100%"
                    language="javascript"
                    theme="vs-dark"
                    value={code}
                    options={options}
                    onChange={setCode}
                />
            </div>
            <canvas id="game-canvas" width={450} height={400}></canvas>
        </div>
    );

    function saveFileName() {
        if(window.confirm('Do you really wanna SAVE this file name?')) {
            setCurrentFile(newFileName);
            window.socket.emit('SAVE_FILE_NAME', {oldName: currentFile, newName: newFileName});
        }
    }

    function deleteCurrentFile() {
        if(window.confirm('Do you really wanna REMOVE this file?')) {
            window.socket.emit('DELETE_FILE', {fileName: currentFile});
        }
    }

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
