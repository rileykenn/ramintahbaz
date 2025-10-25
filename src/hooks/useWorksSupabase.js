// src/hooks/useWorksSupabase.js
import { useEffect, useState } from 'react';
import { supabase } from '../providers/supabaseClient.js';

export function useWorksSupabase() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: rows, error: err } = await supabase
        .from('works')
        .select('id, title, slug, order_no')
        .order('order_no', { ascending: true })
        .order('id', { ascending: true });

      if (!cancelled) {
        if (err) setError(err);
        setData(rows || []);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
