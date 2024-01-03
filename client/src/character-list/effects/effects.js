import { Item } from "../../item/item";
import { useListen } from "../../listen";
import "./effects.css";

export const Effects = ({ playerId }) => {
  const { data } = useListen("PLAYER_EFFECTS", playerId);

  return (
    <div className="effects">
      {data?.effects?.map((e) => (
        <div class="item">
          <Item item={{ name: e.name }} />
        </div>
      ))}
    </div>
  );
};
