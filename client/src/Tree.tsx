import React from "react";
import './Tree.css';


export const Tree = ({onFileClick, currentFile, files}) => {
    return (
        <div className={'tree'}>
            {files.map((d) => <Item key={d.name} {...d} isActive={d.name === currentFile} onFileClick={onFileClick}/>)}
            <button className={'tree-add-button'} onClick={addFile}><strong>+</strong></button>
        </div>
    );

    function addFile() {
        const result = window.prompt('Název souboru');
        if(result) {
            window.socket.emit('ADD_FILE', result);
        }
    }

};

const Item = ({name, onFileClick, isActive}) => {
    return (
        <div className={`tree-item ${isActive ? 'active' : ''}`}  onClick={() => onFileClick(name)}>
            <span>{name}</span>
        </div>
    );
};

