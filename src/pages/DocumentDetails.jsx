import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function DocumentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient.get(`/documents/${id}`)
            .then(({ data }) => {
                setDocument(data);
                setLoading(false);
            })
            .catch(() => {
                navigate('/documents');
            });
    }, [id, navigate]);

    const handleDownload = () => {
        axiosClient.get(`/documents/${id}/download`, { responseType: 'blob' })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = window.document.createElement('a');
                link.href = url;
                link.setAttribute('download', document.file_name);
                window.document.body.appendChild(link);
                link.click();
            });
    }

    const handleDelete = () => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        axiosClient.delete(`/documents/${id}`)
            .then(() => navigate('/documents'));
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const canEdit = user?.roles?.[0]?.name === 'admin' || (user?.roles?.[0]?.name === 'manager' && user?.id === document?.uploaded_by);

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <Link to="/documents" className="text-primary-600 hover:text-primary-800 font-medium">
                    &larr; Back to Documents
                </Link>
                <div className="space-x-3">
                    {canEdit && (
                        <>
                            <Link to={`/documents/${id}/edit`} className="btn-secondary">Edit</Link>
                            <button onClick={handleDelete} className="btn-danger">Delete</button>
                        </>
                    )}
                    <button onClick={handleDownload} className="btn-primary">Download</button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                    <h1 className="text-2xl font-bold text-slate-800">{document.title}</h1>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-slate-500">
                        <span>{document.file_name}</span>
                        <span>•</span>
                        <span>{(document.file_size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{document.file_type}</span>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Description</h3>
                        <p className="mt-2 text-slate-700 whitespace-pre-wrap">{document.description || "No description provided."}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Category</h3>
                            <p className="mt-1 text-slate-800 font-medium">{document.category?.title}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Department</h3>
                            <p className="mt-1 text-slate-800 font-medium">{document.department?.name}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Access Level</h3>
                            <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${document.access_level === 'public' ? 'bg-green-100 text-green-800' :
                                    document.access_level === 'private' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {document.access_level}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Downloads</h3>
                            <p className="mt-1 text-slate-800 font-medium">{document.download_count}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Uploaded By</h3>
                            <p className="mt-1 text-slate-800 font-medium">{document.uploader?.name}</p>
                            <p className="text-xs text-slate-400">{new Date(document.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
