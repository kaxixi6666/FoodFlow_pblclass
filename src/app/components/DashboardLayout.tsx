import { Outlet, NavLink, useLocation } from "react-router";
import { Home, Package, BookOpen, Filter, Calendar, ChevronLeft, ChevronRight, Search, Settings, Bell, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/recipes", label: "Recipes", icon: BookOpen },
  { to: "/planning", label: "Planning", icon: Calendar },
];

const pageTitles: Record<string, string> = {
  "/": "Dashboard Overview",
  "/inventory": "Food Inventory",
  "/recipes": "Recipe Library",
  "/planning": "Meal Planning",
};

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  const { user, logout } = useAuth();
  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Format date and time for Tokyo timezone
  const formatTokyoTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      timeZone: 'Asia/Tokyo',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Get user initials
  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <aside className={`${collapsed ? "w-20" : "w-64"} bg-white border-r border-border flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="h-20 px-6 border-b border-border flex items-center justify-between">
          {!collapsed && <h1 className="text-xl text-primary font-rounded font-medium tracking-wide">FoodFlow</h1>}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-auto"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `flex items-center ${collapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info and Logout */}
        <div className="p-4 border-t border-border">
          {!collapsed && (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                  {getUserInitials(user?.username)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user?.username || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-border flex items-center justify-between px-8">
          {/* Page Title - Left */}
          <div>
            <h1 className="text-2xl text-foreground">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground mt-1">{formatTokyoTime(currentTime)}</p>
          </div>

          {/* Right Side - Notifications, Settings, Profile */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all">
              {getUserInitials(user?.username)}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1440px] mx-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}