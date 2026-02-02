import SongSearch from "./SongSearch";
import SongDetail from "./SongDetail";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Auth from "./Auth";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Playlist from "./Playlist";
import AddToPlaylistModal from "./AddToPlaylistModal";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";



const socket = io("http://localhost:3001");
let ytPlayer = null;

function App() {
  const [user, setUser] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
const [playlists, setPlaylists] = useState([]);

  // 🔐 Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // 🎵 Player + sockets
  useEffect(() => {
    if (!user) return;

    const createPlayer = () => {
      if (ytPlayer) return;

      ytPlayer = new window.YT.Player("yt-player", {
        height: "360",
        width: "640",
        videoId: "",
        events: {
          onReady: () => console.log("YouTube player ready"),
          onStateChange: (event) => {
            if (!roomId || !isHost) return;
            const time = ytPlayer.getCurrentTime();

            if (event.data === window.YT.PlayerState.PLAYING) {
              socket.emit("play", { roomId, time });
            }
            if (event.data === window.YT.PlayerState.PAUSED) {
              socket.emit("pause", { roomId, time });
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    const hostHandler = (hostId) => {
      setIsHost(socket.id === hostId);
    };

    const changeVideoHandler = ({ videoId }) => {
      if (!ytPlayer) return;
      ytPlayer.loadVideoById(videoId);
    };

    const playHandler = ({ time }) => {
      if (!ytPlayer) return;
      ytPlayer.seekTo(time, true);
      ytPlayer.playVideo();
    };

    const pauseHandler = ({ time }) => {
      if (!ytPlayer) return;
      ytPlayer.seekTo(time, true);
      ytPlayer.pauseVideo();
    };

    const chatHandler = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const syncStateHandler = (state) => {
      if (!ytPlayer || !state.videoId) return;
      ytPlayer.loadVideoById(state.videoId);
      ytPlayer.seekTo(state.time || 0, true);
      state.isPlaying ? ytPlayer.playVideo() : ytPlayer.pauseVideo();
    };

    socket.on("host-changed", hostHandler);
    socket.on("change-video", changeVideoHandler);
    socket.on("play", playHandler);
    socket.on("pause", pauseHandler);
    socket.on("chat", chatHandler);
    socket.on("sync-state", syncStateHandler);

    return () => {
      socket.off("host-changed", hostHandler);
      socket.off("change-video", changeVideoHandler);
      socket.off("play", playHandler);
      socket.off("pause", pauseHandler);
      socket.off("chat", chatHandler);
      socket.off("sync-state", syncStateHandler);
    };
  }, [user, roomId, isHost]);

  const joinRoom = () => {
    socket.emit("join-room", roomId);
  };

  const getVideoId = (url) => {
    try {
      const u = new URL(url);
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
      return url;
    } catch {
      return url;
    }
  };

  const changeVideo = () => {
    const id = getVideoId(videoUrl);
    socket.emit("change-video", { roomId, videoId: id });
  };

  const play = () => ytPlayer && ytPlayer.playVideo();
  const pause = () => ytPlayer && ytPlayer.pauseVideo();

  const sendMessage = () => {
    socket.emit("chat", { roomId, message });
    setMessage("");
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome {user.username || user.email}</h2>
      <button onClick={() => signOut(auth)}>Logout</button>

      {/* SONG SEARCH */}
   <SongSearch
  onSelectSong={(song) => setSelectedSong(song)}
  onAddSong={(song) => {
    setSelectedSong(song);
    setShowAddModal(true);
  }}
/>


      {selectedSong && (
        <SongDetail
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
        />
      )}
      <Playlist user={user} selectedSong={selectedSong} onPlaylistsLoaded={setPlaylists} />
      {showAddModal && (
  <AddToPlaylistModal
    playlists={playlists}
    onSelect={async (playlist) => {
      await addDoc(collection(db, "playlistSongs"), {
        playlistId: playlist.id,
        songId: selectedSong.trackId,
        title: selectedSong.trackName,
        artist: selectedSong.artistName,
        image: selectedSong.artworkUrl100,
        album: selectedSong.collectionName,
      });
      setShowAddModal(false);
      alert("Added to playlist");
    }}
    onClose={() => setShowAddModal(false)}
  />
)}




      <p>Role: {isHost ? "🎧 Host" : "👥 Listener"}</p>

      <input
        placeholder="Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={joinRoom}>Join Room</button>

      <br /><br />

      <input
        placeholder="YouTube URL"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
      />
      <button onClick={changeVideo} disabled={!isHost}>
        Load Song
      </button>

      <div id="yt-player"></div>

      <br />

      <button onClick={play} disabled={!isHost}>Play</button>
      <button onClick={pause} disabled={!isHost}>Pause</button>

      <h3>Chat</h3>
      {messages.map((m, i) => (
        <p key={i}>{m.user}: {m.message}</p>
      ))}

      <input value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
