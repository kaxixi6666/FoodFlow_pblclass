import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { API_ENDPOINTS, apiClient } from "../config/api";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Clear previous session before login/register
      await logout();

      if (isRegistering) {
        // Register logic
        if (!username || !password) {
          setError("Please fill in all required fields");
          setLoading(false);
          return;
        }

        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();

        // Use apiClient for registration
        const response = await apiClient.post(API_ENDPOINTS.USERS_REGISTER, {
          username: trimmedUsername,
          password,
          email: trimmedEmail
        });

        if (response.success) {
          // Registration successful, auto login
          const loginResponse = await apiClient.post(API_ENDPOINTS.USERS_LOGIN, {
            username: trimmedUsername,
            password
          });

          if (loginResponse.success) {
            // Only save user info, don't load business data
            login(loginResponse.data);
            navigate("/");
          } else {
            setError("Registration successful but login failed");
          }
        } else {
          setError(response.message || "Registration failed");
        }
      } else {
        // Login logic
        const trimmedUsername = username.trim();

        // Use apiClient for login
        const response = await apiClient.post(API_ENDPOINTS.USERS_LOGIN, {
          username: trimmedUsername,
          password
        });

        if (response.success) {
          // Only save user info, business data will be loaded lazily
          login(response.data);
          navigate("/");
        } else {
          setError(response.message || "Invalid username or password");
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(isRegistering ? "Registration failed. Please try again." : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">{isRegistering ? "Create Account" : "Sign In"}</h2>
            <p className="text-sm text-muted-foreground">{isRegistering ? "Join FoodFlow to manage your kitchen" : "Sign in to your account"}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username Input (only for registration) */}
            {isRegistering && (
              <div>
                <Label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">Username *</Label>
                <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
              </div>
            )}

            {/* Email Input (optional for registration) */}
            {isRegistering && (
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>
            )}

            {/* Username Input (for login) */}
            {!isRegistering && (
              <div>
                <Label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">Username</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
            )}

            {/* Password Input */}
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">Password *</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Processing..." : (isRegistering ? "Create Account" : "Sign In")}
              </Button>
            </div>

            {/* Toggle Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="font-medium text-primary hover:text-primary transition-colors ml-1"
                >
                  {isRegistering ? "Sign in" : "Create account"}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
