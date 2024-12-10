import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const authToken = localStorage.getItem('authToken');
  const authTokenExpiration = localStorage.getItem('authTokenExpiration');
  const currentTime = new Date().getTime();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authTokenExpiration');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    navigate("/login");
  };

  useEffect(() => {
    
    if (!authToken || !authTokenExpiration || currentTime > authTokenExpiration) {
      handleLogout(); 
    }
  }, [authToken, authTokenExpiration, currentTime, navigate]);


  if (!authToken || !authTokenExpiration || currentTime > authTokenExpiration) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
