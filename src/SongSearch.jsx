import { useState } from "react";

function SongSearch({ onSelectSong, onAddSong }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const searchSongs = async (text) => {
    setQuery(text);
    if (!text) {
      setResults([]);
      return;
    }

    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        text
      )}&entity=song&limit=10`
    );
    const data = await res.json();
    setResults(data.results);
  };

  return (
    <div>
      <h3>Search Song</h3>

      <input
        placeholder="Type song name..."
        value={query}
        onChange={(e) => searchSongs(e.target.value)}
      />

      {results.map((song) => (
        <div key={song.trackId}
          style={{ display: "flex", gap: 10, border: "1px solid #444", padding: 5 }}
        >
          <img src={song.artworkUrl100} width="50" />
          <div onClick={() => onSelectSong(song)} style={{ flex: 1, cursor: "pointer" }}>
            <strong>{song.trackName}</strong>
            <br />
            <small>{song.artistName}</small>
          </div>
          <button onClick={() => onAddSong(song)}>➕</button>
        </div>
      ))}
    </div>
  );
}

export default SongSearch;
