import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-cream">
      <Sidebar />
      <div className="md:ml-60 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 p-5 md:p-7 lg:p-8 animate-fade-in-up">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
