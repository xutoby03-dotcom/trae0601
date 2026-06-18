import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export { toast };

export function Layout() {
  return (
    <div className="flex min-h-screen bg-caramel-50/30">
      <Sidebar />
      <main className="flex-1 min-h-screen">
        <div className="p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}
