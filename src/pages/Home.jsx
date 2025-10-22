import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
//import useWindowResize from '../hooks/useWindowResize';
import { useHomeData } from '../hooks/useStrapiData';
import { BlocksRenderer } from '@strapi/blocks-react-renderer';
import PageLayout from '../components/layout/PageLayout';

const Home = () => {
  //const { windowSize, baseUnit } = useWindowResize();
  const { data: response } = useHomeData();
  const homeData = response?.data || null;

  return (
    <>
      <Helmet>
        <title>{homeData?.SEO?.SEO_Title || 'Ramin Tahbaz'}</title>
        <meta 
          name="description" 
          content={homeData?.SEO?.SEO_Description || "Welcome to Ramin's portfolio"} 
        />
        <meta 
          property="og:title" 
          content={homeData?.SEO?.SEO_Title || 'Ramin Tahbaz'} 
        />
        <meta 
          property="og:description" 
          content={homeData?.SEO?.SEO_Description || "Welcome to Ramin's portfolio"} 
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <PageLayout>
        <div
          className="flex flex-col"
          style={{
            //'--base-unit': `${baseUnit}px`,
            //minHeight: `${windowSize.height}px`
          }}
        >
          <div className="mb-[70px] md:mb-[170px]">
            {homeData?.Content ? (
              <div className="prose max-w-xl dark:prose-invert">
                <BlocksRenderer content={homeData.Content} />
              </div>
            ) : (
              <p className="text-[16px] md:text-[16pt] text-gray-900 dark:text-white max-w-xl">
                No content available
              </p>
            )}
          </div>
  
          <nav className="mb-16">
            <div className="flex flex-col space-y-2">
              {homeData?.Menu?.map((menuItem) => (
                <div key={menuItem.id} className="flex items-center text-[16px] md:text-[16pt] text-black dark:text-white">
                  <Link
                    to={`/${menuItem.Link}`}
                    className="hover:text-[#6366f1]"
                  > 
                    {menuItem.Name}
                  </Link>
                </div>
              ))}
            </div>
          </nav>
        </div>
      </PageLayout>
    </>
  );
};

export default Home;