import React from "react";
import './Tree.css';


export const Tree = ({onFileClick, currentFile, files}) => {
    return (
        <div className={'tree'}>
            {files.map((d) => <Item key={d.name} {...d} onFileClick={onFileClick}/>)}
            <button onClick={addFile}>Přidat soubor</button>
        </div>
    );

    function addFile() {
        const result = window.prompt('Název souboru');
        if(result) {
            window.socket.emit('ADD_FILE', result);
        }
    }

};

const Item = ({name, onFileClick}) => {
    return (
        <div className={'tree-item'}>
            <span onClick={() => onFileClick(name)}>{name}</span>
            <div className={'tree-item-actions'}>
                <span><small>[E]</small></span>
                <span><small>[X]</small></span>
            </div>
        </div>
    );
};

