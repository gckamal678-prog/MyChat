import { supabase } from './supabase';

const storageKey = (userId) => `mychat-e2ee-keypair-${userId}`;
const encode = (bytes) => btoa(String.fromCharCode(...bytes));
const decode = (value) => Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

async function getIdentity(userId) {
  const stored = localStorage.getItem(storageKey(userId));
  if (stored) {
    const parsed = JSON.parse(stored);
    return {
      privateKey: await crypto.subtle.importKey('jwk', parsed.privateKey, { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']),
      publicKey: await crypto.subtle.importKey('jwk', parsed.publicKey, { name: 'ECDH', namedCurve: 'P-256' }, true, []),
      publicJwk: parsed.publicKey,
    };
  }
  const pair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey']);
  const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
  const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey);
  localStorage.setItem(storageKey(userId), JSON.stringify({ publicKey: publicJwk, privateKey: privateJwk }));
  return { privateKey: pair.privateKey, publicKey: pair.publicKey, publicJwk };
}

export async function ensureE2EEIdentity(userId) {
  const identity = await getIdentity(userId);
  await supabase.from('user_keys').upsert({ user_id: userId, public_key: identity.publicJwk }, { onConflict: 'user_id' });
  return identity;
}

async function sharedKey(privateKey, peerJwk) {
  const peer = await crypto.subtle.importKey('jwk', peerJwk, { name: 'ECDH', namedCurve: 'P-256' }, true, []);
  return crypto.subtle.deriveKey({ name: 'ECDH', public: peer }, privateKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function encryptMessage(userId, text, recipientKey) {
  const identity = await ensureE2EEIdentity(userId);
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, await sharedKey(identity.privateKey, recipientKey), new TextEncoder().encode(text));
  return { encrypted_content: encode(new Uint8Array(cipher)), nonce: encode(nonce), sender_public_key: identity.publicJwk, recipient_public_key: recipientKey };
}

export async function decryptMessage(userId, message) {
  if (!message.encrypted_content) return message.content;
  const identity = await ensureE2EEIdentity(userId);
  const peerKey = message.user_id === userId ? message.recipient_public_key : message.sender_public_key;
  if (!peerKey) return '[Unable to decrypt message]';
  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(message.nonce) }, await sharedKey(identity.privateKey, peerKey), decode(message.encrypted_content));
    return new TextDecoder().decode(plain);
  } catch {
    return '[Unable to decrypt message]';
  }
}
