# MyChat PWA

A high-performance, secure Progressive Web App (PWA) built with React, Vite, and Tailwind CSS. Features include E2EE chat simulation, audio/video calls, communities feed, reels, and offline support via Service Workers.

## Deployment Guides:

### 1. Cloudflare Pages (Recommended)
1. Push your code to your GitHub repository.
2. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
3. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
4. Select your GitHub repository containing the MyChat PWA project.
5. Configure the Build Settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Click **Save and Deploy**.

### 2. Vercel
1. Push your code to your GitHub repository.
2. Log in to [Vercel](https://vercel.com/).
3. Click on **Add New...** > **Project** and import your GitHub repository.
4. Keep the default build settings:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **Deploy**.

### 3. Netlify
1. Push your code to your GitHub repository.
2. Log in to [Netlify](https://app.netlify.com/).
3. Click on **Add new site** > **Import an existing project** and connect to GitHub.
4. Set the build parameters:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy site**.

## Features:
- 📱 PWA Installable (Android & iOS)
- 🔒 End-to-End Encryption (E2EE) Structure
- 💬 Real-time Chat, Voice notes, and Media sharing
- 🎥 TikTok/Instagram style Reels feed
- 📞 Audio & Video Calling simulation
