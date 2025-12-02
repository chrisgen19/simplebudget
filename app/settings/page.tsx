'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    birthday: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');

  // Password change fields
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    setUser(userData);
    fetchUserProfile(userData.id);
  }, [router]);

  const fetchUserProfile = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'x-user-id': userId.toString(),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setBirthday(new Date(data.birthday).toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const updateData: any = {
        firstName,
        lastName,
        email,
        birthday,
      };

      // Add password change if requested
      if (showPasswordChange && newPassword) {
        if (newPassword !== confirmPassword) {
          alert('New passwords do not match');
          setSaving(false);
          return;
        }
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id.toString(),
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedUser = await response.json();

        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
        }));

        setSaved(true);
        setTimeout(() => setSaved(false), 2000);

        // Clear password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordChange(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800"
          >
            <span className="text-xl">←</span>
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-xl font-bold text-slate-800">Settings</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Profile Information</h2>

        {/* First Name */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="Enter first name"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
            Last Name
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="Enter last name"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-200"
            placeholder="Enter email"
          />
        </div>

        {/* Birthday */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
            Birthday
          </label>
          <input
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mt-4">
        <button
          onClick={() => setShowPasswordChange(!showPasswordChange)}
          className="w-full flex items-center justify-between text-left"
        >
          <h2 className="text-lg font-semibold text-slate-800">Change Password</h2>
          <span className="text-slate-500">{showPasswordChange ? '−' : '+'}</span>
        </button>

        {showPasswordChange && (
          <div className="mt-4 space-y-4">
            {/* Current Password */}
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Enter current password"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Enter new password"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-200"
                placeholder="Confirm new password"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSaveProfile}
        disabled={saving || !firstName || !lastName || !email || !birthday}
        className={`w-full mt-6 py-4 rounded-2xl font-semibold text-lg transition-all ${
          firstName && lastName && email && birthday && !saving
            ? 'bg-slate-800 text-white hover:bg-slate-700 active:scale-98'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full mt-3 py-4 rounded-2xl font-semibold text-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
      >
        Logout
      </button>
    </div>
  );
}
