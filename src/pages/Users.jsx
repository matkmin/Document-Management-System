import { useState, useEffect } from "react";
import axiosClient from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Users() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // The user object being edited
    const [form, setForm] = useState({
        name: "",
        email: "",
        department_id: "",
        role: "",
        password: ""
    });
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [creating, setCreating] = useState(false); // Track if creating new user

    useEffect(() => {
        fetchMasterData();
        fetchUsers();
    }, [page]);

    const fetchMasterData = async () => {
        const [deptRes, roleRes] = await Promise.all([
            axiosClient.get('/departments'),
            axiosClient.get('/roles')
        ]);
        setDepartments(deptRes.data);
        setRoles(roleRes.data);
    };

    const fetchUsers = () => {
        setLoading(true);
        axiosClient.get(`/users?page=${page}`)
            .then(({ data }) => {
                setUsers(data.data);
                setTotalPages(data.last_page);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleCreate = () => {
        setCreating(true);
        setEditing(null);
        setForm({ name: "", email: "", department_id: "", role: "", password: "" });
        setError(null);
    };

    const handleEdit = (u) => {
        setEditing(u);
        setCreating(false);
        setForm({
            name: u.name,
            email: u.email,
            department_id: u.department_id || "",
            role: u.roles?.[0]?.name || "",
            password: "" // Blank by default
        });
        setError(null);
    };

    const handleCancel = () => {
        setEditing(null);
        setCreating(false);
        setForm({ name: "", email: "", department_id: "", role: "", password: "" });
        setError(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        if (!editing && !creating) return;

        const request = editing
            ? axiosClient.put(`/users/${editing.id}`, form)
            : axiosClient.post('/users', form);

        request
            .then(() => {
                fetchUsers();
                setEditing(null);
                setCreating(false);
                alert(editing ? "User updated successfully" : "User created successfully");
                setForm({ name: "", email: "", department_id: "", role: "", password: "" });
            })
            .catch(err => {
                if (err.response && err.response.data.errors) {
                    setError(Object.values(err.response.data.errors).flat().join(", "));
                } else {
                    setError(err.response?.data?.message || "An error occurred");
                }
            });
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;
        axiosClient.delete(`/users/${id}`)
            .then(() => fetchUsers())
            .catch(err => alert("Failed to delete. " + (err.response?.data?.message || "")));
    };

    if (user?.roles?.[0]?.name !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
                {!creating && !editing && (
                    <button onClick={handleCreate} className="btn-primary">Create User</button>
                )}
            </div>

            {(editing || creating) ? (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 max-w-2xl">
                    <h2 className="text-lg font-medium mb-4">{editing ? `Edit User: ${editing.name}` : 'Create New User'}</h2>
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Name</label>
                            <input type="text" required className="input-field mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" required className="input-field mt-1" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Department</label>
                                <select className="input-field mt-1" value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}>
                                    <option value="">None</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Role</label>
                                <select required className="input-field mt-1" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                                    <option value="">Select Role</option>
                                    {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Password {editing ? "(Leave blank to keep)" : "(Required)"}</label>
                            <input type="password" required={!editing} className="input-field mt-1" placeholder="New Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={handleCancel} className="btn-secondary">Cancel</button>
                            <button type="submit" className="btn-primary">{editing ? 'Update User' : 'Create User'}</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading && <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>}
                                {!loading && users.map(u => (
                                    <tr key={u.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{u.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{u.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 capitalize">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {u.roles?.[0]?.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{u.department?.name || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                            {u.id !== user.id && (
                                                <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Previous</button>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">Next</button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span></p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Previous</button>
                                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">Next</button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
