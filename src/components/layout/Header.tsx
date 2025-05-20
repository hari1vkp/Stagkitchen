import Link from 'next/link';
import { Soup, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <Soup size={32} />
          <h1 className="text-2xl font-bold">Recipe Snap</h1>
        </Link>
        <nav>
          <ul className="flex items-center gap-4">
            <li>
              <Button variant="ghost" asChild>
                <Link href="/saved-recipes" className="flex items-center gap-1">
                  <Bookmark size={18} />
                  Saved Recipes
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
