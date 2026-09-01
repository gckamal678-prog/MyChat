const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);

export async function uploadToCloudinary(file, resourceType = 'auto') {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary upload is not configured.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Cloudinary upload failed.');
  return response.json();
}

export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  const deleteUrl = import.meta.env.VITE_CLOUDINARY_DELETE_URL;
  if (!publicId || !deleteUrl) return;
  const response = await fetch(deleteUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId, resourceType }),
  });
  if (!response.ok) throw new Error('Cloudinary cleanup failed.');
}
