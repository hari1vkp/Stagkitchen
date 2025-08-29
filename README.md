# 🍳 StagKitchen - AI-Powered Kitchen Companion

> Your intelligent kitchen assistant for creating delicious recipes and planning nutritious meals with the power of artificial intelligence.

## ✨ Features

### 🎯 **Recipe Generation**
- **AI-Powered Recipe Creation**: Generate unique recipes from available ingredients
- **Smart Ingredient Optimization**: AI suggests creative ways to use what you have
- **Image Recognition**: Upload photos of ingredients for better recipe suggestions
- **Dietary Preferences**: Support for vegetarian, gluten-free, low-carb, dairy-free, and more
- **Recipe Categories**: Breakfast, lunch, dinner, snacks, and desserts

### 📅 **Daily Meal Planning** *(NEW!)*
- **Complete Daily Plans**: Generate breakfast, lunch, dinner, and snacks for the entire day
- **Smart Calorie Calculator**: Calculate maintenance calories based on height, weight, age, sex, and activity level
- **Calorie Control**: Set target daily calories (800-5000 range) with nutritional balance
- **Flexible Meal Count**: Choose between 3-6 meals per day
- **Ingredient Optimization**: Uses available ingredients to create balanced meal plans
- **Nutritional Summary**: Total calories, protein, carbs, fat, and fiber tracking
- **Shopping Lists**: Know what additional ingredients to buy
- **Meal Prep Tips**: Get helpful advice for planning and preparation

### 💾 **Recipe Management**
- **Save & Organize**: Store your favorite recipes locally
- **Quick Access**: Browse saved recipes with search and filtering
- **Recipe Sharing**: Easy access to your culinary creations
- **Local Storage**: All data stored securely in your browser

### 🎨 **Modern UI/UX**
- **Finpay UI Design**: Beautiful, modern interface with gradient accents
- **Dark Mode Support**: Full dark theme with toggle in header
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Micro-animations**: Smooth transitions, hover effects, and loading states
- **Accessibility**: Screen reader support and keyboard navigation

### 🌙 **Theme System**
- **Light/Dark Toggle**: Switch between themes with header button
- **System Preference**: Automatically detects and respects OS theme
- **Persistent Storage**: Remembers your theme choice
- **Flicker Prevention**: Smooth theme transitions without visual glitches

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google AI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hari1vkp/Stagkitchen
   cd StagKitchen
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

4. **Start the development server**
   ```bash
   # Terminal 1: Start Next.js app
   npm run dev
   
   # Terminal 2: Start Genkit AI server
   npm run genkit:dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Architecture

### **Frontend**
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: High-quality React components
- **React Hook Form**: Form handling and validation

### **AI Backend**
- **Genkit**: AI development framework
- **Google AI (Gemini)**: Advanced language model integration
- **Structured Output**: Type-safe AI responses with Zod schemas
- **Flow Management**: Organized AI workflows for different tasks

### **Data Flow**
```
User Input → React Form → API Route → Genkit Flow → Google AI → Structured Response → UI Display
```

## 📁 Project Structure

```
StagKitchen/
├── src/
│   ├── ai/                          # AI backend
│   │   ├── flows/                   # AI workflow definitions
│   │   │   ├── generate-recipe.ts   # Recipe generation
│   │   │   ├── generate-daily-meal-plan.ts  # Daily meal planning
│   │   │   ├── suggest-recipe-name.ts       # Recipe naming
│   │   │   └── summarize-recipe.ts          # Recipe summarization
│   │   ├── dev.ts                   # Development server entry
│   │   └── genkit.ts                # Genkit configuration
│   ├── app/                         # Next.js App Router
│   │   ├── api/                     # API routes
│   │   │   ├── recipe/              # Recipe generation endpoint
│   │   │   └── daily-meal-plan/     # Meal planning endpoint
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page
│   │   └── saved-recipes/           # Saved recipes page
│   ├── components/                   # React components
│   │   ├── common/                   # Shared components
│   │   ├── forms/                    # Form components
│   │   ├── layout/                   # Layout components
│   │   ├── recipe/                   # Recipe-related components
│   │   └── ui/                       # UI component library
│   ├── hooks/                        # Custom React hooks
│   ├── lib/                          # Utility functions
│   └── types/                        # TypeScript type definitions
├── public/                           # Static assets
├── tailwind.config.ts               # Tailwind CSS configuration
└── package.json                     # Dependencies and scripts
```

## 🔧 Configuration

### **Tailwind CSS**
Custom color palette matching Finpay UI design:
- Teal, Blue, Purple, Pink, Gray, Green, Yellow, Red variants
- Dark mode support with CSS variables
- Custom animation utilities

### **Genkit AI**
- Google AI integration with Gemini 2.0 Flash model
- Structured input/output schemas
- Image processing capabilities
- Error handling and validation

### **Next.js**
- App Router for modern routing
- API routes for backend communication
- Environment variable management
- TypeScript configuration

## 📱 Usage

### **Recipe Generation**
1. Navigate to the "Recipe Generator" tab
2. Enter your available ingredients
3. Add dietary preferences (optional)
4. Upload ingredient photos (optional)
5. Click "Generate Recipe"
6. Save your favorite recipes

### **Daily Meal Planning**
1. Click the "Daily Meal Plan" tab
2. **Optional**: Use the calorie calculator to determine your maintenance calories
   - Enter your height, weight, age, sex, and activity level
   - Get scientifically calculated daily calorie needs
3. Set your target daily calories (or use calculated value)
4. Choose number of meals (3-6)
5. List available ingredients
6. Add dietary restrictions
7. Upload ingredient photos (optional)
8. Generate your complete meal plan

### **Managing Recipes**
1. Use the "Saved Recipes" tab
2. View all your saved recipes
3. Access recipe details and instructions
4. Organize your culinary collection

## 🎨 UI Components

### **Finpay Design System**
- **Cards**: Elevated components with hover effects
- **Buttons**: Gradient primary, secondary, and accent variants
- **Forms**: Styled inputs, textareas, and select components
- **Badges**: Color-coded meal types and difficulty levels
- **Animations**: Fade-ins, slide-ups, and hover interactions

### **Responsive Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🔒 Security & Privacy

- **Local Storage**: All data stored in user's browser
- **No External Storage**: Recipes and preferences stay private
- **API Key Security**: Environment variables for sensitive data
- **Input Validation**: Client and server-side validation

## 🚀 Deployment

### **Build for Production**
```bash
npm run build
npm start
```

### **Environment Variables**
Ensure these are set in production:
- `GOOGLE_AI_API_KEY`: Your Google AI API key

### **Port Configuration**
- **Development**: Port 3000 (Next.js) + Port 4000 (Genkit)
- **Production**: Configurable via environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

**StagKitchen Team:**
- **Hariharasudhan R** - Lead Developer & Project Creator

## 🙏 Acknowledgments

- **Google AI** for providing the Gemini language model
- **Genkit** for the AI development framework
- **Next.js** team for the excellent React framework
- **Tailwind CSS** for the utility-first CSS approach
- **Shadcn/ui** for the beautiful component library

## 📞 Support

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include your environment details and error messages

---

**Made with ❤️ and ☕ by the StagKitchen team**

*Transform your ingredients into culinary masterpieces with the power of artificial intelligence!* 
