import { useState, useEffect } from "react";
import axiosClient from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function Categories() {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: "", description: "" });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = () => {
        setLoading(true);
        axiosClient.get('/categories')
            .then(({ data }) => {
                setCategories(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);

        const request = editing
            ? axiosClient.put(`/categories/${editing.id}`, form)
            : axiosClient.post('/categories', form);

        request
            .then(() => {
                fetchCategories();
                setEditing(null);
                setForm({ title: "", description: "" });
            })
            .catch(err => {
                if (err.response && err.response.data.errors) {
                    setError(Object.values(err.response.data.errors).flat().join(", "));
                } else {
                    setError(err.response?.data?.message || "An error occurred");
                }
            });
    };

    const handleEdit = (cat) => {
        setEditing(cat);
        setForm({ title: cat.title, description: cat.description || "" });
    };

    const handleCancel = () => {
        setEditing(null);
        setForm({ title: "", description: "" });
        setError(null);
    };

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure?")) return;
        axiosClient.delete(`/categories/${id}`)
            .then(() => fetchCategories())
            .catch(err => alert("Failed to delete. " + (err.response?.data?.message || "")));
    };

    if (user?.roles?.[0]?.name !== 'admin') {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Manage Categories</h1>

            {/* Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h2 className="text-lg font-medium mb-4">{editing ? 'Edit Category' : 'Create New Category'}</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-start">
                    <div className="flex-1 w-full">
                        <input
                            type="text"
                            placeholder="Category Title"
                            required
                            className="input-field"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <input
                            type="text"
                            placeholder="Description (Optional)"
                            className="input-field"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-primary whitespace-nowrap">
                            {editing ? 'Update' : 'Create'}
                        </button>
                        {editing && (
                            <button type="button" onClick={handleCancel} className="btn-secondary">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{cat.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{cat.description}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-900">Edit</button>
                                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
