import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ContactPage from "../pages/ContactPage";
import Login from "../features/auth/login";
import Register from "../features/auth/register";
import VerifyOtp from "../features/auth/verifyOtp";
import ProtectedRoute from "./ProtectedRoute";
import UserLayouts from "./layouts/UserLayouts";
import PersonalArea from "../features/user/PersonalArea/PersonalArea";
import Profile from "../features/user/Profile/Profile";
import Documents from "../features/user/Documents/Documents";
import AllUpdates from "../features/user/Updates/AllUpdates";
import UserCampsList from "../features/user/Camps/UserCampsList";
import UserClubsList from "../features/user/Clubs/UserClubsList";


import AdminLayout from "./layouts/AdminLayouts";
import ManagementPanel from "../features/admin/ManagementPanel/ManagementPanel";
import ChildManagement from "../features/admin/ChildManagement/ChildManagement";
import UpdateManagement from "../features/admin/UpdateManagement/UpdateManagement";
import DocumentManagement from "../features/admin/DocumentsManagement/DocumentsManagement";
import DayCampManagement from "../features/admin/DayCampManagement/DayCampManagement";
import DayCampDetails from "../features/admin/DayCampManagement/DayCampDetails";
import VolunteerManagement from "../features/admin/VolunteerManagement/VolunteerManagement";
import ClubManagement from "../features/admin/ClubManagement/ClubManagement";
import ClubDetailsPage from "../features/admin/ClubManagement/ClubDetailsPage";
import ContactMessages from "../features/admin/MessagesManagement/ContactMessages";

const AppRouts = () => {
  return (
    <Routes>
      {/* ראוטים ציבוריים */}
      <Route path="/" element={<HomePage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* ראוטים מוגנים למשתמשים עם הרשאת "child" */}
      <Route element={<ProtectedRoute allowedRoles={["child"]} />}>
        <Route path="/user" element={<UserLayouts />}>
          <Route index element={<Navigate to="/user/personalArea" replace />} />
          <Route path="personalArea" element={<PersonalArea />} />
          <Route path="profile" element={<Profile />} />
          <Route path="all-updates" element={<AllUpdates />} />
          <Route path="daycamps" element={<UserCampsList />} />
          <Route path="clubs" element={<UserClubsList />} />
          <Route path="documents" element={<Documents />} />
        </Route>
      </Route>

      {/* ראוטים מוגנים למנהל */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/managementPanel" replace />} />
          <Route path="managementPanel" element={<ManagementPanel />} />
          <Route path="childrenManagement" element={<ChildManagement />} />
          <Route path="volunteersManagement" element={<VolunteerManagement />} />
          <Route path="clubsManagement" element={<ClubManagement />} />
          <Route path="clubsManagement/:id" element={<ClubDetailsPage />} />
          <Route path="daycampsManagement" element={<DayCampManagement />} />
          <Route path="daycampsManagement/:id" element={<DayCampDetails />} />
          <Route path="documentsManagement" element={<DocumentManagement />} />
          <Route path="contactMessages" element={<ContactMessages />} />
          <Route path="updatesManagement" element={<UpdateManagement />} />
         
        </Route>
      </Route>

      {/* ראוט 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouts;