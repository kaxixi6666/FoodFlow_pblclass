import { Search, PlusCircle, Clock, Users } from "lucide-react";
import { useState } from "react";
import { Input } from "../components/ui/input";

interface Recipe {
  id: number;
  name: string;
  ingredients: string[];
  missingIngredients: number;
  totalIngredients: number;
  prepTime: string;
  servings: number;
}

interface InventoryItem {
  name: string;
  quantity: number;
  unit: string;
}

// Mock inventory data
const mockInventory: InventoryItem[] = [];

// Mock recipe data
const mockRecipes: Recipe[] = [];

export function SmartFilter() {
  const [canCook, setCanCook] = useState(false);
  const [maxMissing, setMaxMissing] = useState(2);
  const [canPlan, setCanPlan] = useState(false);
  const [recipeScope, setRecipeScope] = useState("all");
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(mockRecipes);

  const getStatusLabel = (missing: number, total: number) => {
    if (missing === 0) {
      return { label: "All ingredients available", color: "bg-orange-100 text-orange-700" };
    } else if (missing <= 2) {
      return { label: `${missing} missing ingredients`, color: "bg-yellow-100 text-yellow-700" };
    } else {
      return { label: "Limited availability", color: "bg-gray-100 text-gray-700" };
    }
  };

  const applyFilters = () => {
    let results = [...mockRecipes];

    // Apply scope filter
    if (recipeScope === "my-recipes") {
      // Filter for my recipes (simulated)
      results = results.filter((_, index) => index % 2 === 0);
    } else if (recipeScope === "public-recipes") {
      // Filter for public recipes (simulated)
      results = results.filter((_, index) => index % 2 !== 0);
    }

    // Apply can cook filter
    if (canCook) {
      results = results.filter(recipe => recipe.missingIngredients === 0);
    }

    // Apply max missing filter
    if (!canPlan) {
      results = results.filter(recipe => recipe.missingIngredients <= maxMissing);
    }

    setFilteredRecipes(results);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Side: Filter Control Panel */}
      <div className="lg:w-80 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Filter Control</h3>

          {/* Filter Options */}
          <div className="space-y-6">
            {/* Can Cook Immediately */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Can Cook Immediately</label>
                <input
                  type="checkbox"
                  checked={canCook}
                  onChange={(e) => setCanCook(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#4CAF50] focus:ring-[#4CAF50]"
                />
              </div>
              <p className="text-xs text-gray-500">Only show recipes with all ingredients available</p>
            </div>

            {/* Max Missing Ingredients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Missing Ingredients</label>
              <Input
                type="number"
                min="0"
                max="10"
                value={maxMissing}
                onChange={(e) => setMaxMissing(parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>

            {/* Can Plan */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Can Plan (Ignore Inventory)</label>
                <input
                  type="checkbox"
                  checked={canPlan}
                  onChange={(e) => setCanPlan(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#4CAF50] focus:ring-[#4CAF50]"
                />
              </div>
              <p className="text-xs text-gray-500">Show all recipes regardless of inventory</p>
            </div>

            {/* Recipe Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Recipe Scope</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value="all"
                    checked={recipeScope === "all"}
                    onChange={(e) => setRecipeScope(e.target.value)}
                    className="w-4 h-4 border-gray-300 text-[#4CAF50] focus:ring-[#4CAF50]"
                  />
                  <span className="text-sm text-gray-700">All Recipes</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value="my-recipes"
                    checked={recipeScope === "my-recipes"}
                    onChange={(e) => setRecipeScope(e.target.value)}
                    className="w-4 h-4 border-gray-300 text-[#4CAF50] focus:ring-[#4CAF50]"
                  />
                  <span className="text-sm text-gray-700">My Recipes</span>
                </label>
                <label className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="scope"
                    value="public-recipes"
                    checked={recipeScope === "public-recipes"}
                    onChange={(e) => setRecipeScope(e.target.value)}
                    className="w-4 h-4 border-gray-300 text-[#4CAF50] focus:ring-[#4CAF50]"
                  />
                  <span className="text-sm text-gray-700">Public Recipes</span>
                </label>
              </div>
            </div>
          </div>

          {/* Apply Button */}
          <button
            onClick={applyFilters}
            className="w-full mt-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Right Side: Filter Results */}
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Filter Results</h3>
              <span className="text-sm text-gray-600">{filteredRecipes.length} recipes found</span>
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => {
                const status = getStatusLabel(recipe.missingIngredients, recipe.totalIngredients);
                return (
                  <div key={recipe.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Recipe Content */}
                    <div className="p-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">{recipe.name}</h4>

                      {/* Ingredients List */}
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-2">Ingredients</div>
                        <div className="flex flex-wrap gap-1">
                          {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
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

                      {/* Status Label */}
                      <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mb-4 ${status.color}`}>
                        {status.label}
                      </div>

                      {/* Recipe Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.prepTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{recipe.servings} servings</span>
                        </div>
                      </div>

                      {/* Add to Plan Button */}
                      <button className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                        <PlusCircle className="w-4 h-4" />
                        Add to Plan
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No Results */}
            {filteredRecipes.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                No recipes match your filter criteria
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}