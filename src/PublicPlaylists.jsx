import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function PublicPlaylists() {
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    getDocs(collection(db, "playlists")).then((snap) => {
      setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Public Playlists</h3>

      {playlists.map((p) => (
        <div key={p.id} style={{ border: "1px solid gray", padding: 5 }}>
          <strong>{p.name}</strong> by {p.username}
        </div>
      ))}
    </div>
  );
}

export default PublicPlaylists;
