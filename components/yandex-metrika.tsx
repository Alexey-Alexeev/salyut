'use client';

import Script from 'next/script';

export default function YandexMetrika() {
  return (
    <>
      <Script
        src="https://mc.yandex.ru/metrika/tag.js"
        strategy="afterInteractive"
        onLoad={() => {
          // @ts-ignore
          window.ym = window.ym || function(){(window.ym.a=window.ym.a||[]).push(arguments)};
          // @ts-ignore
          window.ym.l = 1*new Date();
          // @ts-ignore
          window.ym(104700931, 'init', {
            ssr: true,
            webvisor: true,
            clickmap: true,
            ecommerce: "dataLayer",
            accurateTrackBounce: true,
            trackLinks: true
          });
        }}
      />
      <noscript>
        <div>
          <img 
            src="https://mc.yandex.ru/watch/104700931" 
            style={{position:'absolute', left:'-9999px'}} 
            alt="" 
          />
        </div>
      </noscript>
    </>
  );
}
