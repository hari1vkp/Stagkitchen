import { NotebookPen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NoRecipeGenerated() {
  return (
    <Card className="w-full shadow-lg border-dashed border-2 border-muted-foreground/50">
      <CardHeader className="items-center text-center">
        <NotebookPen size={48} className="text-muted-foreground mb-4" />
        <CardTitle className="text-xl text-muted-foreground">Ready to Cook?</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">
          Enter your ingredients and preferences above, then click "Generate Recipe" to discover your next meal!
        </p>
      </CardContent>
    </Card>
  );
}
