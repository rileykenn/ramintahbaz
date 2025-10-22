import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import About from './pages/About';
import Awards from './pages/Awards';
import Works from './pages/Works';
import Work from './pages/Work';
import Rhythm from './pages/Rhythm';
import { strapiService } from './services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});

// Prefetch all data
queryClient.prefetchQuery({
  queryKey: ['home'],
  queryFn: strapiService.getHomePage,
});
queryClient.prefetchQuery({
  queryKey: ['info'],
  queryFn: strapiService.getInfo,
});
queryClient.prefetchQuery({
  queryKey: ['awards'],
  queryFn: strapiService.getAwards,
});
queryClient.prefetchQuery({
  queryKey: ['works'],
  queryFn: strapiService.getWorks,
});
queryClient.prefetchQuery({
  queryKey: ['setting'],
  queryFn: strapiService.getSettings,
});

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/awards" element={<Awards />} />
              <Route path="/works" element={<Works />} />
              <Route path="/works/:slug" element={<Work />} />
              <Route path="/rhythm" element={<Rhythm />} />
            </Routes>
          </Suspense>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;