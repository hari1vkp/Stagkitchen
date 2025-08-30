"use client";

import { useState, useEffect } from 'react';
import { ShoppingCart, Check, Plus, Minus, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ShoppingListProps {
  ingredients: string;
  recipeName: string;
}

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  category?: string;
}

const categorizeIngredient = (ingredient: string): string => {
  const lower = ingredient.toLowerCase();
  
  if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') || 
      lower.includes('fish') || lower.includes('meat') || lower.includes('salmon') ||
      lower.includes('turkey') || lower.includes('lamb')) {
    return 'Meat & Seafood';
  }
  
  if (lower.includes('milk') || lower.includes('cheese') || lower.includes('yogurt') || 
      lower.includes('butter') || lower.includes('cream') || lower.includes('egg')) {
    return 'Dairy & Eggs';
  }
  
  if (lower.includes('tomato') || lower.includes('onion') || lower.includes('carrot') ||
      lower.includes('potato') || lower.includes('pepper') || lower.includes('lettuce') ||
      lower.includes('spinach') || lower.includes('broccoli') || lower.includes('garlic') ||
      lower.includes('ginger') || lower.includes('cucumber') || lower.includes('celery')) {
    return 'Vegetables';
  }
  
  if (lower.includes('apple') || lower.includes('banana') || lower.includes('orange') ||
      lower.includes('lemon') || lower.includes('lime') || lower.includes('berry') ||
      lower.includes('grape') || lower.includes('mango') || lower.includes('avocado')) {
    return 'Fruits';
  }
  
  if (lower.includes('rice') || lower.includes('bread') || lower.includes('pasta') ||
      lower.includes('flour') || lower.includes('oats') || lower.includes('quinoa') ||
      lower.includes('noodle') || lower.includes('cereal')) {
    return 'Grains & Bread';
  }
  
  if (lower.includes('oil') || lower.includes('salt') || lower.includes('pepper') ||
      lower.includes('spice') || lower.includes('herb') || lower.includes('sauce') ||
      lower.includes('vinegar') || lower.includes('sugar') || lower.includes('honey')) {
    return 'Condiments & Spices';
  }
  
  return 'Other';
};

const parseIngredients = (ingredients: string): ShoppingItem[] => {
  if (!ingredients) return [];
  
  console.log('Raw ingredients:', ingredients); // Debug log
  
  // First try to split by newlines
  let lines = ingredients.split(/\r?\n/).filter(line => line.trim());
  
  // If we only have one line, try other separators
  if (lines.length === 1) {
    const singleLine = lines[0];
    
    // Try splitting by common patterns
    if (singleLine.includes(', ')) {
      lines = singleLine.split(', ');
    } else if (singleLine.includes('; ')) {
      lines = singleLine.split('; ');
    } else if (singleLine.includes(' • ')) {
      lines = singleLine.split(' • ');
    } else if (singleLine.includes(' - ')) {
      lines = singleLine.split(' - ');
    } else {
      // Try to detect numbered lists like "1. item 2. item"
      const numberedMatch = singleLine.match(/\d+\.\s*[^0-9]+/g);
      if (numberedMatch) {
        lines = numberedMatch;
      }
    }
  }
  
  const items: ShoppingItem[] = [];
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines and headers
    if (!trimmedLine || trimmedLine.match(/^(ingredients?:?|recipe:?|shopping\s*list:?)$/i)) {
      return;
    }
    
    // Clean up the line by removing list markers
    let cleanedItem = trimmedLine
      .replace(/^\s*(\d+\.?\s*|\d+\)\s*|-\s*|\*\s*|•\s*)/i, '') // Remove list markers
      .replace(/^\s*ingredients?:?\s*/i, '') // Remove "ingredients:" prefix
      .trim();
    
    if (cleanedItem && cleanedItem.length > 1) {
      items.push({
        id: `${Date.now()}-${index}-${Math.random()}`,
        name: cleanedItem,
        checked: false,
        category: categorizeIngredient(cleanedItem)
      });
    }
  });
  
  console.log('Parsed items:', items); // Debug log
  return items;
};

