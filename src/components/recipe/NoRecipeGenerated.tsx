import { NotebookPen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NoRecipeGenerated() {
  return (
    <Card className="w-full shadow-xl border-dashed border-2 border-border/70 bg-transparent text-center">
      <CardHeader className="items-center">
        <NotebookPen size={48} className="text-muted-foreground mb-4" />
        <CardTitle className="text-xl text-muted-foreground">Ready to Cook?</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground max-w-md mx-auto">
          Enter your ingredients and preferences above, then click "Generate Recipe" to discover your next meal!
        </p>
      </CardContent>
    </Card>
  );
}
