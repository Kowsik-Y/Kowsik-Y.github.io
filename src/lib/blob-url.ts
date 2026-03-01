/**
 * Converts a private Vercel Blob URL into a proxied `/api/image?url=…` URL
 * so it can be displayed publicly without exposing the blob token.
 *
 * Non-blob URLs (external images, empty strings) are returned as-is.
 */
export function blobDisplayUrl(url: string | null | undefined): string {
  if (!url) return "";
  // Vercel Blob private store URLs contain this hostname pattern
  if (url.includes(".blob.vercel-storage.com")) {
    return `/api/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}
