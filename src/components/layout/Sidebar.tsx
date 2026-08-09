'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Scale, LayoutDashboard, User, Globe, Settings, LogOut, IdCard, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavLinkProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
}

function NavLink({ icon, label, path, isActive }: NavLinkProps) {
  return (
    <Link
      href={path}
      prefetch={true}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
        transition-all duration-200 font-medium text-sm
        ${isActive 
          ? 'bg-primary/10 text-primary' 
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }
      `}
    >
      <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <User className="w-5 h-5" />, label: 'Profile', path: '/profile-builder' },
    { icon: <Globe className="w-5 h-5" />, label: 'Sites', path: '/sites' },
    { icon: <IdCard className="w-5 h-5" />, label: 'Business Cards', path: '/business-cards' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link 
          href="/dashboard"
          prefetch={true}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Scale className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="font-heading font-bold text-base leading-tight text-foreground">
            Wokil
          </h1>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-[57px]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40
        w-64 bg-card border-r border-border flex flex-col
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        h-[calc(100vh-57px)] lg:h-screen
        lg:mt-0 mt-[57px]
      `}>
        {/* Logo Section - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block p-6 border-b border-border">
          <Link 
            href="/dashboard"
            prefetch={true}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors">
                Wokil
              </h1>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                Professional
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.path} onClick={handleNavClick}>
              <NavLink
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={pathname === item.path}
              />
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted font-medium"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </Button>
        </div>
      </aside>
    </>
  );
}
