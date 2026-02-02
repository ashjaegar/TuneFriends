import { useState } from "react";
import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

function Auth({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const snap = await getDoc(doc(db, "users", userCred.user.uid));
        onLogin({ ...userCred.user, username: snap.data().username });
      } else {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await setDoc(doc(db, "users", userCred.user.uid), {
          username,
          email,
        });

        onLogin({ ...userCred.user, username });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>

      {!isLogin && (
        <>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <br /><br />
        </>
      )}

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br /><br />

      <button onClick={submit}>
        {isLogin ? "Login" : "Sign Up"}
      </button>

      <p
        style={{ cursor: "pointer", color: "blue" }}
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin
          ? "No account? Sign up"
          : "Already have an account? Login"}
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Auth;
