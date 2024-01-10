export const MapGenerator = ({ editing, onClick, setName, setColor, setStatic }) => {
  return (
    <div>
      <button onClick={onClick}>{editing ? "Stop" : "Start"}</button>
      <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
      <input type="color" onChange={(e) => setColor(e.target.value)} placeholder="Color" />
      <input type="checkbox" placeholder="Static" onChange={(e) => setStatic((prev) => !prev)} />
    </div>
  );
};
