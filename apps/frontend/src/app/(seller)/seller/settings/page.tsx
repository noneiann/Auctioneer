"use client";

import { Settings, Shield, Bell } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <Settings className="w-6 h-6 text-brand-500" />
                    Account Settings
                </h1>
                <p className="text-brand-300 mt-1">Manage your account preferences and security.</p>
            </div>

            <div className="space-y-4">
                {/* Security Section */}
                <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="w-5 h-5 text-brand-400" />
                        <h2 className="text-lg font-bold text-white">Security</h2>
                    </div>
                    
                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-brand-200 mb-1.5">Current Password</label>
                            <input 
                                type="password"
                                className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-4 py-2.5 text-white placeholder-brand-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-brand-200 mb-1.5">New Password</label>
                            <input 
                                type="password"
                                className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-4 py-2.5 text-white placeholder-brand-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                            />
                        </div>
                        <button className="px-6 py-2 bg-[#1e293b] hover:bg-[#334155] text-white rounded-lg font-medium transition-colors border border-[#334155] mt-2">
                            Update Password
                        </button>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className="w-5 h-5 text-brand-400" />
                        <h2 className="text-lg font-bold text-white">Notifications</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#1e293b]/30 rounded-lg border border-[#1e293b]">
                            <div>
                                <p className="font-medium text-white">New Bids</p>
                                <p className="text-sm text-brand-400">Receive email alerts when someone bids on your auction.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-[#1e293b] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-[#1e293b]/30 rounded-lg border border-[#1e293b]">
                            <div>
                                <p className="font-medium text-white">New Messages</p>
                                <p className="text-sm text-brand-400">Receive email alerts for new chat messages.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-[#1e293b] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
