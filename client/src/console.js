// EmptyDiv.js
import React, { useEffect, useState } from "react";
import { Hook, Console as _Console, Decode } from "console-feed";

const Console = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    Hook(window.console, (log) => {
      setLogs((logs) => [...logs, Decode(log)]);
    });

    console.log(`Hello world!`);
  }, []);
  return (
    <div>
      <h2>Console</h2>
      {/* Your content for the empty div goes here */}
      <_Console logs={logs} variant="dark"/>
    </div>
  );
};

export default Console;
