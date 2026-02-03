import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axios";

export default function EditDocument() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        document_category_id: "",
        access_level: ""
    });

    useEffect(() => {
        // Fetch categories and document
        const fetchData = async () => {
            try {
                const [catRes, docRes] = await Promise.all([
                    axiosClient.get('/categories'),
                    axiosClient.get(`/documents/${id}`)
                ]);
                setCategories(catRes.data);
                const doc = docRes.data;
                setForm({
                    title: doc.title,
                    description: doc.description || "",
                    document_category_id: doc.document_category_id,
                    access_level: doc.access_level
                });
                setLoading(false);
            } catch (error) {
                navigate('/documents');
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);

        axiosClient.put(`/documents/${id}`, form)
            .then(() => {
                navigate(`/documents/${id}`);
            })
            .catch(err => {
                if (err.response && err.response.data.errors) {
                    setErrors(err.response.data.errors);
                } else {
                    setErrors({ message: [err.response.data.message || 'An error occurred'] });
                }
                setLoading(false);
            });
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Edit Document</h1>
                <Link to={`/documents/${id}`} className="text-primary-600 hover:text-primary-800">Cancel</Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                {errors && (
                    <div className="bg-red-50 p-4 rounded-lg mb-4">
                        {Object.keys(errors).map(key => (
                            <p key={key} className="text-red-600 text-sm">• {errors[key][0]}</p>
                        ))}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Document Title</label>
                        <input type="text" name="title" required className="input-field mt-1" value={form.title} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <textarea name="description" className="input-field mt-1" rows="3" value={form.description} onChange={handleChange}></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Category</label>
                        <select name="document_category_id" required className="input-field mt-1" value={form.document_category_id} onChange={handleChange}>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Access Level</label>
                        <div className="mt-2 flex space-x-4">
                            {['public', 'department', 'private'].map(level => (
                                <label key={level} className="inline-flex items-center">
                                    <input
                                        type="radio"
                                        name="access_level"
                                        value={level}
                                        checked={form.access_level === level}
                                        onChange={handleChange}
                                        className="form-radio text-primary-600 h-4 w-4"
                                    />
                                    <span className="ml-2 bg-slate-100 px-2 py-1 rounded text-sm capitalize">{level}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
