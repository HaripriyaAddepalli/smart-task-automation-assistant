import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import * as admin from "firebase-admin";
import logger from "../config/logger";

let io: Server | null = null;

const ensureFirebaseInitialized = () => {
  const apps = (admin as unknown as { apps?: unknown[] }).apps;
  if (!apps || apps.length === 0) {
    const credential = (admin as unknown as { credential?: { applicationDefault: () => unknown } }).credential;
    if (credential?.applicationDefault) {
      admin.initializeApp({ credential: credential.applicationDefault() as admin.credential.Credential });
    }
  }
};

const verifySocketToken = async (token: string): Promise<{ uid: string; email?: string } | null> => {
  try {
    ensureFirebaseInitialized();
    const decoded = await (admin as unknown as { auth: () => { verifyIdToken: (t: string) => Promise<{ uid: string; email?: string }> } })
      .auth()
      .verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email };
  } catch {
    return null;
  }
};

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? "*",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    const user = await verifySocketToken(token);
    if (!user) {
      return next(new Error("Invalid token"));
    }
    socket.data.user = user;
    next();
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user as { uid: string; email?: string };
    logger.info({ message: "Socket connected", uid: user.uid });

    socket.on("join-workspace", (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
      logger.info({ message: "Joined workspace room", workspaceId, uid: user.uid });
    });

    socket.on("leave-workspace", (workspaceId: string) => {
      socket.leave(`workspace:${workspaceId}`);
    });

    socket.on("disconnect", () => {
      logger.info({ message: "Socket disconnected", uid: user.uid });
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export const emitTaskUpdate = (
  workspaceId: string,
  event: "task:created" | "task:updated" | "task:deleted" | "task:moved",
  payload: unknown
) => {
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit(event, payload);
};

export const emitAssignmentUpdate = (
  workspaceId: string,
  payload: unknown
) => {
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit("assignment:updated", payload);
};
