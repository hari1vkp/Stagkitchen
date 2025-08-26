import { NotebookPen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NoRecipeGenerated() {
  return (
    <Card className="finpay-card border-dashed border-2 border-finpay-teal-300/30 bg-gradient-to-br from-finpay-teal-50/50 to-finpay-blue-50/50 text-center">
      <CardHeader className="items-center">
        <div className="bg-gradient-to-r from-finpay-teal-500 to-finpay-blue-500 p-4 rounded-full mb-4 shadow-md">
          <NotebookPen size={48} className="text-white" />
        </div>
        <CardTitle className="text-2xl font-bold finpay-gradient-text">Ready to Cook?</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-finpay-gray-600 max-w-md mx-auto text-lg leading-relaxed">
          Enter your ingredients and preferences above, then click "Generate Recipe" to discover your next meal!
        </p>
      </CardContent>
    </Card>
  );
}
