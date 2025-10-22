import { useQuery } from '@tanstack/react-query';

export const useApiData = (queryKey, fetchFn, options = {}) => {
  const { data: response, isLoading, error, refetch } = useQuery({
    queryKey: [queryKey],
    queryFn: fetchFn,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    ...options,
  });

  return {
    data: response?.data || null,
    isLoading,
    error,
    refetch
  };
};