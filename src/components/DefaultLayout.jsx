import { useState } from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DefaultLayout() {
    const { user, token, logout, isLoading } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!token) {
        return <Navigate to="/login" />;
    }

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center text-primary-600">Loading...</div>;
    }

    const onLogout = (ev) => {
        ev.preventDefault();
        logout();
    };

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Documents', path: '/documents' },
        { name: 'Upload', path: '/documents/upload', role: ['admin', 'manager'] },
        { name: 'Categories', path: '/categories', role: ['admin'] },
        { name: 'Users', path: '/users', role: ['admin'] },
        { name: 'Logs', path: '/activity-logs', role: ['admin'] },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/dashboard" className="text-2xl font-bold text-primary-700">DMS</Link>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {navLinks.map(link => {
                                    if (link.role) {
                                        const userRole = user?.roles?.[0]?.name;
                                        if (!userRole || !link.role.includes(userRole)) {
                                            return null;
                                        }
                                    }

                                    const isActive = location.pathname === link.path;
                                    return (
                                        <Link
                                            key={link.name}
                                            to={link.path}
                                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive
                                                ? 'border-primary-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                                }`}
                                        >
                                            {link.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Desktop User Menu */}
                        <div className="hidden sm:flex items-center">
                            <Link to="/profile" className="flex flex-col items-end mr-4 hover:opacity-80 transition-opacity">
                                <span className="text-sm font-medium text-gray-900">{user?.name}</span>
                                <span className="text-xs text-gray-500 capitalize">{user?.department?.name} • {user?.roles?.[0]?.name || 'User'}</span>
                            </Link>
                            <button
                                onClick={onLogout}
                                className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Logout
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                            >
                                <span className="sr-only">Open main menu</span>
                                {/* Icon when menu is closed. */}
                                {!isMobileMenuOpen ? (
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    /* Icon when menu is open. */
                                    <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="sm:hidden">
                        <div className="pt-2 pb-3 space-y-1">
                            {navLinks.map(link => {
                                if (link.role) {
                                    const userRole = user?.roles?.[0]?.name;
                                    if (!userRole || !link.role.includes(userRole)) {
                                        return null;
                                    }
                                }

                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${isActive
                                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="pt-4 pb-4 border-t border-gray-200">
                            <div className="flex items-center px-4">
                                <div className="ml-3">
                                    <div className="text-base font-medium text-gray-800">{user?.name}</div>
                                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1">
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                >
                                    Your Profile
                                </Link>
                                <button
                                    onClick={(e) => {
                                        onLogout(e);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav >

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div >
    );
}
