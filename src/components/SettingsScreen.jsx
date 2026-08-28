import React, { useState } from 'react';
import { User, Shield, Key, Smartphone, Moon, Sun, FileText, X, Bell, Database, Palette, LogOut, ChevronRight, Camera, Languages, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StorageSettings from './StorageScreen';
import { supabase } from '../services/supabase';
import { uploadToCloudinary } from '../services/cloudinary';

export default function SettingsScreen({ darkMode, setDarkMode }) {
  const { user, signOut } = useAuth();
  const [showKeys, setShowKeys] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [showPolicy, setShowPolicy] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showStorage, setShowStorage] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.user_metadata?.full_name || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [keyFingerprint, setKeyFingerprint] = useState(localStorage.getItem('mychat-key-fingerprint') || 'No key generated yet');
  const [sessionInfo, setSessionInfo] = useState('This device');
  const [twoFactor, setTwoFactor] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('mychat-language') || 'English');
  const [dataSaver, setDataSaver] = useState(localStorage.getItem('mychat-data-saver') === 'true');
  const saveProfile = async () => {
    const name = profileName.trim();
    if (!name) return;
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
    if (error) setProfileMessage(error.message);
    else { await supabase.from('profiles').upsert({ id: user.id, display_name: name }, { onConflict: 'id' }); setProfileMessage('Profile updated'); setEditingProfile(false); }
  };

  const generateKey = async () => {
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    const exported = new Uint8Array(await crypto.subtle.exportKey('raw', key));
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', exported));
    const fingerprint = Array.from(digest, (byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 32);
    localStorage.setItem('mychat-key-fingerprint', fingerprint);
    setKeyFingerprint(fingerprint);
  };

  const toggleBiometric = (enabled) => {
    localStorage.setItem('mychat-biometric-enabled', String(enabled));
    setBiometricEnabled(enabled);
  };

  const toggleNotifications = async (enabled) => {
    if (enabled && 'Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
    setNotifications(enabled);
    localStorage.setItem('mychat-notifications-enabled', String(enabled));
  };

  const setupTwoFactor = async () => {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) setProfileMessage(error.message); else setTwoFactor((data?.totp || []).length > 0);
    if (!twoFactor) setProfileMessage('Enable TOTP in Supabase Auth to finish 2FA setup.');
  };

  React.useEffect(() => {
    setNotifications(localStorage.getItem('mychat-notifications-enabled') !== 'false');
    setBiometricEnabled(localStorage.getItem('mychat-biometric-enabled') !== 'false');
    supabase.auth.getSession().then(({ data }) => setSessionInfo(data.session ? `Active on this device (${data.session.user.email})` : 'No active session'));
  }, []);

  const changePhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) throw new Error('Your login session expired. Please log in again.');
      const { secure_url: avatarUrl } = await uploadToCloudinary(file, 'image');
      const { error } = await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
      if (error) throw error;
      await supabase.from('profiles').upsert({ id: user.id, display_name: profileName || user.user_metadata?.full_name || 'MyChat User', avatar_url: avatarUrl }, { onConflict: 'id' });
      setProfileMessage('Profile photo updated');
    } catch (error) {
      setProfileMessage(error.message || 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto text-white space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-xs text-slate-400">kamalgc.com.np</p>
      <button onClick={() => setDarkMode(!darkMode)} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between"><span className="flex items-center gap-3"><Palette className="w-5 h-5 text-indigo-400" /><span className="text-sm font-semibold">Appearance</span></span><span className="text-xs text-slate-400">{darkMode ? 'Dark' : 'Light'}</span></button>

      {/* User Profile Section */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4">
        <div className="relative"><img
          src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || 'MyChat')}&background=4f46e5&color=fff`}
          alt="Profile" 
          className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500" 
        /><label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer"><Camera className="w-4 h-4" /><input type="file" accept="image/*" onChange={changePhoto} className="hidden" /></label></div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{user?.user_metadata?.full_name || 'MyChat User'}</h3>
          <p className="text-xs text-slate-400">{user?.email}</p>
          {editingProfile && <div className="flex gap-2 mt-2"><input value={profileName} onChange={(event) => setProfileName(event.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs" /><button onClick={saveProfile} className="bg-indigo-600 rounded-lg px-2 py-1 text-xs">Save</button></div>}
          {profileMessage && <p className="text-xs text-emerald-400 mt-1">{uploadingPhoto ? 'Uploading photo...' : profileMessage}</p>}
        </div>
        <button onClick={() => setEditingProfile(!editingProfile)} className="text-xs text-indigo-400">{editingProfile ? 'Cancel' : 'Edit'}</button>
      </div>

      {/* Security & Privacy Sub-menu */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-semibold">Biometric Lock</h4>
              <p className="text-xs text-slate-400">Require fingerprint/face ID to open app</p>
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={biometricEnabled} 
            onChange={(event) => toggleBiometric(event.target.checked)}
            className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" 
          />
        </div>
        <div className="p-4 flex items-center justify-between"><div className="flex items-center space-x-3"><ShieldCheck className="w-5 h-5 text-indigo-400" /><div><h4 className="text-sm font-semibold">Two-factor authentication</h4><p className="text-xs text-slate-400">Protect sign-in with an authenticator app</p></div></div><button onClick={setupTwoFactor} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs">{twoFactor ? 'Enabled' : 'Set up'}</button></div>

        {/* E2EE Keys View Toggle */}
        <div 
          onClick={() => setShowKeys(!showKeys)}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition"
        >
          <div className="flex items-center space-x-3">
            <Key className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-semibold">E2EE Security Keys</h4>
              <p className="text-xs text-slate-400">View public/private key fingerprints</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </div>

        {showKeys && (
          <div className="p-4 bg-slate-950 font-mono text-xs text-indigo-300 space-y-2">
            <p><strong>Public Key Fingerprint:</strong></p>
            <p className="bg-slate-900 p-2 rounded border border-slate-800 text-[10px] break-all">
              {keyFingerprint}
            </p>
            <button onClick={generateKey} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs">Generate new key fingerprint</button>
          </div>
        )}

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-semibold">Active Sessions</h4>
              <p className="text-xs text-slate-400">Manage connected devices</p>
            </div>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">{sessionInfo}</span>
        </div>
        <div className="p-4 flex items-center justify-between"><div className="flex items-center space-x-3"><Database className="w-5 h-5 text-indigo-400" /><div><h4 className="text-sm font-semibold">Data usage</h4><p className="text-xs text-slate-400">Prefer lower media quality</p></div></div><input type="checkbox" checked={dataSaver} onChange={(event) => { setDataSaver(event.target.checked); localStorage.setItem('mychat-data-saver', String(event.target.checked)); }} className="w-5 h-5 accent-indigo-600" /></div>
        <div className="p-4 flex items-center justify-between"><div className="flex items-center space-x-3"><Languages className="w-5 h-5 text-indigo-400" /><div><h4 className="text-sm font-semibold">Language</h4><p className="text-xs text-slate-400">Choose app language</p></div></div><select value={language} onChange={(event) => { setLanguage(event.target.value); localStorage.setItem('mychat-language', event.target.value); }} className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs"><option>English</option><option>Nepali</option></select></div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3"><Bell className="w-5 h-5 text-indigo-400" /><div><h4 className="text-sm font-semibold">Notifications</h4><p className="text-xs text-slate-400">Message and call alerts</p></div></div>
          <input type="checkbox" checked={notifications} onChange={(event) => toggleNotifications(event.target.checked)} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
        </div>
        <button onClick={() => setShowStorage(!showStorage)} className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-800/50"><Database className="w-5 h-5 text-indigo-400" /><span className="text-sm font-semibold">Storage and Data</span><ChevronRight className="w-5 h-5 text-slate-500 ml-auto" /></button>
        {showStorage && <div className="p-4"><StorageSettings /></div>}
        <button onClick={() => setShowPolicy(true)} className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-800/50"><FileText className="w-5 h-5 text-indigo-400" /><span className="text-sm font-semibold">Privacy Policy</span></button>
        <button onClick={signOut} className="w-full p-4 flex items-center gap-3 text-left text-red-400 hover:bg-slate-800/50"><LogOut className="w-5 h-5" /><span className="text-sm font-semibold">Log out</span></button>
      </div>
      {showPolicy && <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"><div className="max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-3"><div className="flex justify-between"><h2 className="font-bold">Privacy Policy</h2><button onClick={() => setShowPolicy(false)}><X /></button></div><p className="text-sm text-slate-300">MyChat stores account and messages in Supabase. Camera and microphone are used only during calls. Uploaded media is stored with the configured provider.</p><p className="text-xs text-slate-500">Copyright 2026 MyChat. All rights reserved. kamalgc.com.np</p></div></div>}
    </div>
  );
}
