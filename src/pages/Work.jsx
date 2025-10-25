import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageLayoutWorkSingle from '../components/layout/PageLayoutWorkSingle';
import { useWorkMediaSupabase } from '../hooks/useWorkMediaSupabase.js';
import { createClient } from '@supabase/supabase-js';

/* ---------- ENV helper: supports CRA/Craco and Vite ---------- */
const env = (k) =>
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[k]) ||
  (typeof process !== 'undefined' && process.env && process.env[k]) ||
  '';

const SUPABASE_URL  = env('VITE_SUPABASE_URL')      || env('REACT_APP_SUPABASE_URL');
const SUPABASE_ANON = env('VITE_SUPABASE_ANON_KEY') || env('REACT_APP_SUPABASE_ANON_KEY');
const DEFAULT_BUCKET = env('VITE_SUPABASE_MEDIA_BUCKET') || env('REACT_APP_SUPABASE_MEDIA_BUCKET') || 'media';

/* Create client only if envs exist so we don't crash */
let supabase = null;
try {
  if (SUPABASE_URL && SUPABASE_ANON) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
  }
} catch (e) {
  console.error('Supabase client init failed:', e);
}

/* ----------------- helpers ----------------- */
const isVideo = (m) => {
  const urlBase = (m?.resolvedUrl || m?.file_url || '').toLowerCase().split('?')[0];
  const mime = (m?.mime || m?.file_mime || '').toLowerCase();
  const exts  = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
  const mimes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  if (mime && mimes.includes(mime)) return true;
  return exts.some((ext) => urlBase.endsWith(ext));
};

/* Try to get "<path/in/bucket.ext>" from a row */
function extractStoragePath(m) {
  if (m.path) return String(m.path);
  if (m.file_path) return String(m.file_path);
  if (m.storage_path) return String(m.storage_path);

  const raw = m.file_url || m.url || '';
  if (!raw) return '';

  // Already a public Supabase URL?
  try {
    const u = new URL(raw);
    if (u.pathname.includes('/storage/v1/object/')) {
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('public');
      if (idx >= 0 && parts[idx + 1]) {
        // path after bucket
        return parts.slice(idx + 2).join('/');
      }
    }
  } catch { /* not a URL */ }

  // If it looks like "folder/file.jpg"
  if (!/^https?:\/\//i.test(raw)) return String(raw);

  // Absolute non-Supabase URL → not a storage path
  return '';
}

export default function Work() {
  const { slug } = useParams();
  const { work, media = [], loading, error } = useWorkMediaSupabase(slug);

  const [resolved, setResolved] = useState([]);
  const items = useMemo(() => media ?? [], [media]);

  useEffect(() => {
    let cancelled = false;

    async function resolveAll() {
      try {
        if (!items.length) {
          setResolved([]);
          return;
        }

        const out = await Promise.all(items.map(async (m) => {
          // Respect per-item bucket if present
          const bucket = m.bucket || m.storage_bucket || DEFAULT_BUCKET;

          // Keep absolute non-Supabase URLs as-is
          const raw = m.file_url || m.url || m.path || '';
          if (/^https?:\/\//i.test(raw) && !raw.includes('/storage/v1/object/')) {
            return { ...m, resolvedUrl: raw };
          }

          const storagePath = extractStoragePath(m);
          if (supabase && bucket && storagePath) {
            // Try signed URL (private buckets)
            const { data: signed, error: signErr } =
              await supabase.storage.from(bucket).createSignedUrl(storagePath, 60 * 60);

            if (signed?.signedUrl) {
              return { ...m, resolvedUrl: signed.signedUrl };
            }

            // Fallback to public URL (public buckets)
            const { data: pub } = supabase.storage.from(bucket).getPublicUrl(storagePath);
            if (pub?.publicUrl) {
              return { ...m, resolvedUrl: pub.publicUrl, _url_error: signErr?.message };
            }

            console.error('Failed to resolve storage URL', { bucket, storagePath, error: signErr });
            return { ...m, resolvedUrl: raw, _url_error: signErr?.message || 'no-url' };
          }

          // No client or no path → use raw
          return { ...m, resolvedUrl: raw };
        }));

        if (!cancelled) setResolved(out);
      } catch (e) {
        console.error('resolveAll error:', e);
        if (!cancelled) setResolved(items.map(m => ({ ...m, resolvedUrl: m.file_url || m.url || m.path || '' })));
      }
    }

    resolveAll();
    return () => { cancelled = true; };
  }, [items]);

  const onImgError = (e) => {
    console.error('Image failed:', e.currentTarget?.src);
    e.currentTarget.outerHTML = `<div class="p-4 text-sm text-red-400">Failed to load image</div>`;
  };
  const onVideoError = (e) => {
    console.error('Video failed:', e.currentTarget?.currentSrc || e.currentTarget?.src);
  };

  return (
    <PageLayoutWorkSingle>
      {/* Close */}
      <div className="fixed top-5 right-5 md:top-10 md:right-10 z-50">
        <Link to="/works" className="hover:text-[#6366f1] text-black dark:text-white">× Close</Link>
      </div>

      {loading && <p className="text-white/80 px-6">Loading…</p>}
      {error && <p className="text-red-400 px-6">Failed to load media.</p>}
      {!loading && !error && (resolved?.length ?? 0) === 0 && (
        <p className="text-white/70 px-6">No media found for this project.</p>
      )}

      {/* Masonry */}
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="pt-2 pb-4">
          <h1 className="text-black dark:text-white">{work?.title || 'Ramin Tahbaz'}</h1>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
          {resolved.map((m, index) => {
            const url = m.resolvedUrl;
            if (!url) return null;
            const key = `${m.file_id ?? m.id ?? index}-${m.sort_order ?? index}`;

            return (
              <div
                key={key}
                className="mb-6 break-inside-avoid overflow-hidden rounded-xl bg-white/5 dark:bg-[#1c1f26] shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                {isVideo(m) ? (
                  <video
                    src={url}
                    onError={onVideoError}
                    crossOrigin="anonymous"
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-auto object-cover rounded-xl"
                  />
                ) : (
                  <img
                    src={url}
                    onError={onImgError}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    alt={work?.title || 'Work media'}
                    loading="lazy"
                    className="w-full h-auto object-cover rounded-xl"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </PageLayoutWorkSingle>
  );
}
