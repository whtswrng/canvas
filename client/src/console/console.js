// EmptyDiv.js
import React, { useEffect, useRef, useState } from "react";
import { Hook, Console as _Console, Decode } from "console-feed";
import { socket } from "../App";
import "./console.css";

const Console = () => {
  const [logs, setLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const consoleRef = useRef(null);

  useEffect(() => {
    // Hook(window.console, (log) => {
    //   console.log(log);
    //   setLogs((logs) => [...logs, Decode(log)]);
    // });

    const listener = socket.on("TAKE_DAMAGE", ({ damage, from, to }) => {
      setLogs((logs) => [
        ...logs,
        {
          sentiment: 2,
          msg: `Player ${to.name} took ${damage} damage from ${from.name}.`,
          timestamp: getTimestamp(),
        },
      ]);
    });

    socket.on("ENEMY_HIT", ({ playerId, playerName, enemy, damage }) => {
      setLogs((logs) => [
        ...logs,
        {
          sentiment: 4,
          msg: `Player ${playerName} hit ${enemy.name} for ${damage} damage.`,
          timestamp: getTimestamp(),
        },
      ]);
    });
    return () => {
      socket.off("TAKE_DAMAGE", listener);
    };
  }, []);

  useEffect(() => {
    // Scroll down the console when new events arrive
    const scrollConsole = () => {
      if (autoScroll && consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    };

    scrollConsole();
  }, [logs]); // Trigger the effect when new events arrive

  const handleToggleScroll = () => {
    setAutoScroll(!autoScroll);
  };

  return (
    <div className="card">
      <h2>Console 2</h2>
      <button onClick={handleToggleScroll}>
        {autoScroll ? "Disable Follow Scroll" : "Enable Follow Scroll"}
      </button>
      <div className="logs-container" ref={consoleRef}>
        {logs.map((l) => (
          <div className={"log sentiment-" + l.sentiment}>
            [{l.timestamp}] {l.msg}
          </div>
        ))}
      </div>
    </div>
  );

  function getTimestamp() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  }
};

export default Console;
