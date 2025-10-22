import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useWorkData } from '../hooks/useStrapiData';
import PageLayoutWorkSingle from '../components/layout/PageLayoutWorkSingle';
import { Helmet } from 'react-helmet-async';

const Work = () => {
  const { slug } = useParams();
  const { data: response } = useWorkData(slug);
  const work = response?.data || null;

  const isVideo = (media) => {
    const videoMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
    if (media.mime && videoMimeTypes.includes(media.mime)) return true;
    if (media.ext && videoExtensions.includes(media.ext.toLowerCase())) return true;
    if (media.url && videoExtensions.some(ext => media.url.toLowerCase().includes(`.${ext}`))) return true;
    return false;
  };

  const renderMedia = (media) => {
    const mediaUrl = `${process.env.REACT_APP_STRAPI_API_URL}${media.url}`;
    const cls = 'block w-full h-auto';

    if (isVideo(media)) {
      return <video src={mediaUrl} controls playsInline preload="metadata" className={cls} />;
    }

    return <img src={mediaUrl} alt={media.name || 'Work media'} loading="lazy" decoding="async" className={cls} />;
  };

  return (
    <>
      <Helmet>
        <title>{work?.SEO?.SEO_Title || work?.Title}</title>
      </Helmet>

      <PageLayoutWorkSingle>
        <div className="fixed top-5 right-5 md:top-10 md:right-10 z-50">
          <Link to="/works" className="hover:text-[#6366f1] text-black dark:text-white">
            × Close
          </Link>
        </div>

        {work && (
          <div className="w-full md:max-w-[1100px] mx-auto md:px-0">
            {/* Masonry with tiny spacing */}
            <div className="columns-1 sm:columns-2 lg:columns-2 gap-2 [column-fill:_balance]">
              {work.WorkMedia?.map((media) => (
                <div key={media.id} className="break-inside-avoid mb-2">
                  {renderMedia(media)}
                </div>
              ))}
            </div>
          </div>
        )}
      </PageLayoutWorkSingle>
    </>
  );
};

export default Work;
