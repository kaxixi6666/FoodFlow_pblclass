import { Plus, ChevronLeft, ChevronRight, ShoppingCart, Calendar as CalendarIcon } from "lucide-react";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const mealPlan = {
  Monday: { breakfast: null, lunch: null, dinner: null },
  Tuesday: { breakfast: null, lunch: null, dinner: null },
  Wednesday: { breakfast: null, lunch: null, dinner: null },
  Thursday: { breakfast: null, lunch: null, dinner: null },
  Friday: { breakfast: null, lunch: null, dinner: null },
  Saturday: { breakfast: null, lunch: null, dinner: null },
  Sunday: { breakfast: null, lunch: null, dinner: null },
};

const shoppingList: { name: string; category: string; checked: boolean }[] = [];

export function Planning() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-3">
        <button className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Shopping List
        </button>
        <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Auto-Generate Plan
        </button>
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="text-center">
            <h3 className="text-lg text-gray-900">Week of February 17 - 23, 2026</h3>
            <p className="text-sm text-gray-600 mt-1">This Week</p>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Meal Plan Grid */}
      <div className="grid grid-cols-7 gap-4">
        {daysOfWeek.map((day) => {
          const meals = mealPlan[day as keyof typeof mealPlan];
          const isToday = day === "Tuesday";
          
          return (
            <div
              key={day}
              className={`bg-white rounded-xl shadow-sm border ${
                isToday ? "border-primary ring-2 ring-primary ring-opacity-20" : "border-gray-100"
              }`}
            >
              <div className={`p-4 border-b ${isToday ? "border-primary bg-orange-50" : "border-gray-100"}`}>
                <h4 className={`text-sm ${isToday ? "text-primary" : "text-gray-900"}`}>
                  {day}
                </h4>
                <p className="text-xs text-gray-500 mt-1">Feb {17 + daysOfWeek.indexOf(day)}</p>
              </div>
              
              <div className="p-3 space-y-3">
                {/* Breakfast */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">Breakfast</div>
                  {meals.breakfast ? (
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                      <p className="text-sm text-gray-900 mb-1">{meals.breakfast.name}</p>
                      <p className="text-xs text-gray-600">{meals.breakfast.time}</p>
                    </div>
                  ) : (
                    <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary hover:bg-orange-50 transition-colors group">
                      <Plus className="w-4 h-4 text-gray-400 group-hover:text-primary mx-auto" />
                    </button>
                  )}
                </div>

                {/* Lunch */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">Lunch</div>
                  {meals.lunch ? (
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                      <p className="text-sm text-gray-900 mb-1">{meals.lunch.name}</p>
                      <p className="text-xs text-gray-600">{meals.lunch.time}</p>
                    </div>
                  ) : (
                    <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary hover:bg-orange-50 transition-colors group">
                      <Plus className="w-4 h-4 text-gray-400 group-hover:text-primary mx-auto" />
                    </button>
                  )}
                </div>

                {/* Dinner */}
                <div>
                  <div className="text-xs text-gray-500 mb-2">Dinner</div>
                  {meals.dinner ? (
                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                      <p className="text-sm text-gray-900 mb-1">{meals.dinner.name}</p>
                      <p className="text-xs text-gray-600">{meals.dinner.time}</p>
                    </div>
                  ) : (
                    <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary hover:bg-orange-50 transition-colors group">
                      <Plus className="w-4 h-4 text-gray-400 group-hover:text-primary mx-auto" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Shopping List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-gray-900">Generated Shopping List</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm">
              Export
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
              Add to Cart
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {shoppingList.map((item, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={item.checked}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                readOnly
              />
              <div className="flex-1">
                <p className={`text-gray-900 ${item.checked ? "line-through opacity-50" : ""}`}>
                  {item.name}
                </p>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}