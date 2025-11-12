import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {jwtDecode} from "jwt-decode";

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, isUserLoggedIn } = useSelector((state) => state.auth);

  // אם המשתמש לא מחובר - הפנייה לדף התחברות
  if (!isUserLoggedIn || !token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // פענוח הטוקן לבדיקת ה-role
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.role;

    console.log("🔍 ProtectedRoute Debug:", { 
      userRole, 
      allowedRoles, 
      isAllowed: allowedRoles?.includes(userRole),
      decodedToken 
    });

    // בדיקה אם ה-role של המשתמש מותר
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // אם אין הרשאה - הפנייה לדף הבית
      console.log("❌ Access Denied - redirecting to /");
      return <Navigate to="/" replace />;
    }

    // אם הכל תקין - הצגת הקומפוננטות המוגנות
    return <Outlet />;
  } catch (error) {
    // במקרה של שגיאה בפענוח הטוקן - הפנייה לדף התחברות
    console.error("Invalid token:", error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
