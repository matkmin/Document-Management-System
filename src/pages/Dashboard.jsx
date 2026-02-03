import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosClient from "../api/axios";

export default function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState({
        stats: { total_accessible: 0, my_uploads: 0, department_docs: 0 },
        recent_activity: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get('/dashboard')
            .then(({ data }) => {
                setData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name}!</h1>
                <p className="text-slate-500 mt-1">
                    {user?.department?.name} Department • {user?.roles?.[0]?.name}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-primary-500 to-primary-700 text-white border-none">
                    <h3 className="text-lg font-semibold opacity-90">Total Accessible</h3>
                    <p className="text-3xl font-bold mt-2">{loading ? "..." : data.stats.total_accessible}</p>
                    <p className="text-sm opacity-75 mt-1">Documents you can view</p>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold text-slate-700">Quick Actions</h3>
                    <div className="mt-4 flex flex-col space-y-3">
                        <Link to="/documents" className="btn-secondary text-center">Browse Documents</Link>
                        {(user?.roles?.[0]?.name === 'admin' || user?.roles?.[0]?.name === 'manager') && (
                            <Link to="/documents/upload" className="btn-primary text-center">Upload New Document</Link>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold text-slate-700">Your Stats</h3>
                    <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">My Uploads</span>
                            <span className="font-medium">{loading ? "..." : data.stats.my_uploads}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Department Docs</span>
                            <span className="font-medium">{loading ? "..." : data.stats.department_docs}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {loading ? (
                        <div className="p-6 text-center text-slate-500">Loading...</div>
                    ) : data.recent_activity.length > 0 ? (
                        data.recent_activity.map(doc => (
                            <div key={doc.id} className="p-4 hover:bg-slate-50 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800">{doc.title}</p>
                                        <p className="text-xs text-slate-500">
                                            Uploaded by {doc.uploader?.name} • {new Date(doc.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                                    {doc.category?.title}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 text-center text-slate-500">No recent activity found.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
