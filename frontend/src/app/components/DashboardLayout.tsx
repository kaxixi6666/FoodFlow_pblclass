import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Package, BookOpen, Filter, Calendar, ChevronLeft, ChevronRight, Search, Settings, Bell, LogOut, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { API_ENDPOINTS, apiClient } from "../config/api";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/my-recipes", label: "My Recipes", icon: BookOpen },
  { to: "/public-recipes", label: "Public Recipes", icon: BookOpen },
  { to: "/planning", label: "Planning", icon: Calendar },
];

const pageTitles: Record<string, string> = {
  "/": "Dashboard Overview",
  "/inventory": "Food Inventory",
  "/my-recipes": "My Recipes",
  "/public-recipes": "Public Recipes",
  "/planning": "Meal Planning",
};

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pageTitle = pageTitles[location.pathname] || "Dashboard";
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

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

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS);
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    const fetchUnreadCount = async () => {
      try {
        const count: any = await apiClient.get(`${API_ENDPOINTS.NOTIFICATIONS}/count`);
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchNotifications();
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Mark notification as read and navigate to recipe
  const handleNotificationClick = async (notification: any) => {
    try {
      await apiClient.post(API_ENDPOINTS.NOTIFICATIONS_READ(notification.id));
      setNotifications(prev => prev.map(n => 
        n.id === notification.id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      setShowNotifications(false);
      
      // Navigate to recipe detail if recipeId exists
      if (notification.recipeId) {
        navigate('/my-recipes');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Format notification time
  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={async () => {
                          try {
                            await apiClient.post(API_ENDPOINTS.NOTIFICATIONS_READ_ALL);
                            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                            setUnreadCount(0);
                          } catch (error) {
                            console.error('Error marking all as read:', error);
                          }
                        }}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                              !notification.isRead ? 'bg-blue-500' : 'bg-gray-300'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${
                                !notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatNotificationTime(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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