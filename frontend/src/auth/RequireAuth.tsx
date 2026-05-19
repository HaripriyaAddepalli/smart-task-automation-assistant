import { Navigate } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { useAuthGuard } from "./useAuthGuard";


export default function RequireAuth({ children }: PropsWithChildren) {
  const { isAuthed, initializing } = useAuthGuard();

  if (initializing) return null;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

