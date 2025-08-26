"use client";

import Link from 'next/link';
import { Soup, Bookmark, Search, Bell, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';

export default function Header() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header className="bg-white/80 dark:bg-background/80 backdrop-blur-sm border-b border-finpay-gray-200 dark:border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center gap-2">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 text-finpay-gray-900 dark:text-foreground hover:text-finpay-gray-700 dark:hover:text-foreground/80 transition-all duration-300 group">
          <div className="bg-gradient-to-r from-finpay-teal-500 to-finpay-blue-500 p-2.5 sm:p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
            <Soup size={24} className="sm:hidden text-white" />
            <Soup size={28} className="hidden sm:block text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold finpay-gradient-text">StagKitchen</h1>
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="text-finpay-gray-600 dark:text-foreground/80 hover:text-finpay-gray-800 dark:hover:text-foreground hover:bg-finpay-gray-100 dark:hover:bg-muted/40">
            <Search size={18} className="sm:hidden" />
            <Search size={20} className="hidden sm:block" />
          </Button>
          <Button variant="ghost" size="icon" className="text-finpay-gray-600 dark:text-foreground/80 hover:text-finpay-gray-800 dark:hover:text-foreground hover:bg-finpay-gray-100 dark:hover:bg-muted/40">
            <Bell size={18} className="sm:hidden" />
            <Bell size={20} className="hidden sm:block" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="text-finpay-gray-600 dark:text-foreground/80 hover:text-finpay-gray-800 dark:hover:text-foreground hover:bg-finpay-gray-100 dark:hover:bg-muted/40"
          >
            {mounted && theme === 'dark' ? (
              <Sun size={20} />
            ) : (
              <Moon size={20} />
            )}
          </Button>
          <nav>
            <ul className="flex items-center gap-2">
              <li>
                <Button 
                  variant="ghost" 
                  asChild 
                  className="finpay-button-secondary text-sm sm:text-base px-3 sm:px-4 py-2"
                >
                  <Link href="/saved-recipes" className="flex items-center gap-1.5 sm:gap-2">
                    <Bookmark size={16} className="sm:hidden" />
                    <Bookmark size={18} className="hidden sm:block" />
                    <span className="hidden xs:inline sm:inline">Saved</span>
                  </Link>
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
