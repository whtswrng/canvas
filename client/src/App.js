// App.js
import React from "react";
import "./App.css";
import "/node_modules/react-grid-layout/css/styles.css";
import "/node_modules/react-resizable/css/styles.css";

import CharacterList from "./character-list/character-list";
import CodeEditor from "./code-editor";
import Console from "./console/console";
import GridLayout from "react-grid-layout";
import { ControlsProvider } from "./character-list/control-panel/controls-context";

// Connect to the Socket.IO server
export const socket = window.io("ws://localhost:3000");

// Send a message to the server
socket.emit("message", "Hello, Server!");

socket.on("warning", (data) => {
  console.warn(data);
});

socket.on("message", (data) => {
  console.log(data);
});

const App = () => {
  const layout = [
    { i: "a", x: 0, y: 0, w: 12, h: 20, static: true }, // Adjusted height for CharacterList
    // { i: 'b', x: 6, y: 0, w: 6, h: 14, static: true},  // Adjusted height for CodeEditor
    { i: "c", x: 13, y: 0, w: 4, h: 20, static: true }, // Adjusted height for EmptyDiv
  ];
  return (
    <ControlsProvider>
      <GridLayout
        className="layout"
        layout={layout}
        cols={16}
        rowHeight={30}
        width={1600}
      >
        <div key="a" className="grid-item">
          <CharacterList />
        </div>
        {/* <div key="b" className="grid-item">
        <CodeEditor />
      </div> */}
        <div key="c" className="grid-item">
          <Console />
        </div>
      </GridLayout>
    </ControlsProvider>
  );
};

export default App;
