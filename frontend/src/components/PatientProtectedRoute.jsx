import { Navigate } from 'react-router-dom';

const PatientProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('patientToken');

  if (!token) {
    return <Navigate to="/hospital-auth" replace />;
  }

  return children;
};

export default PatientProtectedRoute;
