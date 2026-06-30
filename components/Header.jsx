"use client";

import Image from "next/image";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Menu } from 'lucide-react';
import apiSlice from "@/api/apiSlice";
import { useGetMeQuery } from "@/features/userSlice";
import { useLogoutMutation } from "@/features/authSlice";
import { useAlert } from "@/context/AlertContext";
import { useSidebar } from "@/context/SidebarContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function Header() {
  const { data, isLoading } = useGetMeQuery();
  const [logout] = useLogoutMutation();
  const router = useRouter();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();

  const user = data?.data?.data ?? null;
  const isAuthenticated = !!user;
  const { open: openSidebar } = useSidebar();
  const pathname = usePathname();

  const dashboardRoutes = [
    '/me',
    '/my-tours',
    '/my-reviews',
    '/manage-tours',
    '/manage-users',
    '/manage-reviews',
    '/manage-bookings'
  ];

  const showHamburger = isAuthenticated && dashboardRoutes.includes(pathname);

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

  if(isLoading) return <LoadingScreen />;

  return (
    <header className="relative z-100 flex items-center justify-between gap-6 md:gap-0 bg-grey-700 px-6 lg:px-12 py-4 md:py-0 md:h-20">
      {/* Hamburger — mobile/tablet only, shown when a dashboard page is active */}
      {showHamburger && (
        <button
          onClick={openSidebar}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          title="Open Menu"
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>
      )}
      <nav className="hidden md:flex flex-col sm:flex-row items-center order-2 md:order-1 flex-1 md:basis-2/5">
        <Link
          href="/"
          className="nav-link inline-flex items-center text-grey-100 uppercase text-base font-normal transition-transform hover:-translate-y-0.5"
        >
          All tours
        </Link>
      </nav>

      <Link href="/" className="order-1 md:order-2 shrink-0">
        <Image 
          src="/img/logo-white.png"
          alt="Natours Logo"
          width={68}
          height={35}
          className="h-9"
        />
      </Link>

      <nav className="flex flex-col-reverse sm:flex-row items-end md:items-center gap-3 sm:gap-6 order-3 flex-1 md:basis-2/5 justify-end">
        {isAuthenticated && user ? (
          <>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden lg:flex text-grey-100 uppercase text-base font-normal transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              Log out
            </button>
            <Link
              href="/me"
              className="inline-flex items-center gap-3 text-grey-100 uppercase text-base font-normal transition-transform hover:-translate-y-0.5"
            >
              {user.photo ? (
                <Image
                  src={
                    user.photo.startsWith('http')
                      ? user.photo
                      : `/img/users/${user.photo}`
                  }
                  alt={`Photo of ${user.name}`}
                  width={35}
                  height={35}
                  className="rounded-full object-cover h-9 w-9"
                />
              ) : (
                <span className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold overflow-hidden">
                  {user.name?.[0]}
                </span>
              )}
              <span className="max-w-[120px] truncate lg:max-w-[150px] xl:max-w-[170px]">{user.name?.split(' ')[0]}</span>
            </Link>
          </>
        ) : isLoading ? (
          <span className="h-5" />
        ) : (
          <div className="flex gap-3 md:gap-6 items-center">
            <Link
              href="/login"
              className="text-grey-100 uppercase text-sm md:text-base font-normal transition-transform hover:-translate-y-0.5"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-grey-100 uppercase text-sm md:text-base font-normal rounded-full border border-current px-6 py-2 transition-all hover:bg-grey-100 hover:text-grey-600"
            >
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
