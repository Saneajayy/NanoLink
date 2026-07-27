import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
 const { isAuthenticated, loading } = useAuth();
 const location = useLocation();

 if (loading) {
 return (
 <div className="min-h-screen bg-white flex items-center justify-center">
 <div className="w-10 h-10 border border-black border-t-[#FF6206] animate-spin" />
 </div>
 );
 }

 if (!isAuthenticated) {
 return <Navigate to="/login" state={{ from: location }} replace />;
 }

 return children;
};

export default ProtectedRoute;
