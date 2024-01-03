import "./item.css";
import { Tooltip } from "react-tooltip";

export const Item = ({ item }) => {
  //   const backgroundImageUrl = `/images/items/${item.name}.jpg`; // Replace with your image URL
  const backgroundImageUrl = `/images/items/placeholder.jpg`; // Replace with your image URL

  return (
    <>
      <div
        className={"item-container " + item.rarity}
        id={"item-" + item.id}
        style={{
          width: "100%",
          height: "100%",
          backgroundImage: `url(${backgroundImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {item.name} ({item.amount}x)
      </div>
      <Tooltip anchorSelect={"#item-" + item.id} place="top">
        <div style={{maxWidth: 100, wordBreak: 'break-word'}}>
          <div>
            <span style={{ fontWeight: 800 }}>
              {item.level} {item.name}
            </span>
          </div>
          <div style={{fontWeight: 200}}>{item.type}</div>
          {item.attrs && (
            <div>
              <span>Attributes</span>
              <ul
                style={{
                  color: "grey",
                  listStyleType: "none",
                  padding: 0,
                  margin: "0 0 0 10px",
                }}
              >
                {Object.entries(item.attrs).map(([attr, value]) => (
                  <li key={attr}>
                    {attr}: {value}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>{item.description} Description bla bla bla lorem dorem</div>
        </div>
      </Tooltip>
    </>
  );
};
