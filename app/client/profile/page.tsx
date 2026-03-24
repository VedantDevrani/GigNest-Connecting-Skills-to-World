'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { User, Mail, Briefcase, Calendar } from 'lucide-react';

export default function ClientProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        bio: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/client/profile');
                if (!res.ok) throw new Error('Failed to fetch profile');
                const data = await res.json();
                setProfile(data.user);
                setFormData({
                    name: data.user.name || '',
                    bio: data.user.bio || ''
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/client/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('Failed to update profile');
            setSuccess('Profile updated successfully!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your profile...</div>;

    return (
        <div className="space-y-6 fade-in max-w-3xl">
            <div>
                <h1 className="text-3xl font-bold font-poppins text-gray-900 dark:text-white">Profile Settings</h1>
                <p className="text-gray-500 mt-1">Manage your public company profile and account details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Profile Card */}
                <Card className="col-span-1 p-6 bg-primary/5 dark:bg-primary/10 border-none text-center flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center mb-4">
                        <User className="w-12 h-12" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-1">{profile?.name}</h3>
                    <p className="text-sm font-medium text-gray-500 mb-6 flex items-center gap-1 justify-center"><Briefcase className="w-3 h-3" /> Client Account</p>

                    <div className="w-full text-left space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-xs text-gray-500 flex items-center gap-2"><Mail className="w-4 h-4" /> {profile?.email}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Joined {new Date(profile?.createdAt).getFullYear()}</p>
                    </div>
                </Card>

                {/* Edit Form */}
                <Card className="col-span-1 md:col-span-2 p-6 bg-white dark:bg-gray-900 shadow-sm border-gray-100 dark:border-gray-800">
                    <form onSubmit={handleSave} className="space-y-6">
                        <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-4">Edit Details</h2>

                        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
                        {success && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg">{success}</div>}

                        <Input
                            label="Company / Display Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <div className="space-y-1">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Company Bio / Description</label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-gray-900 dark:text-gray-100"
                                placeholder="Tell freelancers about your company and the work you do..."
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Card>

            </div>
        </div>
    );
}
