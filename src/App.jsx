import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import UploadDocument from "./pages/UploadDocument";
import DocumentDetails from "./pages/DocumentDetails";
import EditDocument from "./pages/EditDocument";
import Profile from "./pages/Profile";
import Categories from "./pages/Categories";
import Users from "./pages/Users";
import ActivityLogs from "./pages/ActivityLogs";
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Protected Routes */}
        <Route path="/" element={<DefaultLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/upload" element={<UploadDocument />} />
          <Route path="/documents/:id" element={<DocumentDetails />} />
          <Route path="/documents/:id" element={<DocumentDetails />} />
          <Route path="/documents/:id/edit" element={<EditDocument />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/users" element={<Users />} />
          <Route path="/activity-logs" element={<ActivityLogs />} />
        </Route>

        {/* Guest Routes */}
        <Route path="/" element={<GuestLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}
