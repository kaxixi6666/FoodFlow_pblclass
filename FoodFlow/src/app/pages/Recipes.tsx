import { Search, Plus, Clock, Users, ChefHat, ChevronDown, ChevronUp, MoreVertical, PlusCircle, X, Clock3, Users2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";

interface Ingredient {
  id: number;
  name: string;
}

interface Recipe {
  id: number;
  name: string;
  ingredients: Ingredient[];
  status: "draft" | "private" | "public";
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  instructions?: string;
}

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
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Fetch recipes and ingredients from API on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Fetch all recipes
        const response = await fetch('http://localhost:8080/api/recipes');
        const data = await response.json();
        
        // Separate recipes by status
        const draftRecipes = data.filter((recipe: Recipe) => recipe.status === 'draft');
        const publicRecipesList = data.filter((recipe: Recipe) => recipe.status === 'public');
        
        // Set state
        setMyRecipes([...draftRecipes, ...publicRecipesList]);
        setPublicRecipes(publicRecipesList);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    const fetchIngredients = async () => {
      try {
        // Fetch all ingredients
        const response = await fetch('http://localhost:8080/api/ingredients');
        const data = await response.json();
        setAllIngredients(data);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      }
    };

    fetchRecipes();
    fetchIngredients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.relative')) {
          setShowMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(item => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleSaveDraft = async () => {
    // Validate required fields
    if (!recipeName.trim()) {
      alert("Please add Recipe Name");
      return;
    }
    
    try {
      // Find ingredients with their IDs
      const ingredientsWithIds = selectedIngredients.map(ingredientName => {
        const ingredient = allIngredients.find(ing => ing.name === ingredientName);
        console.log(`Looking for ingredient: "${ingredientName}", found:`, ingredient);
        return ingredient ? { id: ingredient.id, name: ingredient.name } : { name: ingredientName };
      });
      
      console.log("Selected ingredients:", selectedIngredients);
      console.log("All ingredients from DB:", allIngredients);
      
      // Create recipe data with ingredients
      const recipeData = {
        name: recipeName.trim(),
        status: "draft",
        prepTime: prepTime ? `${prepTime} min` : undefined,
        cookTime: cookTime ? `${cookTime} min` : undefined,
        servings: servings ? parseInt(servings) : undefined,
        instructions: instructions.trim() || undefined,
        ingredients: ingredientsWithIds
      };
      
      console.log("Sending recipe data:", JSON.stringify(recipeData, null, 2));
      
      // Call API to save recipe
      const response = await fetch('http://localhost:8080/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeData)
      });
      
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error('Failed to save recipe');
      }
      
      const savedRecipe = await response.json();
      
      // Update local state
      setMyRecipes(prev => [...prev, savedRecipe]);
      console.log("Saved draft successfully!");
      alert("Recipe saved as draft");
      resetForm();
      
      // Refresh recipes list
      const fetchRecipes = async () => {
        try {
          const response = await fetch('http://localhost:8080/api/recipes');
          const data = await response.json();
          const draftRecipes = data.filter((recipe: Recipe) => recipe.status === 'draft');
          const publicRecipesList = data.filter((recipe: Recipe) => recipe.status === 'public');
          setMyRecipes([...draftRecipes, ...publicRecipesList]);
          setPublicRecipes(publicRecipesList);
        } catch (error) {
          console.error('Error fetching recipes:', error);
        }
      };
      
      fetchRecipes();
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    }
  };

  const handlePublish = async () => {
    // Validate required fields
    if (!recipeName.trim()) {
      alert("Please add Recipe Name");
      return;
    }
    
    try {
      // Find ingredients with their IDs
      const ingredientsWithIds = selectedIngredients.map(ingredientName => {
        const ingredient = allIngredients.find(ing => ing.name === ingredientName);
        return ingredient ? { id: ingredient.id, name: ingredient.name } : { name: ingredientName };
      });
      
      // Create recipe data with ingredients
      const recipeData = {
        name: recipeName.trim(),
        status: "public",
        prepTime: prepTime ? `${prepTime} min` : undefined,
        cookTime: cookTime ? `${cookTime} min` : undefined,
        servings: servings ? parseInt(servings) : undefined,
        instructions: instructions.trim() || undefined,
        ingredients: ingredientsWithIds
      };
      
      // Call API to save recipe
      const response = await fetch('http://localhost:8080/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to publish recipe');
      }
      
      const savedRecipe = await response.json();
      
      // Update local state
      setMyRecipes(prev => [...prev, savedRecipe]);
      setPublicRecipes(prev => [...prev, savedRecipe]);
      console.log("Published recipe successfully!");
      alert("Recipe published successfully");
      resetForm();
      
      // Refresh recipes list
      const fetchRecipes = async () => {
        try {
          const response = await fetch('http://localhost:8080/api/recipes');
          const data = await response.json();
          const draftRecipes = data.filter((recipe: Recipe) => recipe.status === 'draft');
          const publicRecipesList = data.filter((recipe: Recipe) => recipe.status === 'public');
          setMyRecipes([...draftRecipes, ...publicRecipesList]);
          setPublicRecipes(publicRecipesList);
        } catch (error) {
          console.error('Error fetching recipes:', error);
        }
      };
      
      fetchRecipes();
    } catch (error) {
      console.error('Error publishing recipe:', error);
      alert('Failed to publish recipe. Please try again.');
    }
  };

  const resetForm = () => {
    setRecipeName("");
    setSelectedIngredients([]);
    setInstructions("");
    setServings("");
    setPrepTime("");
    setCookTime("");
    if (!isEditing) {
      setIsCreating(false);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowDetail(true);
  };

  const closeDetailView = () => {
    setShowDetail(false);
    setSelectedRecipe(null);
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

  const handleMenuClick = (e: React.MouseEvent, recipeId: number) => {
    e.stopPropagation();
    setShowMenu(recipeId);
  };

  const handleView = (recipe: Recipe) => {
    setShowMenu(null);
    setShowDetail(false);
    setTimeout(() => {
      setSelectedRecipe(recipe);
      setShowDetail(true);
    }, 100);
  };

  const handleUpdate = (recipe: Recipe) => {
    setShowMenu(null);
    setShowDetail(false);
    setTimeout(() => {
      setEditingRecipe(recipe);
      setRecipeName(recipe.name);
      setSelectedIngredients(recipe.ingredients.map(ing => ing.name));
      setInstructions(recipe.instructions || "");
      setServings(recipe.servings?.toString() || "");
      setPrepTime(recipe.prepTime?.replace(" min", "") || "");
      setCookTime(recipe.cookTime?.replace(" min", "") || "");
      setIsEditing(true);
      setIsCreating(true);
    }, 100);
  };

  const handleDeleteClick = (recipe: Recipe) => {
    setShowMenu(null);
    setEditingRecipe(recipe);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!editingRecipe) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/recipes/${editingRecipe.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }
      
      alert('Recipe deleted successfully');
      setShowDeleteConfirm(false);
      setEditingRecipe(null);
      
      const fetchRecipes = async () => {
        try {
          const response = await fetch('http://localhost:8080/api/recipes');
          const data = await response.json();
          const draftRecipes = data.filter((recipe: Recipe) => recipe.status === 'draft');
          const publicRecipesList = data.filter((recipe: Recipe) => recipe.status === 'public');
          setMyRecipes([...draftRecipes, ...publicRecipesList]);
          setPublicRecipes(publicRecipesList);
        } catch (error) {
          console.error('Error fetching recipes:', error);
        }
      };
      
      fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  const handleUpdateRecipe = async () => {
    if (!recipeName.trim()) {
      alert("Please add Recipe Name");
      return;
    }
    
    if (!editingRecipe) return;
    
    try {
      const ingredientsWithIds = selectedIngredients.map(ingredientName => {
        const ingredient = allIngredients.find(ing => ing.name === ingredientName);
        console.log(`Looking for ingredient: "${ingredientName}", found:`, ingredient);
        return ingredient ? { id: ingredient.id, name: ingredient.name } : { name: ingredientName };
      });
      
      console.log("Selected ingredients:", selectedIngredients);
      console.log("All ingredients from DB:", allIngredients);
      
      const recipeData = {
        name: recipeName.trim(),
        status: editingRecipe.status,
        prepTime: prepTime ? `${prepTime} min` : undefined,
        cookTime: cookTime ? `${cookTime} min` : undefined,
        servings: servings ? parseInt(servings) : undefined,
        instructions: instructions.trim() || undefined,
        ingredients: ingredientsWithIds
      };
      
      console.log("Updating recipe data:", JSON.stringify(recipeData, null, 2));
      
      const response = await fetch(`http://localhost:8080/api/recipes/${editingRecipe.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipeData)
      });
      
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error('Failed to update recipe');
      }
      
      const updatedRecipe = await response.json();
      
      setMyRecipes(prev => prev.map(r => r.id === editingRecipe.id ? updatedRecipe : r));
      setPublicRecipes(prev => prev.map(r => r.id === editingRecipe.id ? updatedRecipe : r));
      console.log("Updated recipe successfully!");
      alert("Recipe updated successfully");
      resetForm();
      setIsEditing(false);
      setEditingRecipe(null);
      
      const fetchRecipes = async () => {
        try {
          const response = await fetch('http://localhost:8080/api/recipes');
          const data = await response.json();
          const draftRecipes = data.filter((recipe: Recipe) => recipe.status === 'draft');
          const publicRecipesList = data.filter((recipe: Recipe) => recipe.status === 'public');
          setMyRecipes([...draftRecipes, ...publicRecipesList]);
          setPublicRecipes(publicRecipesList);
        } catch (error) {
          console.error('Error fetching recipes:', error);
        }
      };
      
      fetchRecipes();
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Failed to update recipe. Please try again.');
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
          <h2 className="text-lg font-medium text-gray-900">{isEditing ? "Edit Recipe" : "Create Recipe"}</h2>
          {isCreating ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
        </button>

        {isCreating && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name *</label>
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
                onClick={isEditing ? handleUpdateRecipe : handleSaveDraft}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {isEditing ? "Update Recipe" : "Save Draft"}
              </button>
              {!isEditing && (
                <button
                  onClick={handlePublish}
                  className="px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors"
                >
                  Publish Recipe
                </button>
              )}
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
                <div 
                  key={recipe.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleRecipeClick(recipe)}
                  style={{ overflow: 'visible' }}
                >
                  {/* Recipe Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center relative">
                    <ChefHat className="w-16 h-16 text-primary opacity-50" />
                    <div className="absolute top-2 right-2" style={{ zIndex: 10 }}>
                      <button 
                        onClick={(e) => handleMenuClick(e, recipe.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors bg-white bg-opacity-80"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {showMenu === recipe.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-100 min-w-[80px]" style={{ position: 'absolute' }}>
                          <button
                            onClick={() => handleView(recipe)}
                            className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 transition-colors rounded-t-lg"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleUpdate(recipe)}
                            className="w-full px-2 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDeleteClick(recipe)}
                            className="w-full px-2 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 transition-colors rounded-b-lg"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">{recipe.name}</h3>
                      {getStatusBadge(recipe.status)}
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">Ingredients ({recipe.ingredients?.length || 0})</div>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients?.slice(0, 3).map((ingredient, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            {ingredient.name}
                          </span>
                        ))}
                        {(recipe.ingredients?.length || 0) > 3 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            +{(recipe.ingredients?.length || 0) - 3} more
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
                <div 
                  key={recipe.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleRecipeClick(recipe)}
                >
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
                      <div className="text-sm text-gray-600 mb-2">Ingredients ({recipe.ingredients?.length || 0})</div>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients?.slice(0, 3).map((ingredient, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            {ingredient.name}
                          </span>
                        ))}
                        {(recipe.ingredients?.length || 0) > 3 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                            +{(recipe.ingredients?.length || 0) - 3} more
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

      {/* Recipe Detail View */}
      {showDetail && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recipe Details</h2>
              <button
                onClick={closeDetailView}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Recipe Image */}
              <div className="h-64 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mb-6">
                <ChefHat className="w-20 h-20 text-primary opacity-50" />
              </div>

              {/* Recipe Info */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedRecipe.name}</h3>
                  {getStatusBadge(selectedRecipe.status)}
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {selectedRecipe.prepTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock3 className="w-4 h-4" />
                      <span>Prep: {selectedRecipe.prepTime}</span>
                    </div>
                  )}
                  {selectedRecipe.cookTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Cook: {selectedRecipe.cookTime}</span>
                    </div>
                  )}
                  {selectedRecipe.servings && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users2 className="w-4 h-4" />
                      <span>Servings: {selectedRecipe.servings}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredients */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h4>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients?.map((ingredient, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                      {ingredient.name}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              {selectedRecipe.instructions && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h4>
                  <div className="text-gray-700 whitespace-pre-line">
                    {selectedRecipe.instructions}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
              <Button onClick={closeDetailView} variant="secondary">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this recipe?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}