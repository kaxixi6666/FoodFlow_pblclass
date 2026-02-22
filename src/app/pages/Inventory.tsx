import { Search, ChevronDown, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { API_ENDPOINTS } from "../config/api";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  lastUpdated: string;
  selected: boolean;
  editing: boolean;
}

const categories = ["All Categories", "Vegetables", "Fruits", "Dairy", "Meat", "Seafood", "Grains", "Beverages", "Condiments"];

export function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Fetch inventory data from backend API
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.INVENTORY);
        const data = await response.json();
        
        // Transform data to match InventoryItem interface
      const inventoryItems: InventoryItem[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        lastUpdated: item.lastUpdated,
        selected: false,
        editing: false
      }));
        
        setInventory(inventoryItems);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const selectedCount = inventory.filter(item => item.selected).length;
  const allSelected = inventory.length > 0 && selectedCount === inventory.length;

  const toggleSelectAll = () => {
    setInventory(inventory.map(item => ({ ...item, selected: !allSelected })));
  };

  const toggleSelect = (id: number) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };



  const clearSelected = () => {
    setInventory(inventory.filter(item => !item.selected));
  };

  const clearAllSelections = () => {
    setInventory(inventory.map(item => ({ ...item, selected: false })));
  };

  // Filter and sort
  let filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });



  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative min-w-[180px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white cursor-pointer"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>


        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#4CAF50] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading inventory data...</p>
          </div>
        ) : (
          <>
            <Table className="w-full">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-4">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-[#4CAF50] focus:ring-[#4CAF50] cursor-pointer"
                    />
                  </TableHead>
                  <TableHead className="px-4 text-left text-sm font-medium text-gray-700">Ingredient Name</TableHead>
                  <TableHead className="px-4 text-left text-sm font-medium text-gray-700">Category</TableHead>
                  <TableHead className="px-4 text-left text-sm font-medium text-gray-700">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <TableRow key={item.id} className={item.selected ? "bg-green-50" : ""}>
                    <TableCell className="px-4">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleSelect(item.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#4CAF50] focus:ring-[#4CAF50] cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="px-4 font-medium text-gray-900">{item.name}</TableCell>
                    <TableCell className="px-4">
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {item.category}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 text-gray-500 text-sm">{item.lastUpdated}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredInventory.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                No items found matching your search criteria.
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between z-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4CAF50] text-white flex items-center justify-center text-sm font-medium">
              {selectedCount}
            </div>
            <span className="text-gray-900 font-medium">
              {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={clearSelected}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>

            <button
              onClick={clearAllSelections}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
