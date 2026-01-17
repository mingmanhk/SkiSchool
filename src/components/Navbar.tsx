'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-gray-900 dark:text-white">
            Ski School OS
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/programs" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
              Programs
            </Link>
            <Link href="/schedule" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
              Schedule
            </Link>
            <Link href="/instructors" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
              Instructors
            </Link>
            <Link href="/faq" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
              FAQ
            </Link>
            <Link href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Button onClick={handleLogout} variant="secondary">
                Logout
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-900 dark:text-white focus:outline-none">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16m-7 6h7'}
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4">
            <Link href="/programs" className="block py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
              Programs
            </Link>
            <Link href="/schedule" className="block py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
              Schedule
            </Link>
            <Link href="/instructors" className="block py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
              Instructors
            </Link>
            <Link href="/faq" className="block py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
              FAQ
            </Link>
            <Link href="/contact" className="block py-2 px-4 text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
              Contact
            </Link>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
              {user ? (
                <Button onClick={handleLogout} variant="secondary" className="w-full">
                  Logout
                </Button>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href="/login">
                    <Button variant="ghost" className="w-full">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
