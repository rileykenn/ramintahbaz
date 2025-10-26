import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageLayoutWorkSingle from '../components/layout/PageLayoutWorkSingle';
import { useWorkMediaSupabase } from '../hooks/useWorkMediaSupabase.js';
import { createClient } from '@supabase/supabase-js';

/* ---------- ENV helper ---------- */
const env = (k) =>
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[k]) ||
  (typeof process !== 'undefined' && process.env && process.env[k]) ||
  '';

const SUPABASE_URL  = env('VITE_SUPABASE_URL')      || env('REACT_APP_SUPABASE_URL');
const SUPABASE_ANON = env('VITE_SUPABASE_ANON_KEY') || env('REACT_APP_SUPABASE_ANON_KEY');
const DEFAULT_BUCKET = env('VITE_SUPABASE_MEDIA_BUCKET') || env('REACT_APP_SUPABASE_MEDIA_BUCKET') || 'media';

/* Create client only if envs exist so we don't crash */
let supabase = null;
try { if (SUPABASE_URL && SUPABASE_ANON) supabase = createClient(SUPABASE_URL, SUPABASE_ANON); }
catch (e) { console.error('Supabase client init failed:', e); }

/* ----------------- helpers ----------------- */
const isVideo = (m) => {
  const urlBase = (m?.resolvedUrl || m?.file_url || '').toLowerCase().split('?')[0];
  const mime = (m?.mime || m?.file_mime || '').toLowerCase();
  const exts  = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
  const mimes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  if (mime && mimes.includes(mime)) return true;
  return exts.some((ext) => urlBase.endsWith(ext));
};

function extractStoragePath(m) {
  if (m.path) return String(m.path);
  if (m.file_path) return String(m.file_path);
  if (m.storage_path) return String(m.storage_path);
  const raw = m.file_url || m.url || '';
  if (!raw) return '';
  try {
    const u = new URL(raw);
    if (u.pathname.includes('/storage/v1/object/')) {
      const parts = u.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('public');
      if (idx >= 0 && parts[idx + 1]) return parts.slice(idx + 2).join('/');
    }
  } catch {}
  if (!/^https?:\/\//i.test(raw)) return String(raw);
  return '';
}

/* ---------- Masonry (Grid) helpers ---------- */
const ROW = 2;                 // must match auto-rows-[2px]
const IMG_BIAS = 2;            // px
const VID_BIAS = 12;           // px (reserve for native controls invisibly)
const WIDE_THRESHOLD = 1.45;   // span-2 threshold

const hOf = (el) => (el ? el.getBoundingClientRect().height : 0);

/* ---------- Preload dimensions BEFORE render ---------- */
async function loadImageRatio(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1);
    img.onerror = () => resolve(1);
    img.crossOrigin = 'anonymous';
    img.referrerPolicy = 'no-referrer';
    img.src = url;
  });
}

async function loadVideoRatio(url) {
  return new Promise((resolve) => {
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;
    v.onloadedmetadata = () => {
      const r = v.videoWidth && v.videoHeight ? v.videoWidth / v.videoHeight : 1;
      resolve(r || 1);
      v.src = '';
    };
    v.onerror = () => resolve(1);
    v.src = url;
  });
}

