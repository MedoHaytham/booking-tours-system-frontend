'use client';

import Link from 'next/link';
import { Settings, Briefcase, Star, CreditCard, Map, Users, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import apiSlice from '@/api/apiSlice';
import { useLogoutMutation } from '@/features/authSlice';
import { useAlert } from '@/context/AlertContext';

const items = [
  { href: '/me', label: 'Settings', icon: Settings, key: 'settings' },
  { href: '/my-tours', label: 'My bookings', icon: Briefcase, key: 'bookings' },
  { href: '/my-reviews', label: 'My reviews', icon: Star, key: 'reviews' },
];

const adminItems = [
  { href: '#', label: 'Manage tours', icon: Map },
  { href: '#', label: 'Manage users', icon: Users },
  { href: '#', label: 'Manage reviews', icon: Star },
  { href: '#', label: 'Manage bookings', icon: Briefcase },
];

function NavItem({ href, label, icon: Icon, isActive }) {
  return (
    <li
      className={`my-4 border-l-4 transition-all ${
        isActive ? 'border-white' : 'border-transparent hover:border-white'
      }`}
    >
      <Link
        href={href}
        className={`flex items-center gap-7 px-10 py-4 text-white text-sm uppercase no-underline transition-transform ${
          isActive ? '-translate-x-1' : 'hover:translate-x-1'
        }`}
      >
        <Icon size={19} />
        {label}
      </Link>
    </li>
  );
}

export default function SideNav({ active = 'settings', isAdmin = false }) {
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

  return (
    <nav className="flex-none 2xl:w-[20rem] bg-gradient-primary py-12 flex flex-col lg:min-h-[77vh]">
      <ul className="list-none">
        {items.map(({ key, ...item }) => (
          <NavItem key={key} {...item} isActive={key === active} />
        ))}
      </ul>

      {isAdmin && (
        <div className="mt-10">
          <h5 className="px-10 mb-3 text-grey-100/70 text-xs uppercase tracking-wide">
            Admin
          </h5>
          <ul className="list-none">
            {adminItems.map((item) => (
              <NavItem key={item.label} {...item} isActive={false} />
            ))}
          </ul>
        </div>
      )}

      {/* Logout button */}
      <div className="px-10 pt-5 border-t border-white/70">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full text-white hover:text-white/70 text-sm uppercase tracking-wide group transition-all cursor-pointer"
        >
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/35 group-hover:bg-white/20 transition-colors">
            <LogOut size={17} />
          </span>
          Log out
        </button>
      </div>
    </nav>
  );
}

