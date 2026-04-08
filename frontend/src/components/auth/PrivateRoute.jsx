import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

/**
 * PrivateRoute - Protects routes that require authentication
 * Reads directly from localStorage (app_user, app_access_token)
 */
export default function PrivateRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read from localStorage with correct keys
    const userStr = localStorage.getItem("app_user");
    const token = localStorage.getItem("app_access_token");

    if (userStr && token) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error("Failed to parse app_user:", e);
      }
    }
    setLoading(false);
  }, []);

  // Wait for loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  // User is authenticated, render child routes
  return <Outlet />;
}
