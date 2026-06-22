import { NextFunction, Request, Response } from "express";
import * as admin from "firebase-admin";

// Some firebase-admin type definitions can be incomplete depending on install.
// We guard with runtime-safe access and keep TS strict by narrowing to unknown.

let initialized = false;

const ensureFirebaseInitialized = () => {
  if (initialized) return;

  const apps = (admin as unknown as { apps?: unknown[] }).apps;
  if (!apps || apps.length === 0) {
    const credential = (admin as unknown as { credential?: { applicationDefault: () => any } }).credential;
    const applicationDefault = credential?.applicationDefault;
    if (!applicationDefault) {
      throw new Error("Firebase admin credential applicationDefault() not available");
    }

    admin.initializeApp({
      credential: applicationDefault(),
    });
  }

  initialized = true;
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    ensureFirebaseInitialized();

    const header = req.header("Authorization");
    if (!header) return res.status(401).json({ message: "Missing Authorization header" });

    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Invalid Authorization header format" });
    }

    const decoded = await (admin as unknown as { auth: () => { verifyIdToken: (t: string) => Promise<any> } })
      .auth()
      .verifyIdToken(token);

    // Attach to request for downstream usage
    (req as any).user = {
      uid: decoded.uid,
      id: decoded.uid,
      email: decoded.email,
    };

    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};



