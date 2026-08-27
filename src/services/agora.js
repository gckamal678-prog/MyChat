import AgoraRTC from 'agora-rtc-sdk-ng';

export const agoraAppId = import.meta.env.VITE_AGORA_APP_ID;
export const isAgoraConfigured = Boolean(agoraAppId);

export function createAgoraClient() {
  if (!isAgoraConfigured) throw new Error('Agora is not configured.');
  return AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
}
