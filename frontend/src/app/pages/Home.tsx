import React, { useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Camera, Scan, Search, Check, X, Edit2, Plus, FileText, Image } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS, apiClient, analyzeImageWithBackend } from "../config/api";

interface DetectedIngredient {
  id: number;
  name: string;
  status: "matched" | "uncertain" | "new";
  editing: boolean;
}

interface ManualIngredient {
  id: number;
  name: string;
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
  const navigate = useNavigate();
  const [detectedIngredients, setDetectedIngredients] = useState<DetectedIngredient[]>(mockDetectedIngredients);
  const [manualIngredients, setManualIngredients] = useState<ManualIngredient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [currentScenario, setCurrentScenario] = useState<string>("receipt");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
    });
    
    const invalidFiles = Array.from(files).filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      return !validTypes.includes(file.type);
    });
    
    if (invalidFiles.length > 0) {
      toast.error('仅支持 JPG/PNG 格式图片');
    }
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setUploadMessage(`Added ${validFiles.length} file(s)`);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const handleScanReceiptClick = useCallback(() => {
    setCurrentScenario("receipt");
    fileInputRef.current?.click();
  }, []);

  const handleScanFridgeClick = useCallback(() => {
    setCurrentScenario("fridge");
    fileInputRef.current?.click();
  }, []);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmitFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setUploadMessage("Analyzing files...");
    
    try {
      // Call backend API for analysis
      const file = selectedFiles[0];
      console.log('handleSubmitFiles - file:', file.name);
      console.log('handleSubmitFiles - scenario:', currentScenario);
      
      const response = await analyzeImageWithBackend(file, currentScenario);
      
      console.log('Detected ingredients response:', response);
      
      // Parse response to get detected items
      let detectedItems: DetectedIngredient[] = [];
      
      try {
        // Handle result field with markdown JSON string (primary format)
        if (response.result) {
          const rawResult = response.result;
          console.log('Raw AI result:', rawResult);
          
          // Remove markdown code block markers
          const cleanResult = rawResult
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
          
          console.log('Cleaned result:', cleanResult);
          
          // Parse JSON string
          const parsedResult = JSON.parse(cleanResult);
          console.log('Parsed result:', parsedResult);
          
          // Ensure it's an array
          if (Array.isArray(parsedResult)) {
            detectedItems = parsedResult.map((item: string, index: number) => ({
              id: index + 1,
              name: item,
              status: "matched" as const,
              editing: false
            }));
          } else {
            console.error('Parsed result is not an array:', parsedResult);
          }
        } else if (response.scannedItems) {
          // Handle string array format from backend
          detectedItems = response.scannedItems.map((item: string, index: number) => ({
            id: index + 1,
            name: item,
            status: "matched" as const,
            editing: false
          }));
        } else if (response.detectedItems) {
          console.log('Processing detectedItems:', response.detectedItems);
          console.log('Is detectedItems an array?', Array.isArray(response.detectedItems));
          
          if (typeof response.detectedItems === 'object' && response.detectedItems !== null && 'result' in response.detectedItems) {
            // Handle object with result field (AI response with markdown)
            const rawResult = response.detectedItems.result;
            console.log('Raw AI result from detectedItems:', rawResult);
            
            // Remove markdown code block markers
            const cleanResult = rawResult
              .replace(/```json/g, '')
              .replace(/```/g, '')
              .trim();
            
            console.log('Cleaned result:', cleanResult);
            
            // Parse JSON string
            const parsedResult = JSON.parse(cleanResult);
            console.log('Parsed result:', parsedResult);
            
            // Ensure it's an array
            if (Array.isArray(parsedResult)) {
              detectedItems = parsedResult.map((item: string, index: number) => ({
                id: index + 1,
                name: item,
                status: "matched" as const,
                editing: false
              }));
            } else {
              console.error('Parsed result is not an array:', parsedResult);
            }
          } else if (Array.isArray(response.detectedItems)) {
            // Handle direct array format
            console.log('Processing detectedItems as array:', response.detectedItems);
            detectedItems = response.detectedItems.map((item: string, index: number) => ({
              id: index + 1,
              name: item,
              status: "matched" as const,
              editing: false
            }));
          } else {
            console.error('detectedItems has unexpected format:', response.detectedItems);
          }
        } else {
          console.error('No detected items found in response:', response);
          toast.error('No ingredients detected. Please try again.');
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        toast.error('Failed to parse detected ingredients. Please try again.');
        throw parseError;
      }
      
      // Update state with detected ingredients
      console.log('Setting detectedIngredients:', detectedItems);
      setDetectedIngredients(detectedItems);
      setUploadMessage(`Successfully detected ${detectedItems.length} ingredients`);
      
    } catch (error) {
      console.error('Error analyzing files:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Backend API error')) {
        toast.error('Backend API error. Please try again.');
      } else if (errorMessage.includes('Network error')) {
        toast.error('Network error. Please check your internet connection and try again.');
      } else {
        toast.error('Failed to analyze image. Please try again.');
      }
      
      setUploadMessage('Error analyzing files. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [selectedFiles, currentScenario]);

  const handleConfirmAdd = useCallback(async () => {
    const ingredientsToAdd = [...detectedIngredients, ...manualIngredients];
    if (ingredientsToAdd.length === 0) return;
    
    setUploading(true);
    setUploadMessage("Adding to inventory...");
    
    try {
      const inventoryRequests = ingredientsToAdd.map(ingredient => {
        const category = 'category' in ingredient ? ingredient.category : "Uncategorized";
        return {
          name: ingredient.name,
          category: category
        };
      });
      
      // Use apiClient for batch addition
      await apiClient.post(`${API_ENDPOINTS.INVENTORY}/batch`, {
        items: inventoryRequests
      });
      
      // Optimistic update - clear form immediately
      setDetectedIngredients([]);
      setManualIngredients([]);
      setSelectedFiles([]);
      setUploadMessage(`Successfully added ${ingredientsToAdd.length} items to inventory`);
      
      toast.success(`Successfully added ${ingredientsToAdd.length} items to inventory`);
      
      setTimeout(() => {
        navigate('/inventory');
      }, 1000);
      
    } catch (error) {
      console.error('Error adding to inventory:', error);
      // Add more detailed error message
      if (error instanceof Error) {
        setUploadMessage(`Error: ${error.message}`);
        toast.error(`Failed to add to inventory: ${error.message}`);
      } else {
        setUploadMessage('Error adding to inventory. Please try again.');
        toast.error('Failed to add to inventory. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  }, [detectedIngredients, manualIngredients, navigate]);

  const handleCancelAdd = useCallback(() => {
    // Clear form without adding to database
    setDetectedIngredients([]);
    setManualIngredients([]);
    setSelectedFiles([]);
    setUploadMessage("");
  }, []);

  const toggleEdit = useCallback((id: number) => {
    setDetectedIngredients(prevIngredients => prevIngredients.map(ing => 
      ing.id === id ? { ...ing, editing: !ing.editing } : ing
    ));
  }, []);

  const removeDetected = useCallback((id: number) => {
    setDetectedIngredients(prevIngredients => prevIngredients.filter(ing => ing.id !== id));
  }, []);

  const addManualIngredient = useCallback((ingredient: typeof ingredientLibrary[0]) => {
    const newIngredient: ManualIngredient = {
      id: Date.now(),
      name: ingredient.name,
      category: ingredient.category,
    };
    setManualIngredients(prev => [...prev, newIngredient]);
    setSearchQuery("");
  }, []);

  const removeManualIngredient = useCallback((id: number) => {
    setManualIngredients(prevIngredients => prevIngredients.filter(ing => ing.id !== id));
  }, []);

  const filteredLibrary = useMemo(() => {
    return searchQuery
      ? ingredientLibrary.filter(ing =>
          ing.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];
  }, [searchQuery]);

  return (
    <div className="grid grid-cols-5 gap-6">
      {/* Hidden File Inputs */}
      {/* Camera Input for Scanning */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        capture
        className="hidden"
      />

      
      {/* Left Column - Primary Action Area */}
      <div className="col-span-2 space-y-6">
        {/* Scan Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={handleScanReceiptClick}
              className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-3"
            >
              <Scan className="w-5 h-5" />
              <span>Scan Receipt</span>
            </button>
            <button 
              onClick={handleScanFridgeClick}
              className="w-full px-6 py-4 bg-white text-gray-700 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-orange-50 transition-colors flex items-center justify-center gap-3"
            >
              <Camera className="w-5 h-5" />
              <span>Scan Fridge</span>
            </button>
          </div>
        </div>



        {/* Selected Files - Folder Style */}
        {selectedFiles.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg text-gray-900 mb-4">Selected Files ({selectedFiles.length})</h3>
            <div className="bg-gray-50 rounded-lg border border-gray-200">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-4 border-b border-gray-200 last:border-b-0">
                  <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center">
                    {file.type.includes('pdf') ? (
                      <FileText className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Image className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Submit Button */}
            <div className="mt-4">
              <button
                onClick={handleSubmitFiles}
                disabled={uploading}
                className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Analyze Files</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

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
                  <th className="px-6 py-3 text-left text-sm text-gray-600">Match Status</th>
                  <th className="px-6 py-3 text-center text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {detectedIngredients.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
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
          <button 
            onClick={handleCancelAdd}
            className="px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAdd}
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
