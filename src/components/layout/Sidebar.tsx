'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAccountType } from '@/hooks/useAccountType';
import {
  Scale,
  LayoutDashboard,
  User,
  Globe,
  Settings,
  LogOut,
  IdCard,
  Menu,
  X,
  Building2,
  Gavel,
  CalendarDays,
  ChevronDown,
  Mail,
} from 'lucide-react';
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
        w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-r-4
        transition-all duration-200 font-medium text-sm
        ${isActive
          ? 'bg-surface-low text-accent font-semibold border-accent'
          : 'text-muted-foreground border-transparent hover:bg-surface-low hover:text-primary'
        }
      `}
    >
      <span className={isActive ? 'text-accent' : 'text-muted-foreground'}>
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}

interface ComingSoonLinkProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
}

function ComingSoonLink({ icon, label, path, isActive }: ComingSoonLinkProps) {
  return (
    <Link
      href={path}
      prefetch={true}
      title="Coming soon"
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border-r-4
        transition-all duration-200 text-sm font-medium
        ${isActive
          ? 'bg-surface-low text-accent font-semibold border-accent'
          : 'text-muted-foreground/70 border-transparent hover:bg-surface-low hover:text-primary'
        }
      `}
    >
      <span className={isActive ? 'text-accent' : 'text-muted-foreground/70'}>{icon}</span>
      <span className="flex-1">{label}</span>
      <span className="text-[9px] label-caps text-accent border border-accent/40 rounded px-1.5 py-0.5">
        Soon
      </span>
    </Link>
  );
}

/**
 * Expandable parent row with indented children, per the Stitch "Wokil — Dashboard"
 * sidebar. The parent is a button, not a link — it only opens the group. Starts
 * open whenever one of its children is the current route.
 */
function NavGroup({
  icon,
  label,
  items,
  pathname,
  onNavigate,
}: {
  icon: React.ReactNode;
  label: string;
  items: { label: string; path: string }[];
  pathname: string | null;
  onNavigate: () => void;
}) {
  // Sub-routes count as the parent: /firm-roster/2 is still "Roster".
  const isChildActive = (path: string) =>
    pathname === path || Boolean(pathname?.startsWith(`${path}/`));
  const hasActiveChild = items.some((item) => isChildActive(item.path));
  const [isOpen, setIsOpen] = useState(hasActiveChild);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className={`
          w-full flex items-center justify-between px-4 py-2.5 rounded-lg border-r-4
          transition-all duration-200 font-medium text-sm
          ${hasActiveChild
            ? 'bg-surface-low text-accent font-semibold border-accent'
            : 'text-muted-foreground border-transparent hover:bg-surface-low hover:text-primary'
          }
        `}
      >
        <span className="flex items-center gap-3">
          <span className={hasActiveChild ? 'text-accent' : 'text-muted-foreground'}>{icon}</span>
          <span>{label}</span>
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="pl-11 flex flex-col gap-1 mt-1">
          {items.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              prefetch={true}
              onClick={onNavigate}
              className={`
                py-2 text-sm transition-colors
                ${isChildActive(item.path)
                  ? 'text-accent font-semibold'
                  : 'text-muted-foreground hover:text-accent'
                }
              `}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="px-4 mb-1.5 text-[11px] label-caps text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { accountType } = useAccountType();
  const isFirm = accountType === 'firm';

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
              <p className="text-xs label-caps text-muted-foreground">
                Professional
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pt-4 overflow-y-auto">
          {/*
            Nav follows the account type: an individual has no firm to manage,
            and a firm account has no lawyer profile behind /profile-builder —
            linking to the other type's pages only offers a bounce back.
          */}
          <NavSection label="General">
            <div onClick={handleNavClick}>
              <NavLink
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="Dashboard"
                path={isFirm ? '/firm-dashboard' : '/dashboard'}
                isActive={pathname === (isFirm ? '/firm-dashboard' : '/dashboard')}
              />
            </div>
            {isFirm ? (
              <NavGroup
                icon={<Building2 className="w-5 h-5" />}
                label="Firm"
                pathname={pathname}
                onNavigate={handleNavClick}
                items={[
                  { label: 'Builder', path: '/firm-builder' },
                  { label: 'Roster', path: '/firm-roster' },
                  { label: 'All Details', path: '/firm-details' },
                ]}
              />
            ) : (
              <NavGroup
                icon={<User className="w-5 h-5" />}
                label="Profile"
                pathname={pathname}
                onNavigate={handleNavClick}
                items={[
                  { label: 'Builder', path: '/profile-builder' },
                  { label: 'All Details', path: '/profile-details' },
                ]}
              />
            )}
          </NavSection>

          <NavSection label="Management">
            <div onClick={handleNavClick}>
              <NavLink icon={<Globe className="w-5 h-5" />} label="Sites" path="/sites" isActive={pathname === '/sites'} />
            </div>
            <div onClick={handleNavClick}>
              {/* /email resolves the domain, then hands off to /sites/[domain]/email. */}
              <NavLink icon={<Mail className="w-5 h-5" />} label="Email" path="/email" isActive={Boolean(pathname?.endsWith('/email'))} />
            </div>
            <div onClick={handleNavClick}>
              <NavLink icon={<IdCard className="w-5 h-5" />} label="Business Cards" path="/business-cards" isActive={pathname === '/business-cards'} />
            </div>
          </NavSection>

          <NavSection label="Tools">
            <NavGroup
              icon={<Gavel className="w-5 h-5" />}
              label="Legal Research"
              pathname={pathname}
              onNavigate={handleNavClick}
              items={[
                { label: 'Chat', path: '/legal-research' },
                { label: 'People in Cases', path: '/legal-research/entities' },
                { label: 'Most Cited', path: '/legal-research/most-cited' },
                { label: 'Documents', path: '/legal-research/documents' },
                { label: 'Repealed Laws', path: '/legal-research/repealed' },
              ]}
            />
            <div onClick={handleNavClick}>
              <ComingSoonLink icon={<CalendarDays className="w-5 h-5" />} label="Court Calendar" path="/court-calendar" isActive={pathname === '/court-calendar'} />
            </div>
          </NavSection>

          <NavSection label="Settings">
            <div onClick={handleNavClick}>
              <NavLink icon={<Settings className="w-5 h-5" />} label="Settings" path="/settings" isActive={pathname === '/settings'} />
            </div>
          </NavSection>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-surface-low font-medium"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </Button>
        </div>
      </aside>
    </>
  );
}
