function AddToPlaylistModal({ playlists, onSelect, onClose }) {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{ background: "#111", padding: 20, width: 300 }}>
        <h3>Select Playlist</h3>

        {playlists.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            style={{ display: "block", width: "100%", marginBottom: 5 }}
          >
            {p.name}
          </button>
        ))}

        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default AddToPlaylistModal;
