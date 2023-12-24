// CodeEditor.js
import React, { useEffect, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';

const CodeEditor = () => {
  const [script, setScript] = useState('');
  const editorOptions = {
    selectOnLineNumbers: true,
    language: 'javascript', // Specify the language for syntax highlighting
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && event.shiftKey) {
        executeScript();
        event.preventDefault();
        event.stopPropagation();
      }

    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [script]);

  const executeScript = () => {
    eval(script)
  };

  return (
    <div>
      <h2>Code Editor</h2>
      <MonacoEditor
        width="580"
        height="400"
        language="javascript"
        onChange={(val) => setScript(val)}
        theme="vs-dark"
        options={editorOptions}
      />
    </div>
  );
};

export default CodeEditor;
