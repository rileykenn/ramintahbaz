// src/hooks/useHomeDataSupabase.js
import { useEffect, useState } from 'react';
import { supabase } from '../providers/supabaseClient.js';

export function useHomeDataSupabase() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1) homes: take the first row
      const { data: homes, error: homesErr } = await supabase
        .from('homes')
        .select('*')
        .order('id', { ascending: true })
        .limit(1);

      if (homesErr) console.error('homes error', homesErr);
      const home = homes?.[0] ?? null;

      // 2) settings: first row (for SEO)
      const { data: settings, error: settingsErr } = await supabase
        .from('settings')
        .select('*')
        .order('id', { ascending: true })
        .limit(1);

      if (settingsErr) console.error('settings error', settingsErr);
      const s = settings?.[0];

      // Support either nested SEO JSON or flat columns
      const SEO =
        (s && s.SEO) ||
        (s
          ? {
              SEO_Title:
                s.SEO_Title || s.seo_title || 'Ramin Tahbaz',
              SEO_Description:
                s.SEO_Description ||
                s.seo_description ||
                "Welcome to Ramin's portfolio",
            }
          : undefined);

      const result = {
        SEO,
        Content: home?.content ?? home?.Content ?? null,
        Menu: home?.menu ?? home?.Menu ?? [],
      };

      if (!cancelled) setData(result);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { data };
}
