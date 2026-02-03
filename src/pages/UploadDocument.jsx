import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import axiosClient from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function UploadDocument() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null); // { current: 1, total: 5, success: 0, fail: 0 }
    const [errors, setErrors] = useState(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        document_category_id: "",
        department_id: "",
        access_level: "department",
        files: [] // Changed from single file to array
    });

    useEffect(() => {
        axiosClient.get('/categories').then(({ data }) => setCategories(data));
        axiosClient.get('/departments').then(({ data }) => setDepartments(data));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setForm({ ...form, files: Array.from(e.target.files) });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors(null);
        setUploadProgress({ current: 0, total: form.files.length, success: 0, fail: 0 });

        const totalFiles = form.files.length;
        let successCount = 0;
        let failCount = 0;
        let lastError = null;

        for (let i = 0; i < totalFiles; i++) {
            const file = form.files[i];
            setUploadProgress(prev => ({ ...prev, current: i + 1 }));
            const toastId = toast.loading(`Uploading ${i + 1}/${totalFiles}: ${file.name}...`);

            const formData = new FormData();
            // Use manual title if single file, else use filename
            formData.append('title', (totalFiles === 1 && form.title) ? form.title : file.name);
            formData.append('description', form.description);
            formData.append('document_category_id', form.document_category_id);
            formData.append('department_id', form.department_id);
            formData.append('access_level', form.access_level);
            formData.append('file', file);

            try {
                await axiosClient.post('/documents', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success(`Uploaded: ${file.name}`, { id: toastId });
                successCount++;
            } catch (err) {
                toast.error(`Failed: ${file.name}`, { id: toastId });
                failCount++;
                if (err.response && err.response.data && err.response.data.errors) {
                    lastError = err.response.data.errors;
                } else {
                    lastError = { message: [err.response?.data?.message || err.message] };
                }
            }

            setUploadProgress(prev => ({ ...prev, success: successCount, fail: failCount }));
        }

        setLoading(false);

        if (failCount === 0) {
            toast.success("All documents uploaded successfully!");
            navigate('/documents');
        } else {
            setErrors(lastError); // Show error from last failure
            if (successCount > 0) {
                toast("Some files failed to upload. Please check errors.", { icon: '⚠️' });
                // Optionally clear successful files from list, but for now keep form as is
            }
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Upload Documents</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                {uploadProgress && loading && (
                    <div className="mb-4 bg-blue-50 text-blue-700 p-4 rounded-lg">
                        <p className="font-bold">Uploading... {uploadProgress.current} / {uploadProgress.total}</p>
                        <p className="text-sm mt-1">Success: {uploadProgress.success} | Failed: {uploadProgress.fail}</p>
                    </div>
                )}

                {errors && (
                    <div className="bg-red-50 p-4 rounded-lg mb-4">
                        <p className="font-bold text-red-800 mb-1">Errors occurred:</p>
                        {Object.keys(errors).map(key => (
                            <p key={key} className="text-red-600 text-sm">• {errors[key][0]}</p>
                        ))}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Only show Title input if 0 or 1 file selected */}
                    {form.files.length <= 1 && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Document Title</label>
                            <input
                                type="text"
                                name="title"
                                required={form.files.length === 0} // Required only if manually typing title for single file? 
                                // Actually if file selected, we default to filename if title is empty? 
                                // Let's keep it simple: Single mode -> Title required. Bulk mode -> Title hidden/auto.
                                className="input-field mt-1"
                                value={form.title}
                                onChange={handleChange}
                                placeholder={form.files.length === 1 ? form.files[0].name : "Enter title"}
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty to use filename.</p>
                        </div>
                    )}

                    {form.files.length > 1 && (
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <p className="text-sm text-slate-700 font-medium">{form.files.length} files selected</p>
                            <ul className="mt-2 text-xs text-slate-500 list-disc list-inside max-h-32 overflow-y-auto">
                                {form.files.map((f, i) => <li key={i}>{f.name}</li>)}
                            </ul>
                            <p className="text-xs text-blue-600 mt-2">Titles will be automatically set to filenames.</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Description (Applied to all)</label>
                        <textarea name="description" className="input-field mt-1" rows="3" value={form.description} onChange={handleChange}></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Category</label>
                            <select name="document_category_id" required className="input-field mt-1" value={form.document_category_id} onChange={handleChange}>
                                <option value="">Select Category</option>
                                <option value="1">Policy</option> {/* Fallback if fetch fails or delayed, but list should populate */}
                                {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Department</label>
                            <select name="department_id" required className="input-field mt-1" value={form.department_id} onChange={handleChange}>
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
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

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Files</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="flex text-sm text-gray-600 justify-center">
                                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                        <span>Upload files</span>
                                        <input name="file" type="file" multiple className="sr-only" onChange={handleFileChange} required />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PDF, DOCX, XLSX up to 10MB each</p>
                                {form.files.length > 0 && <p className="text-sm text-primary-600 font-medium">{form.files.length} files selected</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={() => navigate('/documents')} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading || form.files.length === 0} className="btn-primary">
                            {loading ? 'Uploading...' : 'Upload Documents'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
