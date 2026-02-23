import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Camera, Scan, Search, Check, X, Edit2, Plus, FileText, Image } from "lucide-react";
import { toast } from "sonner";
import { API_ENDPOINTS, fetchAPI, uploadReceiptImage, uploadReceiptImageNew } from "../config/api";

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
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);

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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
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
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const handleBrowseClick = () => {
    fileUploadInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitFiles = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setUploadMessage("Analyzing files...");
    
    try {
      // Call the new HTTPS API to detect ingredients from receipt image
      const file = selectedFiles[0];
      const response = await uploadReceiptImageNew(file);
      
      console.log('Detected ingredients response:', response);
      
      // Parse the response to get detected items
      const detectedItems = response.detectedItems || [];
      
      // Convert detected items to our format
      const mockIngredients: DetectedIngredient[] = detectedItems.map((item: any, index: number) => ({
        id: item.id || index + 1,
        name: item.name,
        status: "matched" as const,
        editing: false
      }));
      
      setDetectedIngredients(mockIngredients);
      setUploadMessage(`Successfully detected ${mockIngredients.length} ingredients`);
      
    } catch (error) {
      console.error('Error analyzing files:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('400')) {
        toast.error('图片识别失败，请重试');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('网络异常，请检查连接');
      } else {
        toast.error('图片识别失败，请重试');
      }
      
      setUploadMessage('Error analyzing files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmAdd = async () => {
    const ingredientsToAdd = [...detectedIngredients, ...manualIngredients];
    if (ingredientsToAdd.length === 0) return;
    
    setUploading(true);
    setUploadMessage("Adding to inventory...");
    
    try {
      // Call backend API to add ingredients to inventory
      const addPromises = ingredientsToAdd.map(ingredient => {
        // Get category from ingredient or default to "Uncategorized"
        const category = 'category' in ingredient ? ingredient.category : "Uncategorized";
        
        const inventoryRequest = {
          name: ingredient.name,
          category: category
        };
        
        return fetchAPI(API_ENDPOINTS.INVENTORY, {
          method: 'POST',
          body: JSON.stringify(inventoryRequest)
        });
      });
      
      await Promise.all(addPromises);
      
      // Clear form after successful addition
      setDetectedIngredients([]);
      setManualIngredients([]);
      setSelectedFiles([]);
      setUploadMessage(`Successfully added ${ingredientsToAdd.length} items to inventory`);
      
      // Show success toast notification
      toast.success(`Successfully added ${ingredientsToAdd.length} items to inventory`);
      
      // Navigate to Inventory page to show merged results
      setTimeout(() => {
        navigate('/inventory');
      }, 1000);
      
    } catch (error) {
      console.error('Error adding to inventory:', error);
      setUploadMessage('Error adding to inventory. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelAdd = () => {
    // Clear form without adding to database
    setDetectedIngredients([]);
    setManualIngredients([]);
    setSelectedFiles([]);
    setUploadMessage("");
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
      category: ingredient.category,
    };
    setManualIngredients([...manualIngredients, newIngredient]);
    setSearchQuery("");
  };

  const removeManualIngredient = (id: number) => {
    setManualIngredients(manualIngredients.filter(ing => ing.id !== id));
  };

  const filteredLibrary = searchQuery
    ? ingredientLibrary.filter(ing =>
        ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

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
      {/* File Input for Uploads */}
      <input
        type="file"
        ref={fileUploadInputRef}
        onChange={handleFileUploadChange}
        multiple
        accept="image/jpeg,image/png"
        className="hidden"
      />
      
      {/* Left Column - Primary Action Area */}
      <div className="col-span-2 space-y-6">
        {/* Scan Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={handleScanClick}
              className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-3"
            >
              <Scan className="w-5 h-5" />
              <span>Scan Receipt</span>
            </button>
            <button 
              onClick={handleScanClick}
              className="w-full px-6 py-4 bg-white text-gray-700 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-orange-50 transition-colors flex items-center justify-center gap-3"
            >
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
            <button 
              onClick={handleBrowseClick}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-400 mt-4">
              Supports: JPG, PNG (Max 10MB)
            </p>
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
