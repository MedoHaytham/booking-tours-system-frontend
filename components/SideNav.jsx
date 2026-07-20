'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Briefcase,
  Star,
  Map,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  Heart
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import apiSlice from '@/api/apiSlice';
import { useLogoutMutation } from '@/features/authSlice';
import { useAlert } from '@/context/AlertContext';
import { useSidebar } from '@/context/SidebarContext';

const items = [
  { href: '/me', label: 'Settings', icon: Settings, key: 'settings' },
  { href: '/my-favorites', label: 'My favorites', icon: Heart, key: 'favorites' },
  { href: '/my-tours', label: 'My bookings', icon: Briefcase, key: 'bookings' },
  { href: '/my-reviews', label: 'My reviews', icon: Star, key: 'reviews' },
];

const adminItems = [
  { href: '/manage-tours', label: 'Manage tours', icon: Map, key: 'manage-tours' },
  { href: '/manage-users', label: 'Manage users', icon: Users, key: 'manage-users' },
  { href: '/manage-reviews', label: 'Manage reviews', icon: Star, key: 'manage-reviews' },
  { href: '/manage-bookings', label: 'Manage bookings', icon: Briefcase, key: 'manage-bookings' },
];

function NavItem({ href, label, icon: Icon, isActive, isCollapsed, onClick }) {
  return (
    <li
      className={`my-4 border-l-4 transition-all ${
        isActive ? 'border-white' : 'border-transparent hover:border-white'
      }`}
    >
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center gap-7 py-4 text-white text-sm uppercase no-underline transition-all ${
          isCollapsed ? 'justify-center px-0' : 'px-10'
        } ${isActive ? '-translate-x-1' : 'hover:translate-x-1'}`}
        title={isCollapsed ? label : undefined}
      >
        <Icon size={19} className="shrink-0" />
        {!isCollapsed && <span className="truncate">{label}</span>}
      </Link>
    </li>
  );
}

export default function SideNav({ active = 'settings', isAdmin = false, isLeadGuide = false }) {
  // Desktop-only collapse state (icon-only rail)
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Mobile drawer state from context (shared with Header hamburger)
  const { isOpen, close } = useSidebar();

  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(apiSlice.util.resetApiState());
      showAlert('success', 'Logged out successfully!');
      router.push('/');
      router.refresh();
    } catch (err) {
      showAlert('error', err?.data?.message || 'Could not log out. Try again.');
    }
  };

  const navContent = (collapsed, isMobile = false) => (
    <>
      <ul className="list-none">
        {items.map(({ key, ...item }) => (
          <NavItem
            key={key}
            {...item}
            isActive={key === active}
            isCollapsed={collapsed}
            onClick={isMobile ? close : undefined}
          />
        ))}
      </ul>
      { isLeadGuide && (
        <div className="pt-5 border-t border-white/20">
          {!collapsed ? (
            <h5 className="px-10 mb-3 text-grey-100/70 text-xs uppercase tracking-wide">
              Lead Guide
            </h5>
          ) : (
            <div className="border-t border-white/20 my-4 mx-3" />
          )}
          <ul className="list-none">
            <NavItem
              href="/manage-tours"
              label="Manage tours"
              icon={Map}
              isActive={'manage-tours' === active}
              isCollapsed={collapsed}
              onClick={isMobile ? close : undefined}
            />
          </ul>
        </div>
      )}

      {isAdmin && (
        <div className="pt-5 border-t border-white/20">
          {!collapsed ? (
            <h5 className="px-10 mb-3 text-grey-100/70 text-xs uppercase tracking-wide">
              Admin
            </h5>
          ) : (
            <div className="border-t border-white/20 my-4 mx-3" />
          )}
          <ul className="list-none">
            {adminItems.map(({ key, ...item }) => (
              <NavItem
                key={key}
                {...item}
                isActive={key === active}
                isCollapsed={collapsed}
                onClick={isMobile ? close : undefined}
              />
            ))}
          </ul>
        </div>
      )}

      <div className={`pt-5 border-t border-white/20 ${collapsed ? 'px-3' : 'px-10'}`}>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-4 w-full text-white hover:text-white/70 text-sm uppercase tracking-wide group transition-all cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Log out' : undefined}
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/35 group-hover:bg-white/20 transition-colors shrink-0">
            <LogOut size={17} />
          </span>
          {!collapsed && <span className="truncate">Log out</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── MOBILE: Backdrop overlay ── */}
      {isOpen && (
        <div
          onClick={close}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 cursor-pointer"
        />
      )}

      {/* ── MOBILE: Slide-in drawer (< lg) ── */}
      <nav
        aria-label="Mobile navigation"
        className={`lg:hidden fixed inset-y-0 left-0 z-5000000 bg-gradient-primary py-12 flex flex-col w-72 shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={close}
          className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer transition-colors"
          title="Close Menu"
        >
          <X size={24} />
        </button>

        {navContent(false, true)}
      </nav>

      {/* ── DESKTOP: Inline sidebar (lg+) ── */}
      <nav
        aria-label="Desktop navigation"
        className={`hidden lg:flex flex-col flex-none bg-gradient-primary py-12 relative transition-[width] duration-300 ease-in-out lg:min-h-[77vh] ${
          isCollapsed ? 'w-20' : 'w-72 2xl:w-[20rem]'
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-6 -right-3.5 z-10 bg-white border border-grey-200 hover:border-primary text-grey-600 hover:text-primary w-7 h-7 rounded-full shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-105"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {navContent(isCollapsed)}
      </nav>
    </>
  );
}
