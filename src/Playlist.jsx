import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

function Playlist({ user, selectedSong, onPlaylistsLoaded }) {
  const [playlists, setPlaylists] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "playlists"),
      where("userId", "==", user.uid)
    );

    getDocs(q).then((snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPlaylists(data);
      onPlaylistsLoaded(data);
    });
  }, [user]);

  useEffect(() => {
    if (!selectedPlaylist) return;

    const q = query(
      collection(db, "playlistSongs"),
      where("playlistId", "==", selectedPlaylist.id)
    );

    getDocs(q).then((snap) => {
      setSongs(snap.docs.map((d) => d.data()));
    });
  }, [selectedPlaylist]);

  const createPlaylist = async () => {
    if (!playlistName) return;

    const docRef = await addDoc(collection(db, "playlists"), {
      name: playlistName,
      userId: user.uid,
      username: user.email,
      createdAt: Date.now(),
    });

    setPlaylists([...playlists, { id: docRef.id, name: playlistName, username: user.email }]);
    setPlaylistName("");
  };

  return (
    <div>
      <h3>Your Playlists</h3>

      <input
        placeholder="New playlist name"
        value={playlistName}
        onChange={(e) => setPlaylistName(e.target.value)}
      />
      <button onClick={createPlaylist}>Create</button>

      <ul>
        {playlists.map((p) => (
          <li key={p.id} onClick={() => setSelectedPlaylist(p)}
            style={{ cursor: "pointer", fontWeight: selectedPlaylist?.id === p.id ? "bold" : "normal" }}>
            {p.name}
          </li>
        ))}
      </ul>

      {selectedPlaylist && (
        <>
          <h4>{selectedPlaylist.name}</h4>
          <small>by {selectedPlaylist.username}</small>

          {songs.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10 }}>
              <img src={s.image} width="40" />
              <div>{s.title} - {s.artist}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default Playlist;
