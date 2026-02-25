import { Search, ChevronDown, ChevronUp, Trash2, X, Plus, Minus } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { API_ENDPOINTS, apiClient } from "../config/api";
import { dataService } from "../services/dataService";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  lastUpdated: string;
  selected: boolean;
  editing: boolean;
}

const categories = ["All Categories", "Vegetables", "Fruits", "Dairy", "Meat", "Seafood", "Grains", "Beverages", "Condiments", "Uncategorized"];

export function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc"> ("desc");
  const [isDeleting, setIsDeleting] = useState<Set<number>>(new Set());

  const fetchInventory = useCallback(async () => {
    try {
      // Use apiClient for inventory data
      const response = await apiClient.get(API_ENDPOINTS.INVENTORY);
      
      if (response.success) {
        const data = response.data;
        
        const inventoryItems: InventoryItem[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          lastUpdated: item.lastUpdated,
          selected: false,
          editing: false
        }));
        
        inventoryItems.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        
        setInventory(inventoryItems);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      if (error instanceof Error && error.message.includes('400')) {
        alert('Please login to view your inventory');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const selectedCount = inventory.filter(item => item.selected).length;
  const allSelected = inventory.length > 0 && selectedCount === inventory.length;

  const toggleSelectAll = useCallback(() => {
    setInventory(inventory.map(item => ({ ...item, selected: !allSelected })));
  }, [inventory, allSelected]);

  const toggleSelect = useCallback((id: number) => {
    setInventory(inventory.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  }, [inventory]);

  const clearSelected = async () => {
    const selectedItems = inventory.filter(item => item.selected);
    const selectedIds = selectedItems.map(item => item.id);
    
    setIsDeleting(prev => new Set([...prev, ...selectedIds]));
    
    try {
      // Use apiClient for batch deletion
      const deletePromises = selectedItems.map(item => 
        apiClient.delete(`${API_ENDPOINTS.INVENTORY}/${item.id}`)
      );
      
      await Promise.all(deletePromises);
      
      // Optimistic update - remove items immediately
      setInventory(inventory.filter(item => !item.selected));
      
      // Clear cache for inventory
      apiClient.clearCacheForUrl(API_ENDPOINTS.INVENTORY);
    } catch (error) {
      console.error('Error deleting items:', error);
      alert('Failed to delete items. Please try again.');
      await fetchInventory();
    } finally {
      setIsDeleting(new Set());
    }
  };

  const clearAllSelections = useCallback(() => {
    setInventory(inventory.map(item => ({ ...item, selected: false })));
  }, [inventory]);

  const deleteItem = async (id: number) => {
    setIsDeleting(prev => new Set([...prev, id]));
    
    const originalInventory = [...inventory];
    // Optimistic update - remove item immediately
    setInventory(inventory.filter(item => item.id !== id));
    
    try {
      // Use apiClient for deletion
      await apiClient.delete(`${API_ENDPOINTS.INVENTORY}/${id}`);
      
      // Clear cache for inventory
      apiClient.clearCacheForUrl(API_ENDPOINTS.INVENTORY);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
      // Rollback on error
      setInventory(originalInventory);
    } finally {
      setIsDeleting(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Use useMemo for filtered inventory to avoid unnecessary recalculations
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchQuery, selectedCategory]);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prevOrder => {
      const newSortOrder = prevOrder === "desc" ? "asc" : "desc";
      
      setInventory(prevInventory => {
        const sortedInventory = [...prevInventory].sort((a, b) => {
          const dateA = new Date(a.lastUpdated).getTime();
          const dateB = new Date(b.lastUpdated).getTime();
          return newSortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });
        return sortedInventory;
      });
      
      return newSortOrder;
    });
  }, []);

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
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="relative">
          <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
              variant="default"
              disabled={selectedCount > 0 && Array.from(isDeleting).some(id => selectedItems.some(item => item.id === id))}
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected ({selectedCount})
            </Button>
            <Button
              onClick={clearAllSelections}
              variant="default"
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
                    onClick={() => deleteItem(item.id)}
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                    disabled={isDeleting.has(item.id)}
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