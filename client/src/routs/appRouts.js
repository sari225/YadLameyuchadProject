import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import Login from "../features/auth/login"
import Register from "../features/auth/register";
import VerifyOtp from "../features/auth/verifyOtp";
const AppRouts = () => {
  return (
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
    </Routes>
  );
}  

export default AppRouts;