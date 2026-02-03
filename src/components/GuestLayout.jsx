import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuestLayout() {
    const { token } = useAuth();

    if (token) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary-700">DMS Portal</h1>
                    <p className="text-slate-500 mt-2">Document Management System</p>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
