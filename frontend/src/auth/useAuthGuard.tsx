import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../firebase";
import { getStoredUser } from "./authUtils";

export function useAuthGuard() {
  const stored = useMemo(() => getStoredUser(), []);
  const [initializing, setInitializing] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setInitializing(false);

      if (u) {
        // sync to localStorage (best-effort)
        const minimal = {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: u.photoURL,
          providerId: u.providerData?.[0]?.providerId,
        };
        localStorage.setItem("user", JSON.stringify(minimal));
      }
    });
    return () => unsub();
  }, []);

  const isAuthed = !!firebaseUser || !!stored;

  return { isAuthed, initializing };
}

