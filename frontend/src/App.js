import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Timetable from "./pages/Timetable";
import Notes from "./pages/Notes";
import Events from "./pages/Events";
import Complaints from "./pages/Complaints";
import Chat from "./pages/Chat";
import Attendance from "./pages/Attendance";
import Notices from "./pages/Notices";
import Profile from "./pages/Profile";
import TeacherAttendance from "./pages/TeacherAttendance";
import AdminPanel from "./pages/AdminPanel";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"#3b82f6",fontSize:18 }}>Loading ByteNIELIT...</div>;
  return user ? children : <Navigate to="/login" />;
};

const RoleRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) return <Navigate to="/" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" /> : children;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/" element={<PrivateRoute><SocketProvider><Layout /></SocketProvider></PrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="notes" element={<Notes />} />
          <Route path="events" element={<Events />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="chat" element={<Chat />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="notices" element={<Notices />} />
          <Route path="profile" element={<Profile />} />
          <Route path="teacher/attendance" element={<RoleRoute roles={["teacher","admin"]}><TeacherAttendance /></RoleRoute>} />
          <Route path="admin" element={<RoleRoute roles={["admin"]}><AdminPanel /></RoleRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster position="top-right" toastOptions={{
        style: { background:"#1a2235", color:"#e2e8f0", border:"1px solid #1e2d45" },
        success: { iconTheme:{ primary:"#10b981", secondary:"#1a2235" } },
        error: { iconTheme:{ primary:"#ef4444", secondary:"#1a2235" } },
      }} />
    </AuthProvider>
  );
}