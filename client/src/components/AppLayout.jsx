import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

export default function AppLayout() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <Navbar />

      <div className="w-full max-w-[1100px] mx-auto flex flex-1 pb-16 md:pb-0">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 md:p-6">
          <Outlet />
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}

