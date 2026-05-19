import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { setStoredUser } from "../auth/authUtils";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      setStoredUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        providerId: result.user.providerData?.[0]?.providerId,
      });
      navigate("/", { replace: true });
    } catch (err: any) {
      const code = err?.code;
      if (code === "auth/unauthorized-domain") {
        alert(
          "This Firebase project is not authorized for the current domain. Check the Authentication authorized domains in Firebase Console."
        );
      } else {
        alert(err?.message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "48px auto", padding: 16 }}>
      <h2>Sign Up</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
        <button
          type="button"
          onClick={handleSignup}
          disabled={loading || !email || !password}
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}

