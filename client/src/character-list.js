// CharacterList.js
import React from 'react';

const characters = [
  { id: 1, name: 'Character 1', health: 100, mana: 50 },
  { id: 2, name: 'Character 2', health: 80, mana: 75 },
  // Add more characters as needed
];

const CharacterList = () => {
  return (
    <div>
      <h2>Character List</h2>
      <ul>
        {characters.map((character) => (
          <li key={character.id}>
            <strong>{character.name}</strong>
            <p>Health: {character.health}</p>
            <p>Mana: {character.mana}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CharacterList;
