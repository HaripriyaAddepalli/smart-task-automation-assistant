import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { auth } from "../firebase";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export const useSocket = (workspaceId?: string) => {
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return null;

    const token = await user.getIdToken();
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;
    return socket;
  }, []);

  useEffect(() => {
    let socket: Socket | null = null;

    connect().then((s) => {
      socket = s;
      if (socket && workspaceId) {
        socket.emit("join-workspace", workspaceId);
      }
    });

    return () => {
      if (socket && workspaceId) {
        socket.emit("leave-workspace", workspaceId);
      }
      socket?.disconnect();
      socketRef.current = null;
    };
  }, [workspaceId, connect]);

  const on = useCallback(
    (event: string, handler: (...args: unknown[]) => void) => {
      socketRef.current?.on(event, handler);
      return () => {
        socketRef.current?.off(event, handler);
      };
    },
    []
  );

  return { socket: socketRef, on, connect };
};
