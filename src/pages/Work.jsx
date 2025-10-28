// src/pages/Work.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageLayoutWorkSingle from '../components/layout/PageLayoutWorkSingle';
import { useWorkMediaSupabase } from '../hooks/useWorkMediaSupabase.js';
import { createClient } from '@supabase/supabase-js';
import Isotope from 'isotope-layout';
import imagesLoaded from 'imagesloaded';

/* ---------- ENV helper ---------- */
const env = (k) =>
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[k]) ||
  (typeof process !== 'undefined' && process.env && process.env[k]) ||
  '';

const SUPABASE_URL  = env('VITE_SUPABASE_URL')      || env('REACT_APP_SUPABASE_URL');
const SUPABASE_ANON = env('VITE_SUPABASE_ANON_KEY') || env('REACT_APP_SUPABASE_ANON_KEY');
const DEFAULT_BUCKET =
  env('VITE_SUPABASE_MEDIA_BUCKET') ||
  env('REACT_APP_SUPABASE_MEDIA_BUCKET') ||
  'media';

let supabase = null;
try { if (SUPABASE_URL && SUPABASE_ANON) supabase = createClient(SUPABASE_URL, SUPABASE_ANON); }
catch (e) { console.error('Supabase client init failed:', e); }

/* ---------- helpers ---------- */
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
  const raw = m.file_url || m.url || m.path || '';
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

/* ---------- CONFIG: which items should be 2-col wide? ----------
   Default: make the SECOND item (index 1) wide. Change as needed.
   Example: const WIDE_INDEXES = [1, 6];  // 2nd and 7th items wide
----------------------------------------------------------------- */
const WIDE_INDEXES = [1];

export default function Work() {
  const { slug } = useParams();
  const { work, media = [], loading, error } = useWorkMediaSupabase(slug);

  const [resolved, setResolved] = useState([]);
  const gridRef = useRef(null);
  const isoRef = useRef(null);

  const items = useMemo(() => media ?? [], [media]);

  /* ---------- Resolve URLs ---------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!items.length) { setResolved([]); return; }
        const out = await Promise.all(items.map(async (m, idx) => {
          const bucket = m.bucket || m.storage_bucket || DEFAULT_BUCKET;
          const raw = m.file_url || m.url || m.path || '';
          const _k = `${m.file_id ?? m.id ?? idx}-${m.sort_order ?? idx}`;

          if (/^https?:\/\//i.test(raw) && !raw.includes('/storage/v1/object/')) {
            return { ...m, resolvedUrl: raw, _k };
          }

          const storagePath = extractStoragePath(m);
          if (supabase && bucket && storagePath) {
            try {
              const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(storagePath, 3600);
              if (signed?.signedUrl) return { ...m, resolvedUrl: signed.signedUrl, _k };
              const { data: pub } = await supabase.storage.from(bucket).getPublicUrl(storagePath);
              if (pub?.publicUrl) return { ...m, resolvedUrl: pub.publicUrl, _k };
            } catch {}
          }
          return { ...m, resolvedUrl: raw, _k };
        }));
        if (!cancelled) setResolved(out);
      } catch (e) {
        console.error(e);
        if (!cancelled) setResolved(items.map((m, idx) => ({
          ...m,
          resolvedUrl: m.file_url || m.url || m.path || '',
          _k: `${m.file_id ?? m.id ?? idx}-${m.sort_order ?? idx}`,
        })));
      }
    })();
    return () => { cancelled = true; };
  }, [items]);

  /* ---------- Init Isotope (NO animations) ---------- */
  useEffect(() => {
    const gridEl = gridRef.current;
    if (!gridEl || !resolved.length) return;

    const relayout = () => { if (isoRef.current) isoRef.current.arrange(); };

    const imgLoad = imagesLoaded(gridEl);
    const onReady = () => {
      if (isoRef.current) { try { isoRef.current.destroy(); } catch {} isoRef.current = null; }

      isoRef.current = new Isotope(gridEl, {
        itemSelector: '.masonry-item',
        percentPosition: true,
        masonry: {
          columnWidth: gridEl.querySelector('.masonry-sizer') || '.masonry-item',
          gutter: 24, // ~ gap-6
        },
        transitionDuration: 0, // no animation
      });
    };

    imgLoad.on('always', onReady);
    window.addEventListener('resize', relayout);

    return () => {
      imgLoad.off('always', onReady);
      window.removeEventListener('resize', relayout);
      if (isoRef.current) { try { isoRef.current.destroy(); } catch {} isoRef.current = null; }
    };
  }, [resolved]);

  const onImgError = (e) => {
    console.error('Image failed:', e.currentTarget?.src);
    e.currentTarget.outerHTML = `<div class="p-4 text-sm text-red-400">Failed to load image</div>`;
    if (isoRef.current) isoRef.current.arrange();
  };
  const onVideoError = (e) => {
    console.error('Video failed:', e.currentTarget?.currentSrc || e.currentTarget?.src);
    if (isoRef.current) isoRef.current.arrange();
  };

  return (
    <PageLayoutWorkSingle>
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

        {/* Masonry container */}
        <div ref={gridRef} className="masonry-grid">
          {/* Sizer controls column count (3 cols ≥640px) */}
          <div className="masonry-sizer" />
          <style>{`
            .masonry-grid, .masonry-item, .masonry-sizer { box-sizing: border-box; }

            /* Mobile: 1 col */
            .masonry-sizer { width: 100%; }
            .masonry-item  { width: 100%; }

            /* ≥640px: 3 cols (gutter = 24px => 2 gutters between 3 items = 48px) */
            @media (min-width: 640px){
              .masonry-sizer { width: calc((100% - 48px) / 3); }
              .masonry-item  { width: calc((100% - 48px) / 3); }

              /* WIDE item spans 2 cols: width*2 + one gutter */
              .masonry-item.wide { width: calc(((100% - 48px) / 3) * 2 + 24px); }
            }
          `}</style>

          {resolved.map((m, index) => {
            const key = m._k || `${index}`;
            const url = m.resolvedUrl;
            if (!url) return null;
            const video = isVideo(m);

            // Make selected items 2-col wide (readable hero)
            const makeWide = WIDE_INDEXES.includes(index);

            return (
              <div key={key} className={`masonry-item mb-6 ${makeWide ? 'wide' : ''}`}>
                {video ? (
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
                    className="block w-full h-auto rounded-xl object-contain align-top"
                    onLoadedMetadata={() => isoRef.current && isoRef.current.arrange()}
                  />
                ) : (
                  <img
                    src={url}
                    onError={onImgError}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    alt={work?.title || 'Work media'}
                    className="block w-full h-auto rounded-xl object-contain align-top"
                    loading={index < 6 ? 'eager' : 'lazy'}
                    onLoad={() => isoRef.current && isoRef.current.arrange()}
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
