import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Boxes,
  CheckSquare,
  CalendarCheck,
  LayoutGrid,
  Layers,
  FolderArchive,
  Cloud,
  Users,
  Settings,
  Image,
  CreditCard,
  UserCheck,
  FileText,
  ShieldCheck,
  Receipt,
  TrendingUp,
  Calculator,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const navRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState<boolean>(false);
  const [scrollMessage, setScrollMessage] = useState<string>('↕ Scroll for more menu items');

  const checkScroll = () => {
    if (!navRef.current) return;
    const { scrollHeight, clientHeight, scrollTop } = navRef.current;
    const hasMore = scrollHeight > clientHeight + 2;
    setCanScroll(hasMore);

    if (hasMore) {
      if (scrollTop + clientHeight >= scrollHeight - 4) {
        setScrollMessage('↑ Scroll up for more menu items');
      } else {
        setScrollMessage('↕ Scroll for more menu items');
      }
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const primaryNav = [
    { label: 'Shop Stock', subtitle: 'Inventory & daily reports', to: '/stock', icon: Boxes },
    { label: 'My Work Today', subtitle: "Today's listings & QC", to: '/mywork', icon: CheckSquare },
    { label: 'Planning', subtitle: 'SKU tasks & assignments', to: '/planning', icon: CalendarCheck },
    { label: 'Dashboard', subtitle: 'Performance & stats', to: '/dashboard', icon: LayoutGrid },
    { label: 'Start Listings', subtitle: 'Workspaces & templates', to: '/', icon: Layers },
    { label: 'Marketplace Portal Files', subtitle: 'Official Excel templates', to: '/portalfiles', icon: FolderArchive },
    { label: 'Backup & Restore', subtitle: 'Drive & local backups', to: '/backups', icon: Cloud },
    { label: 'Refer a Friend', subtitle: 'Earn 20 credits per friend', to: '/referrals', icon: Users },
    { label: 'Settings', subtitle: 'Brand fixed config & HSN', to: '/settings', icon: Settings },
    { label: 'Image Library', subtitle: 'Photo angles & CDN links', to: '/imagelibrary', icon: Image },
    { label: 'Credits & Recharge', subtitle: 'Wallet balance & history', to: '/recharge', icon: CreditCard },
    { label: 'Employee Work Report', subtitle: 'Team daily output', to: '/employeework', icon: UserCheck },
    { label: 'Catalog Tracker', subtitle: 'Portal sync status', to: '/catalogs', icon: FileText }
  ];

  const secondaryNav = [
    { label: 'Policy & Privacy', subtitle: 'Rules & compliance', to: '/policy', icon: ShieldCheck },
    { label: 'Prepare GST Report', subtitle: 'Marketplace files & summary', to: '/gst', icon: Receipt },
    { label: 'Profit & Loss', subtitle: 'SKU costs & shop expenses', to: '/pnl', icon: TrendingUp },
    { label: 'Cost & Pricing Calculator', subtitle: 'Catalog costs, returns & prices', to: '/calculator', icon: Calculator }
  ];

  return (
    <aside
      id="workspaceSidebar"
      className="w-60 h-screen fixed left-0 top-0 bg-[#143e32] text-[#dce7df] flex flex-col z-30 select-none border-r border-[#1a4a3c] shadow-lg overflow-hidden"
    >
      {/* Brand Header */}
      <div className="p-5 pb-3 shrink-0">
        <div className="text-2xl font-black tracking-tight text-white flex items-center">
          <span>INFYSHOPY</span>
          <span className="text-[#a0cbaa]">.</span>
        </div>
        <div className="text-[9px] tracking-[2px] uppercase text-[#a0cbaa] font-semibold mt-0.5">
          Marketplace Studio
        </div>
      </div>

      {/* Navigation Scrollable Area */}
      <div
        ref={navRef}
        onScroll={checkScroll}
        className="sidebar-nav-scroll flex-1 px-3 py-1 space-y-1 overflow-y-auto overflow-x-hidden min-h-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#76a99a #1d4b42'
        }}
      >
        {primaryNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-start gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-[#ffffff1e] text-white font-semibold border border-[#ffffff18] shadow-xs'
                    : 'text-[#b9cfc3] hover:bg-[#ffffff0e] hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5 text-[#c6dc9b]" />
              <div className="leading-tight">
                <div className="font-semibold text-[13px]">{item.label}</div>
                {item.subtitle && (
                  <div className="text-[10px] text-[#8fa89b] font-normal">{item.subtitle}</div>
                )}
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Dynamic Scroll Indicator Hint */}
      {canScroll && (
        <div className="px-3 py-1 shrink-0 bg-[#11342a]/80 border-t border-b border-[#ffffff10]">
          <div className="text-[10px] text-[#82ad9e] text-center font-mono font-medium">
            {scrollMessage}
          </div>
        </div>
      )}

      {/* Bottom Fixed Navigation */}
      <div className="p-3 pt-2 border-t border-[#ffffff18] bg-[#103329] shrink-0 space-y-1">
        <div className="text-[9px] font-bold text-[#8fa89b] tracking-wider uppercase px-2 mb-1">
          One form. Every marketplace.
        </div>

        {secondaryNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-start gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-[#ffffff1e] text-white font-semibold border border-[#ffffff18] shadow-xs'
                    : 'text-[#b9cfc3] hover:bg-[#ffffff0e] hover:text-white'
                }`
              }
            >
              <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#c6dc9b]" />
              <div className="leading-tight">
                <div className="font-semibold text-xs">{item.label}</div>
                {item.subtitle && (
                  <div className="text-[9px] text-[#8fa89b] font-normal">{item.subtitle}</div>
                )}
              </div>
            </NavLink>
          );
        })}

        {/* Sign Out Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-[#fca5a5] hover:bg-[#ef44441a] transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>↗ Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
