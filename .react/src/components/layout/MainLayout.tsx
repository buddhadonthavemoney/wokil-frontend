import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-[hsl(210,20%,98%)]/50">
      <Sidebar />
      <main className="flex-1 overflow-auto pt-[57px] lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
