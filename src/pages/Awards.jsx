import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAwardsData } from '../hooks/useStrapiData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AwardItem from '../components/AwardItem';
import ErrorView from '../components/common/ErrorView';
import PageLayout from '../components/layout/PageLayout';

const Awards = () => {
  const { data: response, isLoading, error, refetch } = useAwardsData();
  const awardsData = response?.data || null;

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (error) return <ErrorView message={error.message} onRetry={refetch} />;

  return (
    <>
      <Helmet>
        <title>{awardsData?.SEO?.SEO_Title || 'Awards | Ramin Tahbaz'}</title>
        <meta 
          name="description" 
          content={awardsData?.SEO?.SEO_Description || "Awards and recognitions"} 
        />
        <meta 
          property="og:title" 
          content={awardsData?.SEO?.SEO_Title || 'Awards | Ramin Tahbaz'} 
        />
        <meta 
          property="og:description" 
          content={awardsData?.SEO?.SEO_Description || "Awards and recognitions"} 
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <PageLayout>
        <div className="space-y-3">
          {awardsData?.Awards?.map((award) => (
            <AwardItem
              key={award.id}
              name={award.Name}
            />
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