import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem('authToken');
  const authTokenExpiration = localStorage.getItem('authTokenExpiration');
  const currentTime = new Date().getTime();

  // Logout handler to clear session and redirect to login
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExpiration');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    navigate("/login");
  };

  useEffect(() => {
    // Check if token exists and is valid
    if (!authToken || !authTokenExpiration || currentTime > authTokenExpiration) {
      handleLogout(); // Automatically log out if session is expired or token is missing
    }
  }, [authToken, authTokenExpiration, currentTime, navigate]);

  // If the session is expired or missing, redirect to login
  if (!authToken || !authTokenExpiration || currentTime > authTokenExpiration) {
    return <Navigate to="/login" />;
  }

  return children; // If the user is authenticated, render the children (protected content)
};

export default PrivateRoute;
