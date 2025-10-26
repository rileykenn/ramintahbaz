import { useEffect, useState } from 'react';
import { supabase } from '../providers/supabaseClient';

export function useExperiencesSupabase() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .order('order_no', { ascending: true });

      if (error) {
        if (!cancelled) setError(error);
        setLoading(false);
        return;
      }

      if (!cancelled) {
        setData(data || []);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
