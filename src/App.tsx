import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Devices from "./pages/Devices";
import Replacements from "./pages/Replacements";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings";

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-surface-bg">
      <Sidebar />
      <main className="flex-1 min-w-0 flex flex-col">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <PageShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/replacements" element={<Replacements />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </PageShell>
    </Router>
  );
}
