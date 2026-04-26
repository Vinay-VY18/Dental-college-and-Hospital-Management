import { Navigate } from 'react-router-dom';

const StudentProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('studentToken');

  if (!token) {
    return <Navigate to="/student-auth" replace />;
  }

  return children;
};

export default StudentProtectedRoute;
