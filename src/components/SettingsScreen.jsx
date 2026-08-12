import React, { useState } from 'react';
import { User, Shield, Key, Smartphone, Lock, ChevronRight } from 'lucide-react';

export default function SettingsScreen() {
  const [showKeys, setShowKeys] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  return (
    <div className="p-6 max-w-2xl mx-auto text-white space-y-6">
      <h1 className="text-2xl font-bold">Settings & Security</h1>

      {/* User Profile Section */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-4">
        <img 
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" 
          alt="Profile" 
          className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500" 
        />
        <div>
          <h3 className="font-bold text-lg">Kamal GC</h3>
          <p className="text-xs text-slate-400">Building MyChat PWA with Vite & React</p>
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
              <p className="text-xs text-slate-400">Manage connected devices (PWA)</p>
            </div>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">1 Active</span>
        </div>
      </div>
    </div>
  );
}
