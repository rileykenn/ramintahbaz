import React from 'react';
import { Link } from 'react-router-dom';
import DrumMachine from '../components/DrumMachine';
import PageLayout from '../components/layout/PageLayout';
import { useHomeData } from '../hooks/useStrapiData';
import { Helmet } from'react-helmet-async';

const Rhythm = () => {
    const { data: response } = useHomeData();
    const homeData = response?.data || null;

    return (
        <>
            <Helmet>
                <title>{'Rhythm'}</title>
                <meta
                    property="og:title"
                    content={'Rhythm'}
                />
                <meta property="og:type" content="website" />
            </Helmet>
            <PageLayout>
                <div className="flex flex-col">
                    <div className="mb-8 text-[16px] md:text-[16pt] text-black dark:text-white">
                        {homeData?.DrumContent}
                    </div>
                    <DrumMachine />

                    <div className="flex items-center text-[16px] md:text-[16pt] text-black dark:text-white mt-16">
                        <Link to="/" className="hover:text-[#6366f1]">[ Back ]</Link>
                    </div>
                </div>
            </PageLayout>
        </>
    );
};

export default Rhythm;