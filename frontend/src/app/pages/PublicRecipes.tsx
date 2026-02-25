import { Search, Plus, Clock, Users, ChefHat, ChevronDown, ChevronUp, MoreVertical, PlusCircle, X, Clock3, Users2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { API_ENDPOINTS, fetchAPI, fetchAPIWithResponse } from "../config/api";

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
  note?: string;
  likeCount?: number;
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
  isPublic?: boolean;
}

const availableIngredients = [
  "Chicken Breast", "Fresh Spinach", "Cherry Tomatoes", "Olive Oil", "Pasta", "Garlic", "Parmesan",
  "Greek Yogurt", "Honey", "Granola", "Berries", "Soy Sauce", "Ginger", "Brown Rice",
  "Eggs", "Cheddar Cheese", "Milk", "Butter", "Teriyaki Sauce", "Vegetables"
];

export function PublicRecipes() {
  const navigate = useNavigate();
  const [publicRecipes, setPublicRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [editingDetailRecipe, setEditingDetailRecipe] = useState<Recipe | null>(null);
  const [detailRecipeName, setDetailRecipeName] = useState("");
  const [detailInstructions, setDetailInstructions] = useState("");
  const [detailServings, setDetailServings] = useState("");
  const [detailPrepTime, setDetailPrepTime] = useState("");
  const [detailCookTime, setDetailCookTime] = useState("");
  const [detailNote, setDetailNote] = useState("");
  const [detailSelectedIngredients, setDetailSelectedIngredients] = useState<string[]>([]);
  const [likedRecipes, setLikedRecipes] = useState<Set<number>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await fetchAPI(`${API_ENDPOINTS.RECIPES}/public`);
        
        const publicRecipesList = data
          .sort((a: Recipe, b: Recipe) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
        
        setPublicRecipes(publicRecipesList);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        // Show user-friendly error message
        alert('Failed to load public recipes. Showing sample data instead.');
        // Set fallback sample data
        const fallbackRecipes: Recipe[] = [
          {
            id: 1,
            name: "Classic Pasta Carbonara",
            status: "public",
            isPublic: true,
            ingredients: [
              { id: 1, name: "Pasta" },
              { id: 2, name: "Eggs" },
              { id: 3, name: "Parmesan Cheese" },
              { id: 4, name: "Bacon" }
            ],
            prepTime: "10 min",
            cookTime: "15 min",
            servings: 4,
            instructions: "1. Cook pasta until al dente\n2. Mix eggs and Parmesan\n3. Cook bacon until crispy\n4. Combine all ingredients"
          },
          {
            id: 2,
            name: "Vegetable Stir Fry",
            status: "public",
            isPublic: true,
            ingredients: [
              { id: 5, name: "Bell Peppers" },
              { id: 6, name: "Broccoli" },
              { id: 7, name: "Carrots" },
              { id: 8, name: "Soy Sauce" }
            ],
            prepTime: "15 min",
            cookTime: "10 min",
            servings: 3,
            instructions: "1. Chop all vegetables\n2. Heat oil in pan\n3. Stir fry vegetables\n4. Add soy sauce and serve"
          }
        ];
        setPublicRecipes(fallbackRecipes);
      }
    };

    const fetchIngredients = async () => {
      try {
        const data = await fetchAPI(API_ENDPOINTS.INGREDIENTS);
        setAllIngredients(data);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        // Set fallback ingredients
        const fallbackIngredients: Ingredient[] = [
          { id: 1, name: "Pasta" },
          { id: 2, name: "Eggs" },
          { id: 3, name: "Parmesan Cheese" },
          { id: 4, name: "Bacon" },
          { id: 5, name: "Bell Peppers" },
          { id: 6, name: "Broccoli" },
          { id: 7, name: "Carrots" },
          { id: 8, name: "Soy Sauce" }
        ];
        setAllIngredients(fallbackIngredients);
      }
    };

    fetchRecipes();
    fetchIngredients();
  }, []);

  // Fetch like status and like counts for each recipe
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        if (!user) {
          return;
        }

        const likedSet = new Set<number>();
        const counts: Record<number, number> = {};

        for (const recipe of publicRecipes) {
          if (recipe.status === 'public') {
            // Fetch like status
            try {
              const status = await fetchAPI(`${API_ENDPOINTS.NOTES}/${recipe.id}/like/status`);
              if (status && status.hasLiked) {
                likedSet.add(recipe.id);
              }
            } catch (error) {
              console.error(`Error fetching like status for recipe ${recipe.id}:`, error);
            }

            // Set like count
            counts[recipe.id] = recipe.likeCount || 0;
          }
        }

        setLikedRecipes(likedSet);
        setLikeCounts(counts);
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };

    if (publicRecipes.length > 0) {
      fetchLikeStatus();
    }
  }, [publicRecipes]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
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

  const handleDetailUpdate = async () => {
    if (!editingDetailRecipe) return;
    
    if (!detailRecipeName.trim()) {
      alert("Please add Recipe Name");
      return;
    }
    
    try {
      const ingredientsWithIds = detailSelectedIngredients.map(ingredientName => {
        const ingredient = allIngredients.find(ing => ing.name === ingredientName);
        return ingredient ? { id: ingredient.id, name: ingredient.name } : { name: ingredientName };
      });
      
      const recipeData = {
        name: detailRecipeName.trim(),
        status: editingDetailRecipe.status,
        prepTime: detailPrepTime ? `${detailPrepTime} min` : undefined,
        cookTime: detailCookTime ? `${detailCookTime} min` : undefined,
        servings: detailServings ? parseInt(detailServings) : undefined,
        instructions: detailInstructions.trim() || undefined,
        note: detailNote.trim() || undefined,
        ingredients: ingredientsWithIds
      };
      
      const response = await fetchAPIWithResponse(`${API_ENDPOINTS.RECIPES}/${editingDetailRecipe.id}`, { method: 'PUT', body: JSON.stringify(recipeData) });
      
      const updatedRecipe = await response.json();
      
      setPublicRecipes(prev => prev.map(r => r.id === editingDetailRecipe.id ? updatedRecipe : r));
      setSelectedRecipe(updatedRecipe);
      
      setIsDetailEditing(false);
      setEditingDetailRecipe(null);
      
      const fetchRecipes = async () => {
        try {
          const data = await fetchAPI(API_ENDPOINTS.PUBLIC_RECIPES);
          const publicRecipesList = data
            .sort((a: Recipe, b: Recipe) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
          setPublicRecipes(publicRecipesList);
        } catch (error) {
          console.error('Error fetching recipes:', error);
          // No need to show error here since we're just refreshing after update
        }
      };
      
      fetchRecipes();
    } catch (error) {
      console.error('Error updating recipe:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update recipe. Please try again.';
      alert(errorMessage);
    }
  };

  // Handle like recipe
  const handleLikeRecipe = async (recipe: Recipe) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user) {
        alert('Please login to like recipes');
        navigate('/login');
        return;
      }

      // Check if recipe is public
      if (recipe.status !== 'public') {
        alert('Cannot like private recipes');
        return;
      }

      // Allow users to like their own recipes
      // Removed the restriction: if (recipe.userId === user.id) {
      //   alert('Cannot like your own recipe');
      //   return;
      // }

      // Optimistic update
      setLikedRecipes(prev => new Set(prev).add(recipe.id));
      setLikeCounts(prev => ({
        ...prev,
        [recipe.id]: (prev[recipe.id] || 0) + 1
      }));

      // Call API
      await fetchAPI(`${API_ENDPOINTS.NOTES}/${recipe.id}/like`, {
        method: 'POST'
      });

      // Refresh recipes to get updated like count
      const fetchRecipes = async () => {
        try {
          const data = await fetchAPI(API_ENDPOINTS.PUBLIC_RECIPES);
          const publicRecipesList = data
            .sort((a: Recipe, b: Recipe) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
          setPublicRecipes(publicRecipesList);
        } catch (error) {
          console.error('Error fetching recipes:', error);
        }
      };
      
      fetchRecipes();
    } catch (error) {
      console.error('Error liking recipe:', error);
      // Rollback optimistic update
      setLikedRecipes(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipe.id);
        return newSet;
      });
      setLikeCounts(prev => ({
        ...prev,
        [recipe.id]: Math.max(0, (prev[recipe.id] || 0) - 1)
      }));
      const errorMessage = error instanceof Error ? error.message : 'Failed to like recipe. Please try again.';
      alert(errorMessage);
    }
  };

  // Handle unlike recipe
  const handleUnlikeRecipe = async (recipe: Recipe) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user) {
        alert('Please login to unlike recipes');
        navigate('/login');
        return;
      }

      // Optimistic update
      setLikedRecipes(prev => {
        const newSet = new Set(prev);
        newSet.delete(recipe.id);
        return newSet;
      });
      setLikeCounts(prev => ({
        ...prev,
        [recipe.id]: Math.max(0, (prev[recipe.id] || 0) - 1)
      }));

      // Call API
      await fetchAPI(`${API_ENDPOINTS.NOTES}/${recipe.id}/like`, {
        method: 'DELETE'
      });

      // Refresh recipes to get updated like count
      const fetchRecipes = async () => {
        try {
          const data = await fetchAPI(API_ENDPOINTS.PUBLIC_RECIPES);
          const publicRecipesList = data
            .sort((a: Recipe, b: Recipe) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
          setPublicRecipes(publicRecipesList);
        } catch (error) {
          console.error('Error fetching recipes:', error);
        }
      };
      
      fetchRecipes();
    } catch (error) {
      console.error('Error unliking recipe:', error);
      // Rollback optimistic update
      setLikedRecipes(prev => new Set(prev).add(recipe.id));
      setLikeCounts(prev => ({
        ...prev,
        [recipe.id]: (prev[recipe.id] || 0) + 1
      }));
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlike recipe. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      {/* Public Recipes Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Public Recipes</h2>
            <span className="text-sm text-gray-600">{publicRecipes.length} recipes</span>
          </div>

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
                      {recipe.ingredients?.slice(0, 2).map((ingredient, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                          {ingredient.name}
                        </span>
                      ))}
                      {(recipe.ingredients?.length || 0) > 2 && (
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                          +{(recipe.ingredients?.length || 0) - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.prepTime || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.cookTime || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings || 0}</span>
                      </div>
                    </div>
                    {recipe.status === 'public' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (likedRecipes.has(recipe.id)) {
                              handleUnlikeRecipe(recipe);
                            } else {
                              handleLikeRecipe(recipe);
                            }
                          }}
                          className={`flex items-center gap-1 p-2 rounded-full transition-colors ${
                            likedRecipes.has(recipe.id)
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill={likedRecipes.has(recipe.id) ? 'currentColor' : 'none'}
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                          <span className="text-sm">
                            {likeCounts[recipe.id] || recipe.likeCount || 0}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>



                  <div className="mt-6">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/planning', { state: { recipeToAdd: recipe } });
                      }}
                      className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add to Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {publicRecipes.length === 0 && (
            <div className="py-12 text-center text-gray-500">
              No public recipes available
            </div>
          )}
        </div>
      </div>

      {/* Recipe Detail View */}
      {showDetail && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{isDetailEditing ? "Edit Recipe" : "Recipe Details"}</h2>
              <div className="flex items-center gap-3">
                {isDetailEditing && (
                  <>
                    <button
                      onClick={() => {
                        setIsDetailEditing(false);
                        setEditingDetailRecipe(null);
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDetailUpdate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                  </>
                )}
                <button
                  onClick={closeDetailView}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Recipe Image */}
              <div className="h-64 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center mb-6">
                <ChefHat className="w-20 h-20 text-primary opacity-50" />
              </div>

              {isDetailEditing ? (
                /* Edit Mode */
                <div className="space-y-6">
                  {/* Recipe Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name *</label>
                    <input
                      type="text"
                      value={detailRecipeName}
                      onChange={(e) => setDetailRecipeName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter recipe name"
                    />
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                      <input
                        type="number"
                        value={detailPrepTime}
                        onChange={(e) => setDetailPrepTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="15"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cook Time (min)</label>
                      <input
                        type="number"
                        value={detailCookTime}
                        onChange={(e) => setDetailCookTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="25"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                      <input
                        type="number"
                        value={detailServings}
                        onChange={(e) => setDetailServings(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="4"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                    <div className="border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {availableIngredients.map((ingredient) => (
                          <label key={ingredient} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={detailSelectedIngredients.includes(ingredient)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setDetailSelectedIngredients(prev => [...prev, ingredient]);
                                } else {
                                  setDetailSelectedIngredients(prev => prev.filter(ing => ing !== ingredient));
                                }
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-[#4CAF50] focus:ring-[#4CAF50]"
                            />
                            <span className="text-sm text-gray-700">{ingredient}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                    <textarea
                      value={detailInstructions}
                      onChange={(e) => setDetailInstructions(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-32"
                      placeholder="Enter step-by-step cooking instructions"
                    ></textarea>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                    <textarea
                      value={detailNote}
                      onChange={(e) => setDetailNote(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 min-h-20"
                      placeholder="Add a note about this recipe"
                    ></textarea>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="space-y-8">
                  {/* Recipe Info */}
                  <div>
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
                  <div>
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
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h4>
                      <div className="text-gray-700 whitespace-pre-line">
                        {selectedRecipe.instructions}
                      </div>
                    </div>
                  )}

                  {/* Note */}
                  {selectedRecipe.note && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Note</h4>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-gray-700">
                        {selectedRecipe.note}
                      </div>
                    </div>
                  )}

                  {/* Edit Date */}
                  {selectedRecipe.updatedAt && (
                    <div className="text-xs text-gray-500 text-right pt-4">
                      Edited: {formatDate(selectedRecipe.updatedAt)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
              {!isDetailEditing && (
                <Button onClick={closeDetailView} variant="secondary">
                  Close
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
