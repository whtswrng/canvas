// CharacterList.js
import React, { useEffect, useState } from "react";
import { Character } from "./character";
import "./character-list.css";
import { useListen } from "../listen";
import { socket } from "../App";
import { ControlsProvider } from "./control-panel/controls-context";

const characters = [
  { id: 1, name: "Character 1", health: 100, mana: 50, attrs: {} },
  { id: 2, name: "Character 2", health: 80, mana: 75, attrs: {} },
  // Add more characters as needed
];

const CharacterList = () => {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    socket.on("ENTITY_INITIALIZED", (d) => {
      console.log("called boye");
      setCharacters((prev) => [...prev, d]);
    });
  }, []);

  if (characters.length === 0) return <span>...</span>;

  return (
    <div className="character-list-container">
      {characters.map((character) => (
        <ControlsProvider key={character.playerId} playerId={character.playerId}>
          <Character character={character} />
        </ControlsProvider>
      ))}
    </div>
  );
};

export default CharacterList;
