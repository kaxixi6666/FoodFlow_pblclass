import { Search, ChevronDown, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { API_ENDPOINTS, fetchAPI } from "../config/api";

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
        const data = await fetchAPI(API_ENDPOINTS.INVENTORY);
        
        // Transform data to match InventoryItem interface
        const inventoryItems: InventoryItem[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          lastUpdated: item.lastUpdated,
          selected: false,
          editing: false
        }));
        
        // Sort by lastUpdated in descending order (newest first)
        inventoryItems.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        
        setInventory(inventoryItems);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        // Check if error is about missing userId
        if (error instanceof Error && error.message.includes('400')) {
          alert('Please login to view your inventory');
        }
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

  const clearSelected = async () => {
    const selectedItems = inventory.filter(item => item.selected);
    
    try {
      const deletePromises = selectedItems.map(async (item) => {
        await fetchAPI(`${API_ENDPOINTS.INVENTORY}/${item.id}`, {
          method: 'DELETE'
        });
        
        return item.id;
      });
      
      await Promise.all(deletePromises);
      
      setInventory(inventory.filter(item => !item.selected));
    } catch (error) {
      console.error('Error deleting items:', error);
      alert('Failed to delete items. Please try again.');
    }
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
        <p className="text-gray-600">Manage your food inventory and track expiration dates</p>
      </div>

      <div className="mb-6 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={toggleSelectAll}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
        {selectedCount > 0 && (
          <>
            <button
              onClick={clearSelected}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete Selected ({selectedCount})
            </button>
            <button
              onClick={clearAllSelections}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Clear Selection
            </button>
          </>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4"
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInventory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No inventory items found
              </TableCell>
            </TableRow>
          ) : (
            filteredInventory.map(item => (
              <TableRow key={item.id}>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4"
                  />
                </TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.lastUpdated}</TableCell>
                <TableCell>
                  <button
                    onClick={() => toggleSelect(item.id)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
