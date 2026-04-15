import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('adminToken');
  
  if (!token) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
