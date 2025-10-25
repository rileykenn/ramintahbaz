import React from 'react';
import { Link } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import { Helmet } from 'react-helmet-async';
import { useWorksSupabase } from '../hooks/useWorksSupabase.js';

const Works = () => {
  const { data: works = [], loading, error } = useWorksSupabase();

  // Supabase rows: id, title, slug, order_no
  const sortedWorks = [...works].sort((a, b) => {
    const aOrder = typeof a.order_no === 'number' ? a.order_no : parseInt(a.order_no ?? 0, 10);
    const bOrder = typeof b.order_no === 'number' ? b.order_no : parseInt(b.order_no ?? 0, 10);
    return aOrder - bOrder || (a.id - b.id);
  });

  return (
    <>
      <Helmet>
        <title>Work</title>
        <meta property="og:title" content="Work" />
        <meta property="og:type" content="website" />
      </Helmet>

      <PageLayout>
        {loading && <p className="text-white/80">Loading…</p>}
        {error && <p className="text-red-400">Failed to load works.</p>}

        {!loading && !error && (
          <>
            <div className="space-y-4">
              {sortedWorks.map((work) => (
                <div key={work.id} className="text-[16px] md:text-[16pt]">
                  <Link
                    to={`/works/${work.slug}`}
                    className="hover:text-[#6366f1] flex items-center text-black dark:text-white"
                  >
                    [ {work.title} ]
                  </Link>
                </div>
              ))}

              {sortedWorks.length === 0 && (
                <p className="text-white/80">No works found.</p>
              )}
            </div>

            <div className="flex items-center text-[16px] md:text-[16pt] text-black dark:text-white mt-16">
              <Link to="/" className="hover:text-[#6366f1]">[ Back ]</Link>
            </div>
          </>
        )}
      </PageLayout>
    </>
  );
};

export default Works;
