import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { api } from "../services/api";
import { setStoredUser } from "../auth/authUtils";

function formatStoredUser(user: any) {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    providerId: user.providerData?.[0]?.providerId,
  };
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => (mode === "login" ? "Login" : "Sign Up"), [mode]);

  const handleFirebaseError = (err: unknown) => {
    const e = err as { code?: string; message?: string };
    const code = e.code;

    if (code === "auth/unauthorized-domain") {
      alert(
        "This Firebase project is not authorized for the current domain. Check the Authentication authorized domains in Firebase Console."
      );
      return;
    }

    if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
      alert(
        "Popup blocked or closed. Please allow popups for this site and try again."
      );
      return;
    }

    alert(e.message || "Authentication failed. Please try again.");
  };

  const persistAndRedirect = async (user: any) => {
    setStoredUser(formatStoredUser(user));

    try {
      // Backend integration: for both google + email logins, you can decide what backend expects.
      // For Google specifically, we still call the Google endpoint after Google auth.
      return;
    } finally {
      navigate("/", { replace: true });
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Store minimal user
      setStoredUser(formatStoredUser(user));

      // Notify backend
      await api.post("/auth/google", {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL,
      });

      alert("Google Login Success 🚀");
      navigate("/", { replace: true });
    } catch (error) {
      console.error(error);
      handleFirebaseError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPassword = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (mode === "login") {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await persistAndRedirect(result.user);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await persistAndRedirect(result.user);
      }
      alert(mode === "login" ? "Login Success ✅" : "Account created ✅");
    } catch (error) {
      console.error(error);
      handleFirebaseError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "48px auto", padding: 16 }}>
      <h2>{title}</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button type="button" onClick={handleGoogleLogin} disabled={loading}>
          {loading ? "Loading..." : "Continue with Google"}
        </button>

        <div style={{ height: 1, background: "#e5e7eb" }} />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />

        <button type="button" onClick={handleEmailPassword} disabled={loading || !email || !password}>
          {mode === "login" ? "Login" : "Sign Up"}
        </button>

        <button
          type="button"
          onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
          disabled={loading}
        >
          Switch to {mode === "login" ? "Sign Up" : "Login"}
        </button>
      </div>
    </div>
  );
}

