import { Search, ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc"> ("desc");

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

  const toggleSortOrder = () => {
    const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newSortOrder);
    
    // Sort the inventory items based on lastUpdated
    const sortedInventory = [...inventory].sort((a, b) => {
      const dateA = new Date(a.lastUpdated).getTime();
      const dateB = new Date(b.lastUpdated).getTime();
      return newSortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    
    setInventory(sortedInventory);
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
        <Button
          onClick={toggleSelectAll}
          variant="default"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </Button>
        {selectedCount > 0 && (
          <>
            <Button
              onClick={clearSelected}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedCount})
            </Button>
            <Button
              onClick={clearAllSelections}
              variant="secondary"
            >
              Clear Selection
            </Button>
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
            <TableHead className="cursor-pointer flex items-center gap-1" onClick={toggleSortOrder}>
              <span>Last Updated</span>
              {sortOrder === "desc" ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </TableHead>
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
                  <Button
                    onClick={() => toggleSelect(item.id)}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
