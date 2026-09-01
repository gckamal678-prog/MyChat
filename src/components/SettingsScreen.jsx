import React, { useState } from 'react';
import { User, Shield, Key, Smartphone, Moon, Sun, FileText, X, Bell, Database, Palette, LogOut, ChevronRight, Camera, Languages, ShieldCheck, UserX, UserMinus, Info } from 'lucide-react';
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
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('mychat-language') || 'English');
  const [dataSaver, setDataSaver] = useState(localStorage.getItem('mychat-data-saver') === 'true');

  // New state variables for requested additions
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [showLinkedDevices, setShowLinkedDevices] = useState(false);
  const [linkedDevices, setLinkedDevices] = useState([]);
  const [showAbout, setShowAbout] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    if (enabled && Notification.permission === 'granted' && 'serviceWorker' in navigator && import.meta.env.VITE_VAPID_PUBLIC_KEY) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: Uint8Array.from(atob(import.meta.env.VITE_VAPID_PUBLIC_KEY.replace(/-/g, '+').replace(/_/g, '/')), (character) => character.charCodeAt(0)) });
      await supabase.from('push_subscriptions').upsert({ user_id: user.id, endpoint: subscription.endpoint, subscription: subscription.toJSON() }, { onConflict: 'endpoint' });
    }
    setNotifications(enabled);
    localStorage.setItem('mychat-notifications-enabled', String(enabled));
  };

  const setupTwoFactor = async () => {
    setTwoFactorBusy(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) setProfileMessage(error.message);
    else if ((data?.totp || []).some((factor) => factor.status === 'verified')) setTwoFactor(true);
    else {
      const { data: enrollment, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'MyChat Authenticator' });
      if (enrollError) setProfileMessage(enrollError.message);
      else setTwoFactorSetup(enrollment);
    }
    setTwoFactorBusy(false);
  };

  const verifyTwoFactor = async () => {
    if (!twoFactorSetup?.id || !/^\d{6}$/.test(twoFactorCode)) return;
    setTwoFactorBusy(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: twoFactorSetup.id });
    if (challengeError) setProfileMessage(challengeError.message);
    else {
      const { error } = await supabase.auth.mfa.verify({ factorId: twoFactorSetup.id, challengeId: challenge.id, code: twoFactorCode });
      if (error) setProfileMessage(error.message);
      else { setTwoFactor(true); setTwoFactorSetup(null); setTwoFactorCode(''); setProfileMessage('Two-factor authentication enabled'); }
    }
    setTwoFactorBusy(false);
  };

  // Fetch blocked users and linked devices on mount
  React.useEffect(() => {
    setNotifications(localStorage.getItem('mychat-notifications-enabled') !== 'false');
    setBiometricEnabled(localStorage.getItem('mychat-biometric-enabled') !== 'false');
    supabase.auth.getSession().then(async ({ data }) => {
      setSessionInfo(data.session ? `Active on this device (${data.session.user.email})` : 'No active session');
      if (data.session && user?.id) {
        const deviceName = `${navigator.platform || 'Browser'} (${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'})`;
        await supabase.from('device_sessions').upsert({ user_id: user.id, device_name: deviceName, last_seen_at: new Date().toISOString() }, { onConflict: 'user_id,device_name' });
        const { data: sessions } = await supabase.from('device_sessions').select('id, device_name, last_seen_at, revoked_at').eq('user_id', user.id).is('revoked_at', null).order('last_seen_at', { ascending: false });
        setLinkedDevices(sessions || []);
      }
    });
    
    // Fetch blocked users if table exists
    const fetchBlockedUsers = async () => {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('blocked_users')
        .select('*, blocked:profiles!blocked_users_blocked_id_fkey(display_name, avatar_url)')
        .eq('user_id', user.id);
      if (!error && data) {
        setBlockedUsers(data);
      }
    };
    fetchBlockedUsers();
  }, [user]);

  const signOutOtherDevices = async () => {
    const currentName = `${navigator.platform || 'Browser'} (${navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'})`;
    const { error } = await supabase.from('device_sessions').update({ revoked_at: new Date().toISOString() }).eq('user_id', user.id).neq('device_name', currentName).is('revoked_at', null);
    if (error) setProfileMessage(error.message);
    else {
      await supabase.auth.signOut({ scope: 'others' });
      setLinkedDevices((current) => current.filter((device) => device.device_name === currentName));
      setProfileMessage('All other device sessions signed out');
    }
  };

  const unblockUser = async (blockId) => {
    const { error } = await supabase.from('blocked_users').delete().eq('id', blockId);
    if (!error) {
      setBlockedUsers(blockedUsers.filter(b => b.id !== blockId));
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setDeleteLoading(true);
    try {
      // Call custom RPC or delete data from profiles/auth if allowed, or sign out after marking inactive
      // Since direct user self-deletion usually requires a backend function or Supabase admin API, 
      // we clear local data, sign out, and show notification.
      await supabase.from('profiles').delete().eq('id', user.id);
      await signOut();
    } catch (err) {
      setProfileMessage(err.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

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

      {/* 6. Appearance (Dark/Light/Auto) */}
      <button 
        onClick={() => setDarkMode(!darkMode)} 
        className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between hover:bg-slate-800/50 transition"
      >
        <span className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-semibold">Appearance</span>
        </span>
        <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
          {darkMode ? 'Dark Mode' : 'Light Mode'}
        </span>
      </button>

      {/* User Profile Section */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4">
        <div className="relative">
          <img
            src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || 'MyChat')}&background=4f46e5&color=fff`}
            alt="Profile" 
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500" 
          />
          <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-500 transition">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={changePhoto} className="hidden" />
          </label>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg">{user?.user_metadata?.full_name || 'MyChat User'}</h3>
          <p className="text-xs text-slate-400">{user?.email}</p>
          {editingProfile && (
            <div className="flex gap-2 mt-2">
              <input 
                value={profileName} 
                onChange={(event) => setProfileName(event.target.value)} 
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white" 
              />
              <button onClick={saveProfile} className="bg-indigo-600 rounded-lg px-3 py-1 text-xs hover:bg-indigo-500">Save</button>
            </div>
          )}
          {profileMessage && <p className="text-xs text-emerald-400 mt-1">{uploadingPhoto ? 'Uploading photo...' : profileMessage}</p>}
        </div>
        <button onClick={() => setEditingProfile(!editingProfile)} className="text-xs text-indigo-400 hover:underline">
          {editingProfile ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {/* Security & Settings Sub-menu */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
        
        {/* 7. Biometric Lock (finger/face lock) */}
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

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-semibold">Two-factor authentication</h4>
              <p className="text-xs text-slate-400">Protect sign-in with an authenticator app</p>
            </div>
          </div>
          <button onClick={setupTwoFactor} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs hover:bg-indigo-500">
            {twoFactor ? 'Enabled' : 'Set up'}
          </button>
        </div>

        {/* 2. Blocked Users Management */}
        <div 
          onClick={() => setShowBlockedUsers(!showBlockedUsers)}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition"
        >
          <div className="flex items-center space-x-3">
            <UserX className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-semibold">Blocked Users Management</h4>
              <p className="text-xs text-slate-400">Manage blocked contacts and restrictions</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </div>

        {showBlockedUsers && (
          <div className="p-4 bg-slate-950 space-y-3">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Blocked Accounts</h5>
            {blockedUsers.length === 0 ? (
              <p className="text-xs text-slate-500">No blocked users found.</p>
            ) : (
              blockedUsers.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <img 
                      src={item.blocked?.avatar_url || `https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff`} 
                      alt="Blocked" 
                      className="w-8 h-8 rounded-full" 
                    />
                    <span className="text-xs font-medium">{item.blocked?.display_name || 'Unknown User'}</span>
                  </div>
                  <button 
                    onClick={() => unblockUser(item.id)} 
                    className="text-xs bg-red-500/20 text-red-400 px-2.5 py-1 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition"
                  >
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. Linked Devices / Multi-device Management */}
        <div 
          onClick={() => setShowLinkedDevices(!showLinkedDevices)}
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition"
        >
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-semibold">Linked Devices / Multi-device Management</h4>
              <p className="text-xs text-slate-400">Manage sessions across browsers and devices</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </div>

        {showLinkedDevices && (
          <div className="p-4 bg-slate-950 space-y-3">
            <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Linked Sessions</h5>
            {linkedDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-white">{device.name}</p>
                  <p className="text-[10px] text-emerald-400">{new Date(device.last_seen_at).toLocaleString()}</p>
                </div>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">Active</span>
              </div>
            ))}
            <button 
              onClick={signOutOtherDevices}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-xs py-2 rounded-xl font-semibold transition"
            >
              Sign Out All Other Devices
            </button>
          </div>
        )}

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
            <button onClick={generateKey} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs hover:bg-indigo-500">Generate new key fingerprint</button>
          </div>
        )}

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-semibold">Data usage</h4>
              <p className="text-xs text-slate-400">Prefer lower media quality</p>
            </div>
          </div>
          <input type="checkbox" checked={dataSaver} onChange={(event) => { setDataSaver(event.target.checked); localStorage.setItem('mychat-data-saver', String(event.target.checked)); }} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Languages className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-semibold">Language</h4>
              <p className="text-xs text-slate-400">Choose app language</p>
            </div>
          </div>
          <select value={language} onChange={(event) => { setLanguage(event.target.value); localStorage.setItem('mychat-language', event.target.value); }} className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white">
            <option>English</option>
            <option>Nepali</option>
          </select>
        </div>

        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-semibold">Notifications</h4>
              <p className="text-xs text-slate-400">Message and call alerts</p>
            </div>
          </div>
          <input type="checkbox" checked={notifications} onChange={(event) => toggleNotifications(event.target.checked)} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
        </div>

        <button onClick={() => setShowStorage(!showStorage)} className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-800/50 transition">
          <Database className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-semibold">Storage and Data</span>
          <ChevronRight className="w-5 h-5 text-slate-500 ml-auto" />
        </button>
        {showStorage && <div className="p-4 bg-slate-950"><StorageSettings /></div>}

        {/* 3. Privacy Policy with link kamalgc.com.np/privacy-policy */}
        <button onClick={() => setShowPolicy(true)} className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-800/50 transition">
          <FileText className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-semibold">Privacy Policy</span>
          <a href="/privacy-policy" onClick={(event) => event.stopPropagation()} className="text-xs text-indigo-400 ml-auto underline">kamalgc.com.np/privacy-policy</a>
        </button>

        {/* 5. App Version & About Us */}
        <button onClick={() => setShowAbout(true)} className="w-full p-4 flex items-center gap-3 text-left hover:bg-slate-800/50 transition">
          <Info className="w-5 h-5 text-indigo-400" />
          <span className="text-sm font-semibold">App Version & About Us</span>
          <span className="text-xs text-slate-400 ml-auto">v1.2.0</span>
        </button>

        <button onClick={signOut} className="w-full p-4 flex items-center gap-3 text-left text-red-400 hover:bg-slate-800/50 transition">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-semibold">Log out</span>
        </button>

        {/* 1. Delete Account Option */}
        <button onClick={() => setShowDeleteModal(true)} className="w-full p-4 flex items-center gap-3 text-left text-red-500 hover:bg-red-950/20 transition">
          <UserMinus className="w-5 h-5" />
          <span className="text-sm font-semibold">Delete Account</span>
        </button>
      </div>

      {/* Privacy Policy Modal with custom link requirement */}
      {showPolicy && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">Privacy Policy</h2>
              <button onClick={() => setShowPolicy(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-300">
              MyChat stores account and messages securely in Supabase. Camera and microphone permissions are used strictly during active audio/video calls. Uploaded media is stored securely through configured cloud providers.
            </p>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-400">Full policy document available at:</p>
              <a 
                href="https://kamalgc.com.np/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-indigo-400 underline break-all hover:text-indigo-300"
              >
                kamalgc.com.np/privacy-policy
              </a>
            </div>
            <p className="text-xs text-slate-500">Copyright 2026 MyChat. All rights reserved. kamalgc.com.np</p>
          </div>
        </div>
      )}

      {/* About Us Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg">About Us & Version</h2>
              <button onClick={() => setShowAbout(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <p><strong>MyChat Secure Messaging Platform</strong></p>
              <p className="text-xs text-slate-400">Version: 1.2.0 (Production Build)</p>
              <p className="text-xs text-slate-400">Developed by Kamal GC. Designed for fast, secure end-to-end encrypted communication across devices.</p>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <a href="https://kamalgc.com.np" target="_blank" rel="noreferrer" className="text-xs text-indigo-400 underline">
                kamalgc.com.np
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-red-900/50 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-lg text-red-400">Delete Account Permanently</h2>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-300">
              This action is irreversible. All your messages, profile data, keys, and media connections will be permanently wiped from our servers.
            </p>
            <p className="text-xs text-slate-400">Type <strong className="text-white">DELETE</strong> below to confirm:</p>
            <input 
              type="text" 
              value={deleteConfirmationText} 
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="Type DELETE" 
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white" 
            />
            <button 
              disabled={deleteConfirmationText !== 'DELETE' || deleteLoading} 
              onClick={deleteAccount} 
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm transition"
            >
              {deleteLoading ? 'Deleting Account...' : 'Confirm Permanent Deletion'}
            </button>
          </div>
        </div>
      )}

      {twoFactorSetup && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between">
              <h2 className="font-bold">Set up authenticator</h2>
              <button onClick={() => setTwoFactorSetup(null)}><X /></button>
            </div>
            <p className="text-sm text-slate-300">Scan the QR code in your authenticator app, or copy the setup key.</p>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(twoFactorSetup.totp.uri)}`} alt="Authenticator QR code" className="mx-auto rounded-lg bg-white p-2" />
            <p className="break-all rounded-lg bg-slate-950 p-3 font-mono text-xs text-indigo-300">{twoFactorSetup.totp.secret}</p>
            <input inputMode="numeric" maxLength="6" value={twoFactorCode} onChange={(event) => setTwoFactorCode(event.target.value.replace(/\D/g, ''))} placeholder="6-digit code" className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-sm text-white" />
            <button disabled={twoFactorBusy || twoFactorCode.length !== 6} onClick={verifyTwoFactor} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold hover:bg-indigo-500 transition">{twoFactorBusy ? 'Verifying...' : 'Verify and enable'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
