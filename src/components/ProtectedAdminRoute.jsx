import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedAdminRoute = ({ children }) => {
  const { isAdminAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-400 animate-pulse font-medium">Verifying access privileges...</p>
      </div>
    );
  }

  // If not authenticated as admin, redirect to admin login
  if (!isAdminAuthenticated) {
    // Save the location they were trying to go to so we can redirect back after login
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  // If authenticated, render children (the admin pages)
  return children;
};

export default ProtectedAdminRoute;