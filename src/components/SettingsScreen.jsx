import React, { useState } from 'react';
import { User, Shield, Key, Smartphone, Moon, Sun, FileText, X, Bell, Database, Palette, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StorageSettings from './StorageScreen';

export default function SettingsScreen({ darkMode, setDarkMode }) {
  const [showKeys, setShowKeys] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [showPolicy, setShowPolicy] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [showStorage, setShowStorage] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <div className="p-6 max-w-2xl mx-auto text-white space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="text-xs text-slate-400">kamalgc.com.np</p>
      <button onClick={() => setDarkMode(!darkMode)} className="w-full p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between"><span className="flex items-center gap-3"><Palette className="w-5 h-5 text-indigo-400" /><span className="text-sm font-semibold">Appearance</span></span><span className="text-xs text-slate-400">{darkMode ? 'Dark' : 'Light'}</span></button>

      {/* User Profile Section */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4">
        <img 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" 
          alt="Profile" 
          className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500" 
        />
        <div>
          <h3 className="font-bold text-lg">{user?.user_metadata?.full_name || 'MyChat User'}</h3>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
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
            onChange={() => setBiometricEnabled(!biometricEnabled)}
            className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" 
          />
        </div>

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
              4b825dc642cb6eb9a060e54bf8d69288fbee49043c8d19793f773400d72049d1
            </p>
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
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">1 Active</span>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3"><Bell className="w-5 h-5 text-indigo-400" /><div><h4 className="text-sm font-semibold">Notifications</h4><p className="text-xs text-slate-400">Message and call alerts</p></div></div>
          <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
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
