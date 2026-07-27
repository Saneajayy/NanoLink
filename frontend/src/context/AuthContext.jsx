import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
 const [user, setUser] = useState(null);
 const [token, setToken] = useState(localStorage.getItem('nanolink_token') || null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 // Configure axios default headers
 if (token) {
 axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
 } else {
 delete axios.defaults.headers.common['Authorization'];
 }

 // Hydrate user on load or when token changes (including OAuth redirects)
 useEffect(() => {
 const checkAuth = async () => {
 // Check if OAuth callback passed token in query string
 const urlParams = new URLSearchParams(window.location.search);
 const urlToken = urlParams.get('token');
 
 let currentToken = token;
 if (urlToken) {
 currentToken = urlToken;
 localStorage.setItem('nanolink_token', currentToken);
 setToken(currentToken);
 axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
 // Clean URL without triggering page reload
 window.history.replaceState({}, document.title, window.location.pathname);
 }

 if (!currentToken) {
 setLoading(false);
 return;
 }

 try {
 const res = await axios.get('/api/auth/me');
 setUser(res.data);
 } catch (err) {
 console.error('Failed to hydrate user:', err);
 localStorage.removeItem('nanolink_token');
 setToken(null);
 setUser(null);
 } finally {
 setLoading(false);
 }
 };

 checkAuth();
 window.addEventListener('nanolink_data_change', checkAuth);
 return () => window.removeEventListener('nanolink_data_change', checkAuth);
 }, [token]);

 const login = async (email, password) => {
 setError(null);
 try {
 const res = await axios.post('/api/auth/login', { email, password });
 localStorage.setItem('nanolink_token', res.data.token);
 setToken(res.data.token);
 setUser(res.data.user);
 axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
 return res.data;
 } catch (err) {
 const msg = err.response?.data?.error || 'Login failed. Please check your credentials.';
 setError(msg);
 throw new Error(msg);
 }
 };

 const signup = async (name, email, password) => {
 setError(null);
 try {
 const res = await axios.post('/api/auth/signup', { name, email, password });
 localStorage.setItem('nanolink_token', res.data.token);
 setToken(res.data.token);
 setUser(res.data.user);
 axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
 return res.data;
 } catch (err) {
 const msg = err.response?.data?.error || 'Registration failed. Please try again.';
 setError(msg);
 throw new Error(msg);
 }
 };

 const logout = async () => {
 try {
 await axios.post('/api/auth/logout');
 } catch (err) {
 console.warn('Logout endpoint error:', err);
 } finally {
 localStorage.removeItem('nanolink_token');
 setToken(null);
 setUser(null);
 delete axios.defaults.headers.common['Authorization'];
 }
 };

 // Critical Flow (Section 4): Pre-signup URL retention
 const storePendingUrl = (url) => {
 if (url && url.trim()) {
 sessionStorage.setItem('pending_nanolink_url', url.trim());
 }
 };

 const getPendingUrl = (clear = true) => {
 const url = sessionStorage.getItem('pending_nanolink_url');
 if (url && clear) {
 sessionStorage.removeItem('pending_nanolink_url');
 }
 return url;
 };

 const loginWithGoogle = () => {
 window.location.href = '/api/auth/google';
 };

 return (
 <AuthContext.Provider
 value={{
 user,
 token,
 loading,
 error,
 login,
 signup,
 logout,
 loginWithGoogle,
 storePendingUrl,
 getPendingUrl,
 isAuthenticated: !!user,
 isCorePlan: user?.plan === 'core'
 }}
 >
 {children}
 </AuthContext.Provider>
 );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
