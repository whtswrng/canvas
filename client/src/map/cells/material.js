import "./player.css";
import { Tooltip } from "react-tooltip";

export const Material = ({ cell }) => {
  const backgroundImageUrl = "/images/materials/tree.png"; // Replace with your image URL
  const material = cell.material;

  const calculatePercentage = (current, total) => {
    return (current / total) * 100;
  };

  return (
    <>
      <div
        className="player-container"
        id={"material-" + cell.x + cell.y}
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundColor: cell.bg + "96",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="player-progress-bar">
          <div
            className="player-progress-bar-hp-fill"
            style={{
              width: `${calculatePercentage(
                cell.material.hp,
                cell.material.maxHp
              )}%`,
            }}
          />
        </div>
        {/* You can add additional content or styling if needed */}
      </div>
      <Tooltip anchorSelect={"#material-" + cell.x + cell.y} place="top">
        <div>
          <span style={{ fontWeight: 800 }}>
            {material.level} {material.name}
          </span>
        </div>
        <div style={{ fontSize: 8, fontWeight: 200 }}>
          {cell.x} | {cell.y}
        </div>
        <div style={{ color: "green" }}>
          Hp {material.hp}/{material.maxHp}
        </div>
      </Tooltip>
    </>
  );
};
