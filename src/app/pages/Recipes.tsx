import { Search, Plus, Clock, Users, ChefHat, ChevronDown, ChevronUp, MoreVertical, PlusCircle } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  status: "draft" | "private" | "public";
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  instructions?: string;
}

const myRecipes: Recipe[] = [
  {
    id: 1,
    name: "Grilled Chicken Salad",
    ingredients: ["Chicken Breast", "Fresh Spinach", "Cherry Tomatoes", "Olive Oil"],
    status: "private",
    prepTime: "15 min",
    cookTime: "20 min",
    servings: 2,
  },
  {
    id: 2,
    name: "Pasta Primavera",
    ingredients: ["Pasta", "Fresh Spinach", "Cherry Tomatoes", "Garlic", "Parmesan"],
    status: "draft",
    prepTime: "10 min",
    cookTime: "25 min",
    servings: 4,
  },
  {
    id: 3,
    name: "Greek Yogurt Parfait",
    ingredients: ["Greek Yogurt", "Honey", "Granola", "Berries"],
    status: "private",
    prepTime: "5 min",
    cookTime: "0 min",
    servings: 1,
  },
];

const publicRecipes: Recipe[] = [
  {
    id: 4,
    name: "Stir-Fry Vegetables",
    ingredients: ["Fresh Spinach", "Soy Sauce", "Garlic", "Ginger", "Brown Rice"],
    status: "public",
    prepTime: "10 min",
    cookTime: "15 min",
    servings: 2,
  },
  {
    id: 5,
    name: "Chicken Rice Bowl",
    ingredients: ["Chicken Breast", "Brown Rice", "Vegetables", "Teriyaki Sauce"],
    status: "public",
    prepTime: "15 min",
    cookTime: "30 min",
    servings: 3,
  },
  {
    id: 6,
    name: "Cheese Omelette",
    ingredients: ["Eggs", "Cheddar Cheese", "Milk", "Butter"],
    status: "public",
    prepTime: "5 min",
    cookTime: "10 min",
    servings: 1,
  },
];

const availableIngredients = [
  "Chicken Breast", "Fresh Spinach", "Cherry Tomatoes", "Olive Oil", "Pasta", "Garlic", "Parmesan",
  "Greek Yogurt", "Honey", "Granola", "Berries", "Soy Sauce", "Ginger", "Brown Rice",
  "Eggs", "Cheddar Cheese", "Milk", "Butter", "Teriyaki Sauce", "Vegetables"
];

export function Recipes() {
  const [isCreating, setIsCreating] = useState(false);
  const [recipeName, setRecipeName] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [instructions, setInstructions] = useState("");
  const [servings, setServings] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(item => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleSaveDraft = () => {
    // Save draft logic
    console.log("Saving draft...");
    resetForm();
  };

  const handlePublish = () => {
    // Publish logic
    console.log("Publishing recipe...");
    resetForm();
  };

  const resetForm = () => {
    setRecipeName("");
    setSelectedIngredients([]);
    setInstructions("");
    setServings("");
    setPrepTime("");
    setCookTime("");
    setIsCreating(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">Draft</span>;
      case "private":
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">Private</span>;
      case "public":
        return <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">Public</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Recipe Section (Collapsible) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="w-full flex items-center justify-between p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h2 className="text-lg font-medium text-gray-900">Create Recipe</h2>
          {isCreating ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
        </button>

        {isCreating && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
                  <Input
                    type="text"
                    placeholder="Enter recipe name"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                  <div className="border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {availableIngredients.map((ingredient) => (
                        <label key={ingredient} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedIngredients.includes(ingredient)}
                            onChange={() => toggleIngredient(ingredient)}
                            className="w-4 h-4 rounded border-gray-300 text-[#4CAF50] focus:ring-[#4CAF50]"
                          />
                          <span className="text-sm text-gray-700">{ingredient}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cooking Instructions</label>
                  <Textarea
                    placeholder="Enter step-by-step cooking instructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cook Time (min)</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={handleSaveDraft}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={handlePublish}
                className="px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors"
              >
                Publish Recipe
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recipe Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <Tabs defaultValue="my-recipes">
          <TabsList className="w-full max-w-md mx-auto">
            <TabsTrigger value="my-recipes" className="flex-1">My Recipes</TabsTrigger>
            <TabsTrigger value="public-recipes" className="flex-1">Public Recipes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-recipes" className="p-6">
            {/* My Recipes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRecipes.map((recipe) => (
                <div key={recipe.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Recipe Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                    <ChefHat className="w-16 h-16 text-primary opacity-50" />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">{recipe.name}</h3>
                      {getStatusBadge(recipe.status)}
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Ingredients ({recipe.ingredients.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            {ingredient}
                          </span>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            +{recipe.ingredients.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {recipe.prepTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{recipe.prepTime}</span>
                          </div>
                        )}
                        {recipe.servings && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{recipe.servings}</span>
                          </div>
                        )}
                      </div>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="public-recipes" className="p-6">
            {/* Public Recipes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicRecipes.map((recipe) => (
                <div key={recipe.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Recipe Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                    <ChefHat className="w-16 h-16 text-primary opacity-50" />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">{recipe.name}</h3>
                      {getStatusBadge(recipe.status)}
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Ingredients ({recipe.ingredients.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            {ingredient}
                          </span>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            +{recipe.ingredients.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        Add to Plan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}