import React from 'react';

export default function PrivacyPolicy() {
  return <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-200">
    <article className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold text-white">MyChat Privacy Policy</h1>
      <p className="text-sm text-slate-400">Last updated: September 1, 2026</p>
      <p>MyChat stores your account profile and encrypted messages to provide the service. Message content is encrypted on your device before it is sent to our database.</p>
      <h2 className="text-xl font-semibold text-white">Data and permissions</h2>
      <p>Camera and microphone access is used only for active calls. Optional media uploads are stored with Cloudinary. We do not sell personal information.</p>
      <h2 className="text-xl font-semibold text-white">Your choices</h2>
      <p>You may manage notifications, linked sessions, and delete your account from Settings. Contact us at kamalgc.com.np for privacy questions.</p>
      <a href="/" className="inline-block text-indigo-400 underline">Return to MyChat</a>
    </article>
  </main>;
}
