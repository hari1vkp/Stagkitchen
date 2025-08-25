import Link from 'next/link';
import { Soup, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 text-primary hover:text-primary/80 transition-colors">
          <div className="bg-accent p-2 rounded-lg">
            <Soup size={28} className="text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold">StagKitchen</h1>
        </Link>
        <nav>
          <ul className="flex items-center gap-2">
            <li>
              <Button variant="ghost" asChild>
                <Link href="/saved-recipes" className="flex items-center gap-2 text-base">
                  <Bookmark size={18} />
                  Saved
                </Link>
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
