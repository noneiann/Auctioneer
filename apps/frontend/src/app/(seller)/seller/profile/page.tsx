"use client";

import { useState, useEffect } from "react";
import { User, Mail, Save } from "lucide-react";
import api from "@/lib/api";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        firstName: "",
        lastName: "",
        email: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/users/profile");
                if (response && response.success) {
                    const data = response.data;
                    setFormData({
                        username: data.username || "",
                        firstName: data.firstName || "",
                        lastName: data.lastName || "",
                        email: data.email || ""
                    });
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            const response = await api.put("/users/profile", formData);
            if (response && response.success) {
                setMessage("Profile updated successfully!");
            }
        } catch (error) {
            setMessage("Failed to update profile.");
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(""), 3000);
        }
    };

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <User className="w-6 h-6 text-brand-500" />
                    Public Profile
                </h1>
                <p className="text-brand-300 mt-1">Manage what other users see when viewing your items.</p>
            </div>

            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-sm p-6">
                {loading ? (
                    <div className="h-40 flex items-center justify-center text-brand-500/50">Loading profile data...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-200 mb-1.5">First Name</label>
                                    <input 
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-4 py-2.5 text-white placeholder-brand-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-200 mb-1.5">Last Name</label>
                                    <input 
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-4 py-2.5 text-white placeholder-brand-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-200 mb-1.5">Username (Display Name)</label>
                                    <input 
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-4 py-2.5 text-white placeholder-brand-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-200 mb-1.5 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Email <span className="text-xs text-brand-500">(Cannot be changed here)</span>
                                    </label>
                                    <input 
                                        disabled
                                        name="email"
                                        value={formData.email}
                                        className="w-full bg-[#1e293b]/50 border border-[#1e293b] rounded-lg px-4 py-2.5 text-neutral-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="w-full sm:w-48 flex flex-col items-center gap-4">
                                <div className="w-32 h-32 rounded-full bg-[#1e293b] border-4 border-[#020617] flex items-center justify-center overflow-hidden">
                                    <User className="w-12 h-12 text-brand-500/30" />
                                </div>
                                <button type="button" className="text-sm text-brand-400 hover:text-white transition-colors">
                                    Change Avatar
                                </button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-[#1e293b] flex items-center justify-between">
                            <p className={`text-sm ${message.includes("success") ? "text-emerald-500" : "text-red-500"}`}>
                                {message}
                            </p>
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
