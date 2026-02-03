import { useState } from "react";
import axiosClient from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
    const { user, setUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [errors, setErrors] = useState(null);

    const [form, setForm] = useState({
        name: user.name,
        password: "",
        password_confirmation: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const onSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setErrors(null);

        axiosClient.put('/profile', form)
            .then(({ data }) => {
                setUser(data.user);
                setMessage("Profile updated successfully.");
                setForm({ ...form, password: "", password_confirmation: "" }); // Clear password fields
                setLoading(false);
            })
            .catch(err => {
                if (err.response && err.response.data && err.response.data.errors) {
                    setErrors(err.response.data.errors);
                } else {
                    const msg = err.response?.data?.message || err.message || 'An error occurred';
                    setErrors({ message: [msg] });
                }
                setLoading(false);
            });
    };

    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">User Profile</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                {message && (
                    <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 text-sm">
                        {message}
                    </div>
                )}

                {errors && (
                    <div className="bg-red-50 p-4 rounded-lg mb-4">
                        {Object.keys(errors).map(key => (
                            <p key={key} className="text-red-600 text-sm">• {errors[key][0]}</p>
                        ))}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Name</label>
                        <input type="text" name="name" required className="input-field mt-1" value={form.name} onChange={handleChange} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Email (Read Only)</label>
                        <input type="email" disabled className="input-field mt-1 bg-slate-50 text-slate-500" value={user.email} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700">Role</label>
                        <input type="text" disabled className="input-field mt-1 bg-slate-50 text-slate-500 capitalize" value={user.roles?.[0]?.name} />
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <h3 className="text-sm font-medium text-slate-800 mb-4">Change Password</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">New Password</label>
                                <input type="password" name="password" className="input-field mt-1" placeholder="Leave blank to keep current" value={form.password} onChange={handleChange} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                                <input type="password" name="password_confirmation" className="input-field mt-1" value={form.password_confirmation} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
                            {loading ? 'Updating...' : 'Update Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
