import { useState, useEffect } from "react";
import axiosClient from "../api/axios";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Documents() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        category_id: "",
        department_id: "",
        start_date: "",
        end_date: ""
    });
    const [sort, setSort] = useState({
        field: "created_at",
        direction: "desc"
    });
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0
    });

    useEffect(() => {
        // Fetch Master Data
        axiosClient.get('/categories').then(({ data }) => setCategories(data));
        axiosClient.get('/departments').then(({ data }) => setDepartments(data));
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [filters, sort, page]);

    const fetchDocuments = () => {
        setLoading(true);
        const params = {
            page,
            search,
            ...filters,
            sort_by: sort.field,
            sort_direction: sort.direction
        };
        // Clean empty
        Object.keys(params).forEach(key => {
            if (params[key] === "" || params[key] === null) {
                delete params[key];
            }
        });

        axiosClient.get('/documents', { params })
            .then(({ data }) => {
                setDocuments(data.data);
                setPagination({
                    current_page: data.current_page,
                    last_page: data.last_page,
                    total: data.total,
                    from: data.from,
                    to: data.to
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleSort = (field) => {
        setSort(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDocuments();
    };

    const handleDownload = (id, fileName) => {
        axiosClient.get(`/documents/${id}/download`, { responseType: 'blob' })
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
            });
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this document?")) return;
        axiosClient.delete(`/documents/${id}`)
            .then(() => fetchDocuments());
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <h1 className="text-2xl font-bold text-slate-800">Documents</h1>
                {(user?.roles?.[0]?.name === 'admin' || user?.roles?.[0]?.name === 'manager') && (
                    <Link to="/documents/upload" className="btn-primary">
                        Upload Document
                    </Link>
                )}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-6 gap-4">
                <form onSubmit={handleSearch} className="md:col-span-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="input-field pl-10"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </form>

                <select
                    className="input-field"
                    value={filters.category_id}
                    onChange={e => setFilters({ ...filters, category_id: e.target.value })}
                >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>

                <select
                    className="input-field"
                    value={filters.department_id}
                    onChange={e => setFilters({ ...filters, department_id: e.target.value })}
                >
                    <option value="">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>

                <div>
                    <input
                        type="date"
                        className="input-field"
                        title="Start Date"
                        value={filters.start_date}
                        onChange={e => setFilters({ ...filters, start_date: e.target.value })}
                    />
                </div>
                <div>
                    <input
                        type="date"
                        className="input-field"
                        title="End Date"
                        value={filters.end_date}
                        onChange={e => setFilters({ ...filters, end_date: e.target.value })}
                    />
                </div>

                <div className="md:col-span-6 flex justify-end">
                    <button onClick={() => { setFilters({ category_id: "", department_id: "", start_date: "", end_date: "" }); setSearch(""); }} className="btn-secondary">
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading documents...</div>
                ) : documents.length > 0 ? (
                    <>
                        {/* Result Count */}
                        <div className="px-6 py-4 border-b border-slate-100 text-sm text-gray-500 bg-slate-50">
                            Showing <span className="font-medium text-gray-900">{pagination.from || 0}</span> to <span className="font-medium text-gray-900">{pagination.to || 0}</span> of <span className="font-medium text-gray-900">{pagination.total}</span> documents
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th onClick={() => handleSort('title')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100">
                                            Document {sort.field === 'title' && (sort.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dept</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                                        <th onClick={() => handleSort('created_at')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100">
                                            Uploaded By / Date {sort.field === 'created_at' && (sort.direction === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {documents.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-primary-50 rounded-lg text-primary-600">
                                                        {/* File Icon */}
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                                                        <div className="text-sm text-gray-500">{(doc.file_size / 1024).toFixed(1)} KB • {doc.file_type}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {doc.category?.title}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {doc.department?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doc.access_level === 'public' ? 'bg-green-100 text-green-800' :
                                                    doc.access_level === 'private' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {doc.access_level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {doc.uploader?.name}
                                                <div className="text-xs text-gray-400">{new Date(doc.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button onClick={() => handleDownload(doc.id, doc.file_name)} className="text-primary-600 hover:text-primary-900">Download</button>

                                                {(user.roles?.[0]?.name === 'admin' || (user.roles?.[0]?.name === 'manager' && user.id === doc.uploaded_by)) && (
                                                    <>
                                                        <Link to={`/documents/${doc.id}/edit`} className="text-blue-600 hover:text-blue-900">Edit</Link>
                                                        <button onClick={() => handleDelete(doc.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination UI */}
                        {pagination.last_page > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary">Previous</button>
                                    <button onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))} disabled={page === pagination.last_page} className="btn-secondary ml-3">Next</button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">Page <span className="font-medium">{page}</span> of <span className="font-medium">{pagination.last_page}</span></p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Previous</button>
                                            <button onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))} disabled={page === pagination.last_page} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Next</button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="p-8 text-center text-slate-500">No documents found.</div>
                )}
            </div>
        </div>
    );
}
