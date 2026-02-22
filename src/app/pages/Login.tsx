import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { useNavigate } from "react-router";
import { useAuth } from "../components/AuthProvider";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRegistering) {
      // Register logic
      if (!name || !email || !password) {
        setError("Please fill in all fields");
        return;
      }

      // Save user to localStorage (mock)
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const existingUser = users.find((user: any) => user.email === email);
      
      if (existingUser) {
        setError("Email already registered");
        return;
      }

      const newUser = { id: Date.now(), name, email, password };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      
      // Auto login after registration
      login(newUser);
      navigate("/");
    } else {
      // Login logic
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find((user: any) => user.email === email && user.password === password);
      
      if (user) {
        login(user);
        navigate("/");
      } else {
        setError("Invalid email or password");
      }
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
            {/* Name Input (only for registration) */}
            {isRegistering && (
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Name</Label>
                <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
              </div>
            )}

            {/* Email Input */}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>

            {/* Password Input */}
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">Password</Label>
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
              >
                {isRegistering ? "Create Account" : "Sign In"}
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
