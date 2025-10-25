// If url is absolute (http/https), return it as-is.
// Otherwise (old Strapi-style "/uploads/..."), prefix with your MEDIA_BASE.
const MEDIA_BASE =
  process.env.NEXT_PUBLIC_MEDIA_BASE ||
  process.env.REACT_APP_MEDIA_BASE ||
  '';

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${MEDIA_BASE}${url}`;
}
