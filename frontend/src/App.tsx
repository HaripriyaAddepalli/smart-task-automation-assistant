import { useEffect } from "react";
import { Dashboard } from "./pages/Dashboard";

function App() {
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      console.log("📱 App install available");
      (window as any).deferredPrompt = e;
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;