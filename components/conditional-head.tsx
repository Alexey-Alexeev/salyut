'use client';

import { useEffect, useState } from 'react';


// Компонент для условного canonical URL
export function ConditionalCanonical({ href }: { href: string }) {
  const [isProduction, setIsProduction] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isProd = hostname === 'salutgrad.ru';
    
    setIsProduction(isProd);
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return null;
  }

  // Для Vercel домена - указываем canonical на основной домен
  // Для production домена - указываем на себя
  const canonicalUrl = isProduction ? href : 'https://salutgrad.ru/';
  
  return <link rel="canonical" href={canonicalUrl} />;
}


// Компонент для условных мета-тегов noindex
export function ConditionalNoIndex() {
  const [isProduction, setIsProduction] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isProd = hostname === 'salutgrad.ru';
    
    setIsProduction(isProd);
    setIsLoaded(true);
  }, []);

  if (!isLoaded || isProduction) {
    return null; // НЕ рендерим noindex для production домена
  }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="googlebot" content="noindex, nofollow" />
    </>
  );
}
