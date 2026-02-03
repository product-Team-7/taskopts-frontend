'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout, getUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import type { User } from '@/lib/auth';

export function Navbar() {
  const pathname = usePathname();
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    setUserState(getUser());
  }, []);

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/my-work', label: 'My Work' },
    { href: '/analytics', label: 'Analytics' },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ href: '/admin', label: 'Admin' });
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700"
            >
              TaskOps
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.href
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
