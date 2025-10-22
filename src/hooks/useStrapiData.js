import { useQuery } from '@tanstack/react-query';
import { strapiService } from '../services/api';

const useStrapiData = (queryKey, fetchFn) => {
  return useQuery({
    queryKey: [queryKey],
    queryFn: fetchFn,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    suspense: false,
    retry: false,
  });
};

export const useHomeData = () => useStrapiData('home', strapiService.getHomePage);
export const useInfoData = () => useStrapiData('info', strapiService.getInfo);
export const useGlobalData = () => useStrapiData('global', strapiService.getGlobalData);
export const useAwardsData = () => useStrapiData('awards', strapiService.getAwards);
export const useWorksData = () => useStrapiData('works', strapiService.getWorks);
export const useSettingsData = () => useStrapiData('setting', strapiService.getSettings);

export const useWorkData = (slug) => {
  const { data: worksData } = useWorksData();
  const work = worksData?.data?.find(work => work.slug === slug);
  return { data: { data: work } };
};

export default useStrapiData;