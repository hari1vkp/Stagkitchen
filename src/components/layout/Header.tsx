import Link from 'next/link';
import { Soup, Bookmark, Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-finpay-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-finpay-gray-900 hover:text-finpay-gray-700 transition-all duration-300 group">
          <div className="bg-gradient-to-r from-finpay-teal-500 to-finpay-blue-500 p-3 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
            <Soup size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold finpay-gradient-text">StagKitchen</h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-finpay-gray-600 hover:text-finpay-gray-800 hover:bg-finpay-gray-100">
            <Search size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="text-finpay-gray-600 hover:text-finpay-gray-800 hover:bg-finpay-gray-100">
            <Bell size={20} />
          </Button>
          <nav>
            <ul className="flex items-center gap-2">
              <li>
                <Button 
                  variant="ghost" 
                  asChild 
                  className="finpay-button-secondary text-base px-4 py-2"
                >
                  <Link href="/saved-recipes" className="flex items-center gap-2">
                    <Bookmark size={18} />
                    Saved
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
