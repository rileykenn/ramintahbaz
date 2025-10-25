// src/hooks/useWorkMediaSupabase.js
import { useEffect, useState } from 'react';
import { supabase } from '../providers/supabaseClient.js';

/**
 * Load a single work (by slug) and its media from the view v_work_media.
 * Returns:
 *  - work: { id, title, slug } | null
 *  - media: [{ file_id, file_url, file_name, sort_order }] (sorted)
 *  - loading, error
 */
export function useWorkMediaSupabase(slug) {
  const [work, setWork] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      // 1) find the work by slug
      const { data: works, error: workErr } = await supabase
        .from('works')
        .select('id, title, slug')
        .eq('slug', slug)
        .limit(1);

      if (workErr) {
        if (!cancelled) setError(workErr);
        setLoading(false);
        return;
      }

      const w = works?.[0] ?? null;
      if (!w) {
        if (!cancelled) {
          setWork(null);
          setMedia([]);
          setLoading(false);
        }
        return;
      }
      if (!cancelled) setWork(w);

      // 2) media rows from the view
      const { data: rows, error: mediaErr } = await supabase
        .from('v_work_media')
        .select('work_id, work_slug, file_id, file_url, file_name, sort_order')
        .eq('work_slug', slug)
        .order('sort_order', { ascending: true })
        .order('file_id', { ascending: true });

      if (!cancelled) {
        if (mediaErr) setError(mediaErr);
        setMedia(rows || []);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [slug]);

  return { work, media, loading, error };
}
