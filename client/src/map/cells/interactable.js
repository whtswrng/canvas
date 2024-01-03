import { toKebabCase } from "../../utils";
import "./player.css";
import { Tooltip } from "react-tooltip";

export const Interactable = ({ cell }) => {
  const obj = cell.interactable;
  const backgroundImageUrl = `/images/interactable/${toKebabCase(
    obj.name
  )}.jpg`;

  return (
    <>
      <div
        className="player-container"
        id={"interactable-" + cell.x + cell.y}
        style={{
          position: 'absolute',
          width: 80,
          height: 80,
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundColor: cell.bg + "96",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
      </div>
      <Tooltip anchorSelect={"#interactable-" + cell.x + cell.y} place="top">
        <div>
          <span style={{ fontWeight: 800 }}>{obj.name}</span>
        </div>
        <div style={{ fontSize: 8, fontWeight: 200 }}>
          {cell.x} | {cell.y}
        </div>
        <div style={{ fontWeight: 500 }}>{obj.description}</div>
      </Tooltip>
    </>
  );
};
