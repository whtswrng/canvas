import { useEffect, useState } from "react";
import { socket } from "./App";

export const useListen = (event, playerId, force) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const listener = socket.on(event, (d) => {
      if (playerId && d.playerId !== playerId) return;
      setData(d);
      setLoading(false);
    });

    if (force) socket.emit("FORCE_" + event, {playerId});

    return () => {
      socket.off(event, listener);
    };
  }, []);

  return { data, loading };
};
