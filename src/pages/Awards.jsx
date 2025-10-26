import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabase } from '../providers/supabaseClient';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AwardItem from '../components/AwardItem';
import ErrorView from '../components/common/ErrorView';
import PageLayout from '../components/layout/PageLayout';

const Awards = () => {
  const [rows, setRows] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('awards_display')
        .select('id, award_year, line')
        .order('award_year', { ascending: false })
        .order('line', { ascending: true });

      if (error) {
        if (!cancelled) { setErr(error); setLoading(false); }
        return;
      }
      if (!cancelled) { setRows(data || []); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  const grouped = useMemo(() => {
    const byYear = new Map();
    for (const r of rows) {
      if (!byYear.has(r.award_year)) byYear.set(r.award_year, []);
      byYear.get(r.award_year).push(r);
    }
    return Array.from(byYear.entries())
      .sort((a, b) => b[0] - a[0]); // desc by year
  }, [rows]);

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (err) return <ErrorView message={err.message} onRetry={() => window.location.reload()} />;

  return (
    <>
      <Helmet>
        <title>Awards | Ramin Tahbaz</title>
        <meta name="description" content="Awards and recognitions" />
        <meta property="og:title" content="Awards | Ramin Tahbaz" />
        <meta property="og:description" content="Awards and recognitions" />
        <meta property="og:type" content="website" />
      </Helmet>

      <PageLayout>
        <div className="space-y-10">
          {grouped.map(([year, items]) => (
            <section key={year} className="space-y-3">
              <h2 className="text-xl md:text-2xl font-semibold text-black dark:text-white">
                {year}
              </h2>
              <div className="space-y-2">
                {items.map((it) => (
                  <AwardItem key={it.id} name={it.line} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="flex items-center text-[16px] md:text-[16pt] text-black dark:text-white mt-16">
          <Link to="/about" className="hover:text-[#6366f1]">[ Back ]</Link>
        </div>
      </PageLayout>
    </>
  );
};

export default Awards;
