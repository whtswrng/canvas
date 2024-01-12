import { Tooltip } from "react-tooltip";
import "./world-map.css";
import { useFetch } from "../listen";
import { Item } from "../item/item";
import { toKebabCase } from "../utils";
import { Entity } from "../map/cells/entity";
import { useState } from "react";

const Cell = ({ x, y, map, mobs }) => {
  const getCell = () => {
    for (const m of map.reverse()) {
      const xRange = [m.x, m.x + m.width];
      const yRange = [m.y, m.y + m.height];

      if (x >= 500 && x <= 540 && y >= 500 && y <= 540) return { bgColor: "grey" };
      if (m.type === "H") return;

      if (x >= xRange[0] && x <= xRange[1] && y >= yRange[0] && y <= yRange[1]) {
        return m;
      }
    }
  };

  const getMob = () => {
    for (const m of mobs) {
      for (const p of m.spawnPoints) {
        if (p.point[0] <= x && p.point[0] >= x - 16 && p.point[1] <= y && p.point[1] >= y - 16) {
          return m;
        }
      }
    }
  };

  const mob = getMob();
  const cell = getCell();

  return (
    <div>
      <div
        key={x + y}
        id={"map-" + x + y}
        className="simple-cell"
        style={{
          fontSize: 10,
          textAlign: "center",
          color: "red",
          width: "12px", // You can adjust the size as needed
          height: "12px",
          backgroundColor: cell?.bgColor ?? "green", // Set your desired background color
          border: "0.3px solid black", // Optional: Add a border
        }}
        onClick={() => navigator.clipboard.writeText(`${x} ${y}`)}
      >
        {mob && mob.level}
      </div>
      {mob && (
        <Tooltip anchorSelect={"#map-" + x + y} place="top">
          {mob.level} {mob.name} {x} | {y}
        </Tooltip>
      )}
    </div>
  );
};

const gridArray = [];
let y = 100;

for (let i = 0; i < 50; i++) {
  let x = 100;

  const temp = [];
  for (let j = 0; j < 50; j++) {
    temp.push({ x, y });
    x += 16;
  }
  gridArray.push(temp);
  y += 16;
}

export const WorldMap = ({ closeModal }) => {
  const { data } = useFetch("FETCH_WORLD_INFORMATION");
  const [name, setName] = useState("");

  if (!data) return <span>...</span>;

  const filterMobs = () => {
    return data.mobs.filter((m) => {
      const nameFits = m.name.toLowerCase().includes(name);
      return nameFits || m.drops.some((d) => d.name.toLowerCase().includes(name));
    });
  };

  const mobs = filterMobs();

  return (
    <div className="world-container" onClick={closeModal}>
      <div className="content" onClick={(e) => e.stopPropagation()}>
        <div className="left-side">
          <input type="text" placeholder="Name..." onBlur={(e) => setName(e.target.value)} />
          <button style={{ marginLeft: 3 }} onClick={() => setName("")}>
            x
          </button>
          <MobList mobs={mobs} />
        </div>
        <div className="world-map">
          {gridArray.map((row, rowIndex) => (
            <div key={rowIndex} style={{ display: "flex" }}>
              {row.map((col) => (
                <Cell key={col.x + col.y} x={col.x} y={col.y} map={data.map} mobs={mobs} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MobList = ({ mobs }) => {
  return (
    <div>
      {mobs.map((m) => (
        <div key={m.name + m.level} className="mob-detail">
          <div className="mob-info">
            <div
              className="mob-image"
              style={{ backgroundImage: `url(/images/entities/${toKebabCase(m.name)}.jpg)` }}
            />
            <div className="description">
              <div style={{ fontWeight: 700 }}>
                {m.level} {m.name}
              </div>
              <div>
                {m.aggressive ? "Agressive" : "Passive"} | Exp: {m.dropExperience}
              </div>
              <div>{m.attrs.hp} HP</div>
              <div></div>
            </div>
          </div>
          <div className="drops">
            <div className="inventory-grid">
              {m.drops.map((d) => (
                <div key={toKebabCase(d.name + d.chance)} className="inventory-item">
                  <Item item={{ name: d.name, amount: d.max, id: toKebabCase(d.name + d.chance) }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
