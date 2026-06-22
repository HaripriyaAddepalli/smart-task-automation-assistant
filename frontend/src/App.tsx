import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequireAuth from "./auth/RequireAuth";
import { Dashboard } from "./pages/Dashboard";
import { WorkspaceSwitcher } from "./pages/WorkspaceSwitcher";
import { Settings } from "./pages/Settings";
import { Landing } from "./pages/Landing";
import { Onboarding } from "./pages/Onboarding";
import Login from "./pages/Login";


function App() {
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      console.log("📱 App install available");
      (window as { deferredPrompt?: Event }).deferredPrompt = e;
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/onboarding"
            element={
              <RequireAuth>
                <Onboarding />
              </RequireAuth>
            }
          />
          <Route
            path="/workspaces"
            element={
              <RequireAuth>
                <WorkspaceSwitcher />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={
              <RequireAuth>
                <Settings />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/home"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Landing />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
