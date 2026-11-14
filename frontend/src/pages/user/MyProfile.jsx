import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Bell, 
  Lock, 
  CheckCircle2, 
  Camera,
  Save,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const MyProfile = () => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.department || 'Hashu Advani Memorial Complex, Chembur');
  const [bio, setBio] = useState(user?.bio || 'Member of Vivekanand Education Society HAMC campus.');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.department || 'Hashu Advani Memorial Complex, Chembur');
      setBio(user.bio || 'Member of Vivekanand Education Society HAMC campus.');
    }
  }, [user]);
  
  // Notification preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [digest, setDigest] = useState(false);

  // Password update
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      phone,
      department: address,
      bio,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword || !newPassword) return;

    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPasswordSaved(false), 2500);
    } catch (err) {
      setPasswordError(err.response?.data?.message || err.message || 'Failed to change password');
    }
  };

  return (
    <div className="w-full space-y-8">
      
      {/* Top Banner */}
      <div className="bg-sand-200/50 rounded-2xl p-6 sm:p-8 border border-sand-300">
        <h1 className="text-2xl sm:text-3xl font-bold text-olive">
          Account & Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-light mt-1">
          Update contact channels for instant AI match notifications and manage verified credentials.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="card-warm p-6 bg-cream-50 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
            alt="Profile Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-sand-300 shadow-md"
          />
          <button
            type="button"
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-terracotta text-white hover:bg-terracotta-hover transition shadow-sm"
            title="Change photo"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-1.5 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-2xl font-bold text-olive">{user?.name}</h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-sage-200 text-olive w-fit mx-auto sm:mx-0">
              <ShieldCheck className="w-3 h-3 text-olive" />
              Verified Campus Member
            </span>
          </div>
          <p className="text-xs text-charcoal-muted">Member since {user?.joinedDate || 'March 2024'} • TraceBack Identity Level 2</p>
          <p className="text-xs text-charcoal-light max-w-lg">{bio}</p>
        </div>
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleProfileSubmit} className="space-y-6">
        
        {/* Contact Details */}
        <div className="card-warm p-6 bg-cream-50 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-olive border-b border-sand-200 pb-2">
            Personal & Contact Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white pl-9 pr-3 py-2 rounded-xl border border-sand-300 text-xs text-charcoal focus:outline-none focus:border-terracotta"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                Email Address (Primary Login)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white pl-9 pr-3 py-2 rounded-xl border border-sand-300 text-xs text-charcoal focus:outline-none focus:border-terracotta"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                Mobile Phone (SMS Urgent Matches)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white pl-9 pr-3 py-2 rounded-xl border border-sand-300 text-xs text-charcoal focus:outline-none focus:border-terracotta"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                Primary City / Region
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-charcoal-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white pl-9 pr-3 py-2 rounded-xl border border-sand-300 text-xs text-charcoal focus:outline-none focus:border-terracotta"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-olive mb-1">
                Brief Bio
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white p-3 rounded-xl border border-sand-300 text-xs text-charcoal focus:outline-none focus:border-terracotta"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card-warm p-6 bg-cream-50 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-olive border-b border-sand-200 pb-2">
            Alert & Notification Settings
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-sand-100 hover:bg-sand-200/60 transition cursor-pointer">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-olive">Email Match Alerts</p>
                <p className="text-[11px] text-charcoal-muted">Receive email whenever Rekognition detects a potential match for your lost report.</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded text-terracotta focus:ring-terracotta h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-sand-100 hover:bg-sand-200/60 transition cursor-pointer">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-olive">SMS Urgent Match Notifications</p>
                <p className="text-[11px] text-charcoal-muted">Immediate text dispatch for high-confidence matches (&gt;90% similarity).</p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="rounded text-terracotta focus:ring-terracotta h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-sand-100 hover:bg-sand-200/60 transition cursor-pointer">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-olive">Weekly Lost & Found Community Digest</p>
                <p className="text-[11px] text-charcoal-muted">Summary of new items logged in your local metro hub.</p>
              </div>
              <input
                type="checkbox"
                checked={digest}
                onChange={(e) => setDigest(e.target.checked)}
                className="rounded text-terracotta focus:ring-terracotta h-4 w-4"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-terracotta px-6 py-2.5 text-xs font-semibold shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Profile Preferences
          </button>
        </div>

      </form>

      {/* Change Password Card */}
      <div className="card-warm p-6 bg-cream-50 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-olive border-b border-sand-200 pb-2">
          Security & Password
        </h3>

        {passwordSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Password successfully updated!</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white p-2.5 rounded-xl border border-sand-300 text-xs text-charcoal focus:outline-none focus:border-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-olive mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white p-2.5 rounded-xl border border-sand-300 text-xs text-charcoal focus:outline-none focus:border-terracotta"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-olive text-cream-100 rounded-xl text-xs font-semibold hover:bg-olive-dark transition"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
