'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Phone, Briefcase, CheckCircle2, Clock } from 'lucide-react';
import api from '@/lib/api';
import { notify } from '@/lib/notify';
import { useAuth } from '@/lib/AuthContext';
import TaloraLoader from '@/components/TaloraLoader';

interface HRProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  company?: string;
  industry?: string;
  companySize?: string;
  isVerified?: boolean;
}

const API_TIMEOUT_MS = 35000;

function getApiErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null) {
    const maybe = err as { code?: string; response?: { data?: { error?: string } } };
    if (maybe.code === 'ECONNABORTED') {
      return 'Server is waking up — please wait a moment and try again.';
    }
    if (typeof maybe.response?.data?.error === 'string') {
      return maybe.response.data.error;
    }
  }
  return fallback;
}

export default function HRProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<HRProfile | null>(null);
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveLabel, setSaveLabel] = useState('Save Profile');

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone ?? prev?.phone,
        position: user.position ?? prev?.position,
        company: user.company ?? prev?.company,
        industry: user.industry ?? prev?.industry,
        companySize: user.companySize ?? prev?.companySize,
        isVerified: user.isVerified ?? prev?.isVerified,
      }));
      if (user.phone) setPhone(user.phone);
      if (user.position) setPosition(user.position);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    api.get('/health', { timeout: 8000 }).catch(() => {});

    const fetchProfile = async () => {
      try {
        const res = await api.get<HRProfile>('/auth/hr-profile', { timeout: API_TIMEOUT_MS });
        setProfile(res.data);
        setPhone(res.data.phone || '');
        setPosition(res.data.position || '');
      } catch (err) {
        console.error('Failed to load HR profile:', err);
        if (!user) notify(getApiErrorMessage(err, 'Failed to load profile'));
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    const trimmedPosition = position.trim();

    if (!trimmedPhone || !trimmedPosition) {
      notify('Phone and position are required');
      return;
    }

    if (saving) return;

    const previousProfile = profile;
    const previousPhone = phone;
    const previousPosition = position;

    setSaving(true);
    setSaveLabel('Saving...');

    const optimisticProfile: HRProfile = {
      _id: profile?._id || user?._id || '',
      name: profile?.name || user?.name || '',
      email: profile?.email || user?.email || '',
      phone: trimmedPhone,
      position: trimmedPosition,
      company: profile?.company,
      industry: profile?.industry,
      companySize: profile?.companySize,
      isVerified: profile?.isVerified ?? user?.isVerified,
    };

    setProfile(optimisticProfile);
    if (user) {
      updateUser({ ...user, phone: trimmedPhone, position: trimmedPosition });
    }

    try {
      const res = await api.put<{ user: HRProfile; message: string }>(
        '/auth/hr-profile',
        { phone: trimmedPhone, position: trimmedPosition },
        { timeout: API_TIMEOUT_MS }
      );
      setProfile(res.data.user);
      if (user) {
        updateUser({ ...user, phone: res.data.user.phone, position: res.data.user.position });
      }
      setSaveLabel('Saved');
      notify('Profile saved successfully');
      setTimeout(() => setSaveLabel('Save Profile'), 2000);
    } catch (err: unknown) {
      setProfile(previousProfile);
      setPhone(previousPhone);
      setPosition(previousPosition);
      if (user && previousProfile) {
        updateUser({
          ...user,
          phone: previousProfile.phone,
          position: previousProfile.position,
        });
      }
      notify(getApiErrorMessage(err, 'Failed to save profile'));
      setSaveLabel('Save Profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return <TaloraLoader message="Loading profile..." className="min-h-[50vh]" />;
  }

  const profileComplete = Boolean(phone.trim() && position.trim());
  const isVerified = profile?.isVerified ?? user?.isVerified;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Profile</h1>
        <p className="text-gray-600 mt-1">
          Complete your profile so an admin can verify your account. After approval, you can post jobs.
        </p>
      </div>

      {!isVerified && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
          <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-900">Verification pending</p>
            <p className="text-sm text-amber-800 mt-1">
              Fill in your phone and position below. An admin will add your company details and approve your account.
              Until then, you cannot post jobs.
            </p>
          </div>
        </div>
      )}

      {isVerified && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-900">Account verified</p>
            <p className="text-sm text-green-800 mt-1">You can post and manage jobs.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
            <div><span className="text-gray-500">Name</span><p className="font-medium">{profile?.name}</p></div>
            <div><span className="text-gray-500">Email</span><p className="font-medium">{profile?.email}</p></div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Phone className="h-4 w-4" />
                Phone *
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={saving}
              />
            </div>
            <div>
              <label htmlFor="position" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="h-4 w-4" />
                Position *
              </label>
              <input
                id="position"
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. HR Manager, Talent Acquisition Lead"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {(profile?.company || profile?.industry || profile?.companySize) && (
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Company (set by admin)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-4">
              <div><span className="text-gray-500">Company</span><p className="font-medium">{profile?.company || '—'}</p></div>
              <div><span className="text-gray-500">Industry</span><p className="font-medium">{profile?.industry || '—'}</p></div>
              <div className="sm:col-span-2"><span className="text-gray-500">Company Size</span><p className="font-medium">{profile?.companySize || '—'}</p></div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 gap-4">
          <p className="text-sm text-gray-500">
            {saving
              ? 'Syncing with server...'
              : profileComplete
                ? 'Profile ready for admin review'
                : 'Complete both fields to submit for verification'}
          </p>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 shrink-0"
          >
            {saveLabel}
          </button>
        </div>
      </form>

      {!isVerified && profileComplete && (
        <p className="text-center text-sm text-gray-500">
          Waiting for admin approval.{' '}
          <Link href="/hr/jobs" className="text-blue-600 hover:underline">Job posting</Link> unlocks after verification.
        </p>
      )}
    </div>
  );
}
