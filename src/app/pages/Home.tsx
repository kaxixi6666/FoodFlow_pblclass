import { Upload, Camera, Scan, Search, Check, X, Edit2, Plus } from "lucide-react";
import { useState } from "react";

interface DetectedIngredient {
  id: number;
  name: string;
  quantity: string;
  status: "matched" | "uncertain" | "new";
  editing: boolean;
}

interface ManualIngredient {
  id: number;
  name: string;
  quantity: string;
  category: string;
}

const mockDetectedIngredients: DetectedIngredient[] = [];

const ingredientLibrary = [
  { name: "Tomatoes", category: "Vegetables" },
  { name: "Cheddar Cheese", category: "Dairy" },
  { name: "Whole Wheat Bread", category: "Grains" },
  { name: "Red Apples", category: "Fruits" },
  { name: "Orange Juice", category: "Beverages" },
  { name: "Olive Oil", category: "Condiments" },
];

export function Home() {
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>(mockDetectedIngredients);
  const [manualIngredients, setManualIngredients] = useState<ManualIngredient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // Handle file upload logic here
  };

  const toggleEdit = (id: number) => {
    setDetectedIngredients(detectedIngredients.map(ing => 
      ing.id === id ? { ...ing, editing: !ing.editing } : ing
    ));
  };

  const removeDetected = (id: number) => {
    setDetectedIngredients(detectedIngredients.filter(ing => ing.id !== id));
  };

  const addManualIngredient = (ingredient: typeof ingredientLibrary[0]) => {
    const newIngredient: ManualIngredient = {
      id: Date.now(),
      name: ingredient.name,
      quantity: "",
      category: ingredient.category,
    };
    setManualIngredients([...manualIngredients, newIngredient]);
    setSearchQuery("");
  };

  const removeManualIngredient = (id: number) => {
    setManualIngredients(manualIngredients.filter(ing => ing.id !== id));
  };

  const updateManualQuantity = (id: number, quantity: string) => {
    setManualIngredients(manualIngredients.map(ing =>
      ing.id === id ? { ...ing, quantity } : ing
    ));
  };

  const filteredLibrary = searchQuery
    ? ingredientLibrary.filter(ing =>
        ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="grid grid-cols-5 gap-6">
      {/* Left Column - Primary Action Area */}
      <div className="col-span-2 space-y-6">
        {/* Scan Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-3">
              <Scan className="w-5 h-5" />
              <span>Scan Receipt</span>
            </button>
            <button className="w-full px-6 py-4 bg-white text-gray-700 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-orange-50 transition-colors flex items-center justify-center gap-3">
              <Camera className="w-5 h-5" />
              <span>Scan Fridge</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          className={`bg-white rounded-xl shadow-sm border-2 border-dashed transition-all ${
            dragActive
              ? "border-primary bg-orange-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg text-gray-900 mb-2">Drop Files Here</h3>
            <p className="text-sm text-gray-500 mb-4">
              or click to browse your device
            </p>
            <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              Browse Files
            </button>
            <p className="text-xs text-gray-400 mt-4">
              Supports: JPG, PNG, PDF (Max 10MB)
            </p>
          </div>
        </div>

        {/* Upload Tips */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-5">
          <h4 className="text-sm text-blue-900 mb-2">📸 Tips for Best Results</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ensure good lighting for clear images</li>
            <li>• Keep receipts flat and uncrumpled</li>
            <li>• Capture the entire fridge shelf in frame</li>
          </ul>
        </div>
      </div>

      {/* Right Column - Result & Processing Area */}
      <div className="col-span-3 space-y-6">
        {/* Detected Ingredients Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg text-gray-900">Detected Ingredients</h3>
            <p className="text-sm text-gray-500 mt-1">
              Review and edit detected items before adding to inventory
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm text-gray-600">Ingredient Name</th>
                  <th className="px-6 py-3 text-left text-sm text-gray-600">Detected Quantity</th>
                  <th className="px-6 py-3 text-left text-sm text-gray-600">Match Status</th>
                  <th className="px-6 py-3 text-center text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {detectedIngredients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No ingredients detected yet. Upload an image or scan to get started.
                    </td>
                  </tr>
                ) : (
                  detectedIngredients.map((ingredient) => (
                    <tr key={ingredient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {ingredient.editing ? (
                          <input
                            type="text"
                            defaultValue={ingredient.name}
                            className="w-full px-3 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-900">{ingredient.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {ingredient.editing ? (
                          <input
                            type="text"
                            defaultValue={ingredient.quantity}
                            className="w-32 px-3 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-900">{ingredient.quantity}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs ${
                            ingredient.status === "matched"
                              ? "bg-orange-50 text-orange-700"
                              : ingredient.status === "uncertain"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {ingredient.status === "matched"
                            ? "Matched"
                            : ingredient.status === "uncertain"
                            ? "Uncertain"
                            : "New Item"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => toggleEdit(ingredient.id)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeDetected(ingredient.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-primary hover:bg-orange-50 rounded transition-colors"
                            title="Confirm"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Add Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg text-gray-900 mb-4">Add Ingredients Manually</h3>
          
          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search ingredient library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Search Results Dropdown */}
          {searchQuery && filteredLibrary.length > 0 && (
            <div className="mb-4 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {filteredLibrary.map((ingredient, index) => (
                <button
                  key={index}
                  onClick={() => addManualIngredient(ingredient)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-0"
                >
                  <div>
                    <div className="text-gray-900">{ingredient.name}</div>
                    <div className="text-sm text-gray-500">{ingredient.category}</div>
                  </div>
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* Selected Manual Ingredients */}
          {manualIngredients.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm text-gray-700 mb-3">Selected Ingredients</h4>
              {manualIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-gray-900">{ingredient.name}</div>
                    <div className="text-sm text-gray-500">{ingredient.category}</div>
                  </div>
                  <input
                    type="text"
                    placeholder="Quantity"
                    value={ingredient.quantity}
                    onChange={(e) => updateManualQuantity(ingredient.id, e.target.value)}
                    className="w-32 px-3 py-1 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    onClick={() => removeManualIngredient(ingredient.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <div className="flex items-center justify-end gap-3">
          <button className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
            disabled={detectedIngredients.length === 0 && manualIngredients.length === 0}
          >
            <Check className="w-5 h-5" />
            Confirm & Add to Inventory
          </button>
        </div>
      </div>
    </div>
  );
}
