import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  // const authTokenExpiration = localStorage.getItem("authTokenExpiration");
  // const currentTime = new Date().getTime();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      handleLogout();
    }
  }, [token, navigate]);

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
