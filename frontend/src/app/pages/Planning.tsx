import { Plus, ChevronLeft, ChevronRight, X, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { API_ENDPOINTS, fetchAPI } from "../config/api";
import { useAuth } from "../components/AuthProvider";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface Recipe {
  id: number;
  name: string;
  ingredients: any[];
  status: string;
  prepTime?: string;
  cookTime?: string;
  servings?: number;
  instructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MealPlan {
  id?: number;
  date: string;
  dayOfWeek: string;
  mealType: "breakfast" | "lunch" | "dinner";
  recipe: Recipe;
}

export function Planning() {
  const location = useLocation();
  const { user } = useAuth();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [pendingRecipe, setPendingRecipe] = useState<Recipe | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (location.state?.recipeToAdd) {
      setPendingRecipe(location.state.recipeToAdd);
    }
  }, [location.state]);

  useEffect(() => {
    fetchMealPlans();
  }, [currentWeekStart, user?.id]);

  const fetchMealPlans = async () => {
    try {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Start from Monday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6); // End on Sunday
      
      const startDateStr = weekStart.toISOString().split('T')[0];
      const endDateStr = weekEnd.toISOString().split('T')[0];
      
      let endpoint = API_ENDPOINTS.MEAL_PLANS;
      if (user?.id) {
        endpoint += `?userId=${user.id}&startDate=${startDateStr}&endDate=${endDateStr}`;
      }
      const data = await fetchAPI(endpoint);
      const mealPlansData = Array.isArray(data) ? data : [];
      setMealPlans(mealPlansData);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    }
  };

  const getWeekDates = () => {
    const dates: Date[] = [];
    const startOfWeek = new Date(currentWeekStart);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getMealForDay = (date: string, mealType: "breakfast" | "lunch" | "dinner") => {
    return mealPlans.find(
      (plan) => plan.date === date && plan.mealType === mealType
    );
  };

  const handleAddToPlan = (date: string) => {
    if (!pendingRecipe) return;
    setSelectedDate(date);
    setShowMealTypeModal(true);
  };

  const handleMealTypeSelect = async (mealType: "breakfast" | "lunch" | "dinner") => {
    if (!pendingRecipe || !selectedDate || !user?.id) return;

    try {
      const mealPlanData = {
        date: selectedDate,
        dayOfWeek: daysOfWeek[new Date(selectedDate).getDay() === 0 ? 6 : new Date(selectedDate).getDay() - 1],
        mealType: mealType,
        userId: user.id,
        recipe: pendingRecipe
      };

      const savedMealPlan = await fetchAPI(API_ENDPOINTS.MEAL_PLANS, {
        method: 'POST',
        body: JSON.stringify(mealPlanData)
      });
      setMealPlans([...mealPlans, savedMealPlan as unknown as MealPlan]);
      
      const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      setNotification({
        type: 'success',
        message: `Added ${pendingRecipe.name} to ${mealType} plan on ${formattedDate}`
      });
      
      setPendingRecipe(null);
      setShowMealTypeModal(false);
      setSelectedDate(null);
      
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      console.error('Error adding meal plan:', error);
      
      const existingMeal = mealPlans.find(
        (plan) => plan.date === selectedDate && plan.mealType === mealType
      );
      
      if (existingMeal) {
        setNotification({
          type: 'error',
          message: 'A recipe already exists in this slot. Remove it first or try again.'
        });
      } else if (error?.response?.status === 404) {
        setNotification({
          type: 'error',
          message: 'Recipe not found. Please refresh the page and try again.'
        });
      } else if (error?.response?.status === 400) {
        setNotification({
          type: 'error',
          message: 'Invalid request. Please check your input and try again.'
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to add meal plan. Please try again.'
        });
      }
      
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRemoveMealPlan = async (mealPlanId: number) => {
    try {
      await fetchAPI(`${API_ENDPOINTS.MEAL_PLANS}/${mealPlanId}`, {
        method: 'DELETE'
      });

      setMealPlans(mealPlans.filter((plan) => plan.id !== mealPlanId));
      
      setNotification({
        type: 'success',
        message: 'Meal plan removed successfully'
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error removing meal plan:', error);
      setNotification({
        type: 'error',
        message: 'Failed to remove meal plan. Please try again.'
      });
      
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleThisWeek = () => {
    setCurrentWeekStart(new Date());
  };

  const weekDates = getWeekDates();
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            notification.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {notification.message}
          </span>
        </div>
      )}

      {pendingRecipe && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">{pendingRecipe.name}</p>
              <p className="text-sm text-gray-600">Click a date to add this recipe to your plan</p>
            </div>
          </div>
          <button
            onClick={() => setPendingRecipe(null)}
            className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <button onClick={handlePreviousWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-center">
            <h3 className="text-lg text-gray-900">
              Week of {weekDates[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </h3>
            <button
              onClick={handleThisWeek}
              className="text-sm text-primary hover:text-primary/80 mt-1 font-medium"
            >
              This Week
            </button>
          </div>
          <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {daysOfWeek.map((day, index) => {
          const date = weekDates[index];
          const dateStr = formatDate(date);
          const dayIsToday = isToday(date);
          
          return (
            <div
              key={day}
              className={`bg-white rounded-xl shadow-sm border ${
                dayIsToday ? "border-primary ring-2 ring-primary ring-opacity-20" : "border-gray-100"
              }`}
            >
              <div className={`p-4 border-b ${dayIsToday ? "border-primary bg-orange-50" : "border-gray-100"}`}>
                <h4 className={`text-sm ${dayIsToday ? "text-primary" : "text-gray-900"}`}>
                  {day}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
              
              <div className="p-3 space-y-3">
                {(["breakfast", "lunch", "dinner"] as const).map((mealType) => {
                  const meal = getMealForDay(dateStr, mealType);
                  
                  return (
                    <div key={mealType}>
                      <div className="text-xs text-gray-500 mb-2 capitalize">{mealType}</div>
                      {meal ? (
                        <div className="bg-orange-50 rounded-lg p-3 border border-orange-100 relative group">
                          <button
                            onClick={() => meal.id && handleRemoveMealPlan(meal.id)}
                            className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3 text-gray-500 hover:text-red-500" />
                          </button>
                          <p className="text-sm text-gray-900 mb-1">{meal.recipe.name}</p>
                          <p className="text-xs text-gray-600">{meal.recipe.prepTime || 'N/A'}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToPlan(dateStr)}
                          disabled={!pendingRecipe}
                          className={`w-full py-3 border-2 border-dashed rounded-lg transition-colors group ${
                            pendingRecipe 
                              ? "border-gray-200 hover:border-primary hover:bg-orange-50" 
                              : "border-gray-100 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <Plus className={`w-4 h-4 mx-auto ${pendingRecipe ? "text-gray-400 group-hover:text-primary" : "text-gray-300"}`} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showMealTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Meal Type</h3>
            <p className="text-sm text-gray-600 mb-4">
              Adding <span className="font-medium text-gray-900">{pendingRecipe?.name}</span> to{' '}
              {selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <div className="space-y-3">
              {(["breakfast", "lunch", "dinner"] as const).map((mealType) => {
                const existingMeal = mealPlans.find(
                  (plan) => plan.date === selectedDate && plan.mealType === mealType
                );
                
                return (
                  <button
                    key={mealType}
                    onClick={() => handleMealTypeSelect(mealType)}
                    disabled={!!existingMeal}
                    className={`w-full py-3 px-4 border rounded-lg transition-colors text-left capitalize ${
                      existingMeal
                        ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60"
                        : "bg-gray-50 hover:bg-orange-50 border-gray-200 hover:border-primary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{mealType}</span>
                      </div>
                      {existingMeal ? (
                        <span className="text-xs text-gray-500">Already filled</span>
                      ) : (
                        <Plus className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    {existingMeal && (
                      <p className="text-xs text-gray-500 mt-1">
                        Current: {existingMeal.recipe.name}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowMealTypeModal(false)}
              className="w-full mt-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}