export default function Work() {
  const { slug } = useParams();
  const { work, media = [], loading, error } = useWorkMediaSupabase(slug);

  const [resolved, setResolved] = useState([]);          // with resolvedUrl
  const [ratios, setRatios] = useState({});              // key -> number (preloaded)
  const itemRefs = useRef({});
  const observers = useRef({});
  const gridRef = useRef(null);

  const items = useMemo(() => media ?? [], [media]);

  // Resolve storage/public URLs once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!items.length) { setResolved([]); return; }
        const out = await Promise.all(items.map(async (m) => {
          const bucket = m.bucket || m.storage_bucket || DEFAULT_BUCKET;
          const raw = m.file_url || m.url || m.path || '';
          if (/^https?:\/\//i.test(raw) && !raw.includes('/storage/v1/object/')) return { ...m, resolvedUrl: raw };
          const storagePath = extractStoragePath(m);
          if (supabase && bucket && storagePath) {
            const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(storagePath, 3600);
            if (signed?.signedUrl) return { ...m, resolvedUrl: signed.signedUrl };
            const { data: pub } = supabase.storage.from(bucket).getPublicUrl(storagePath);
            if (pub?.publicUrl) return { ...m, resolvedUrl: pub.publicUrl };
          }
          return { ...m, resolvedUrl: raw };
        }));
        if (!cancelled) setResolved(out);
      } catch (e) {
        console.error(e);
        if (!cancelled) setResolved(items.map(m => ({ ...m, resolvedUrl: m.file_url || m.url || m.path || '' })));
      }
    })();
    return () => { cancelled = true; };
  }, [items]);

  // Preload ratios for ALL media before rendering cards
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!resolved.length) { setRatios({}); return; }
      const ratioEntries = await Promise.all(resolved.map(async (m, idx) => {
        const key = `${m.file_id ?? m.id ?? idx}-${m.sort_order ?? idx}`;
        const url = m.resolvedUrl;
        if (!url) return [key, 1];
        const r = isVideo(m) ? await loadVideoRatio(url) : await loadImageRatio(url);
        return [key, r || 1];
      }));
      if (!cancelled) {
        const map = Object.fromEntries(ratioEntries);
        setRatios(map);
      }
    })();
    return () => { cancelled = true; };
  }, [resolved]);

  // span math (account for grid rowGap to avoid dead space)
  const getRowGap = () => {
    if (!gridRef.current) return 0;
    const cs = getComputedStyle(gridRef.current);
    const g = parseFloat(cs.rowGap || '0');
    return Number.isFinite(g) ? g : 0;
  };

  const calcSpan = (wrapEl, isVid) => {
    if (!wrapEl) return 1;
    const box = wrapEl.querySelector('.ratio-box');
    const bias = isVid ? VID_BIAS : IMG_BIAS;
    const h = hOf(box || wrapEl) + bias;
    const gap = getRowGap();
    // Include rowGap in the math so the item height matches exactly with no trailing blank space.
    return Math.ceil((h + gap) / (ROW + gap));
  };

  const reflowSpan = (wrapEl, isVid) => {
    if (!wrapEl) return;
    requestAnimationFrame(() => {
      wrapEl.style.gridRowEnd = `span ${calcSpan(wrapEl, isVid)}`;
    });
  };

  // Clean up observers on unmount
  useEffect(() => {
    return () => {
      Object.values(observers.current).forEach((o) => { if (o?.box) o.box.disconnect(); });
      observers.current = {};
    };
  }, []);

  // Reflow on resize
  useEffect(() => {
    const onR = () => requestAnimationFrame(() => {
      Object.values(itemRefs.current).forEach((el) => {
        const isVid = !!el?.querySelector('video');
        reflowSpan(el, isVid);
      });
    });
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);

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

      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="pt-2 pb-4">
          <h1 className="text-black dark:text-white">{work?.title || 'Ramin Tahbaz'}</h1>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[2px]"
        >
          {resolved.map((m, index) => {
            const key = `${m.file_id ?? m.id ?? index}-${m.sort_order ?? index}`;
            const url = m.resolvedUrl;
            if (!url) return null;

            const ratio = ratios[key];
            if (!ratio) return null; // do not mount until ratio is known (prevents tall placeholders)

            const isVid = isVideo(m);
            const wideClass = ratio >= WIDE_THRESHOLD ? 'lg:col-span-2' : '';

            return (
              <div
                key={key}
                ref={(el) => {
                  itemRefs.current[key] = el || undefined;
                  if (!el) return;
                  reflowSpan(el, isVid);
                  const box = el.querySelector('.ratio-box');
                  if (box) {
                    const ro = new ResizeObserver(() => reflowSpan(el, isVid));
                    ro.observe(box);
                    observers.current[key] = { box: ro };
                  }
                }}
                className={`break-inside-avoid overflow-hidden isolate rounded-xl bg-white/5 dark:bg-[#1c1f26] shadow-lg hover:shadow-xl transition-shadow duration-300 ${wideClass}`}
              >
                <div className="ratio-box relative w-full rounded-xl" style={{ aspectRatio: ratio }}>
                  {isVid ? (
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
                      className="absolute inset-0 w-full h-full rounded-xl object-contain"
                    />
                  ) : (
                    <img
                      src={url}
                      onError={onImgError}
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                      alt={work?.title || 'Work media'}
                      className="absolute inset-0 w-full h-full rounded-xl object-contain"
                      loading={index < 6 ? 'eager' : 'lazy'}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageLayoutWorkSingle>
  );
}