export default function ShoppingList({ ingredients, recipeName }: ShoppingListProps) {
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [showChecked, setShowChecked] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const items = parseIngredients(ingredients);
    setShoppingItems(items);
  }, [ingredients]);
  
  const toggleItem = (id: string) => {
    setShoppingItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };
  
  const checkedCount = shoppingItems.filter(item => item.checked).length;
  const totalCount = shoppingItems.length;
  
  const groupedItems = shoppingItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);
  
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const uncheckedItems = shoppingItems.filter(item => !item.checked);
    const groupedUnchecked = uncheckedItems.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ShoppingItem[]>);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Shopping List - ${recipeName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #0891b2; border-bottom: 2px solid #0891b2; padding-bottom: 10px; }
            h2 { color: #0f766e; margin-top: 25px; margin-bottom: 10px; }
            ul { list-style: none; padding: 0; }
            li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .checkbox { width: 15px; height: 15px; border: 2px solid #0891b2; margin-right: 10px; display: inline-block; }
            .header { margin-bottom: 20px; }
            .date { color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Shopping List</h1>
            <p><strong>Recipe:</strong> ${recipeName}</p>
            <p class="date">Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          ${Object.entries(groupedUnchecked).map(([category, items]) => `
            <h2>${category}</h2>
            <ul>
              ${items.map(item => `
                <li>
                  <span class="checkbox"></span>
                  ${item.name}
                </li>
              `).join('')}
            </ul>
          `).join('')}
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };
  
  const saveShoppingList = () => {
    const uncheckedItems = shoppingItems.filter(item => !item.checked);
    const listData = {
      id: Date.now().toString(),
      recipeName,
      items: uncheckedItems,
      createdAt: new Date().toISOString()
    };
    
    const savedLists = JSON.parse(localStorage.getItem('shopping_lists') || '[]');
    savedLists.push(listData);
    localStorage.setItem('shopping_lists', JSON.stringify(savedLists));
    
    toast({
      title: "Shopping List Saved!",
      description: `Shopping list for "${recipeName}" has been saved.`,
      variant: "default",
    });
  };
  
  if (shoppingItems.length === 0) {
    return null;
  }
  
  return (
    <Card className="finpay-card finpay-card-hover border-finpay-green-200/30 dark:border-border">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-lg md:text-xl font-bold text-finpay-gray-900 dark:text-foreground flex items-center gap-2">
            <div className="bg-finpay-green-100 dark:bg-finpay-green-900/20 p-2 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-finpay-green-600 dark:text-finpay-green-400" />
            </div>
            <span className="text-base sm:text-lg md:text-xl">Shopping List</span>
            <Badge variant="secondary" className="text-xs">
              {checkedCount}/{totalCount}
            </Badge>
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChecked(!showChecked)}
              className="text-xs w-full sm:w-auto"
            >
              {showChecked ? <Minus className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
              <span className="hidden sm:inline">{showChecked ? 'Hide' : 'Show'} Checked</span>
              <span className="sm:hidden">{showChecked ? 'Hide' : 'Show'}</span>
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="text-xs flex-1 sm:flex-none"
              >
                <Printer className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveShoppingList}
                className="text-xs flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Save List</span>
                <span className="sm:hidden">Save</span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4 md:space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => {
            const visibleItems = showChecked ? items : items.filter(item => !item.checked);
            if (visibleItems.length === 0) return null;
            
            return (
              <div key={category}>
                <h3 className="font-semibold text-finpay-gray-800 dark:text-foreground mb-3 flex items-center gap-2 text-sm md:text-base">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-finpay-teal-500 rounded-full flex-shrink-0"></div>
                  <span className="flex-1">{category}</span>
                  <Badge variant="outline" className="text-xs">
                    {items.filter(item => !item.checked).length} needed
                  </Badge>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {visibleItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                        item.checked
                          ? 'bg-finpay-green-50 dark:bg-finpay-green-900/10 border-finpay-green-200 dark:border-finpay-green-800'
                          : 'bg-white dark:bg-muted/40 border-finpay-gray-200 dark:border-border hover:bg-finpay-gray-50 dark:hover:bg-muted/60'
                      }`}
                    >
                      <Checkbox
                        id={item.id}
                        checked={item.checked}
                        onCheckedChange={() => toggleItem(item.id)}
                        className="data-[state=checked]:bg-finpay-green-600 data-[state=checked]:border-finpay-green-600 flex-shrink-0"
                      />
                      <label
                        htmlFor={item.id}
                        className={`flex-1 text-sm md:text-base cursor-pointer break-words ${
                          item.checked
                            ? 'line-through text-finpay-gray-500 dark:text-muted-foreground'
                            : 'text-finpay-gray-700 dark:text-foreground'
                        }`}
                      >
                        {item.name}
                      </label>
                      {item.checked && (
                        <Check className="h-4 w-4 text-finpay-green-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {checkedCount > 0 && (
          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-finpay-green-50 dark:bg-finpay-green-900/10 rounded-lg border border-finpay-green-200 dark:border-finpay-green-800">
            <div className="flex items-center gap-2 text-finpay-green-700 dark:text-finpay-green-300">
              <Check className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
              <span className="font-medium text-sm md:text-base">
                Great! You have {checkedCount} out of {totalCount} ingredients ready.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}