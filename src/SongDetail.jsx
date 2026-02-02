import { useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

function SongDetail({ song, onClose }) {
  const [likes, setLikes] = useState(0);
  const [lyrics, setLyrics] = useState("");

  useEffect(() => {
    if (!song) return;

    const songRef = doc(db, "songs", String(song.trackId));

    getDoc(songRef).then((snap) => {
      if (snap.exists()) {
        setLikes(snap.data().likeCount || 0);
      } else {
        setDoc(songRef, {
          title: song.trackName,
          artist: song.artistName,
          image: song.artworkUrl100,
          album: song.collectionName,
          likeCount: 0,
        });
      }
    });

    fetch(`https://api.lyrics.ovh/v1/${song.artistName}/${song.trackName}`)
      .then((res) => res.json())
      .then((data) => setLyrics(data.lyrics || "Lyrics not found"));
  }, [song]);

  const likeSong = async () => {
    const songRef = doc(db, "songs", String(song.trackId));
    await updateDoc(songRef, { likeCount: likes + 1 });
    setLikes(likes + 1);
  };

  if (!song) return null;

  return (
    <div style={{ border: "2px solid white", padding: 20, marginTop: 20 }}>
      <button onClick={onClose}>Close</button>
      <h2>{song.trackName}</h2>
      <p>{song.artistName}</p>
      <p>{song.collectionName}</p>
      <img src={song.artworkUrl100} />

      <br /><br />
      <button onClick={likeSong}>❤️ Like ({likes})</button>

      <h3>Lyrics</h3>
      <pre style={{ whiteSpace: "pre-wrap" }}>{lyrics}</pre>
    </div>
  );
}

export default SongDetail;
