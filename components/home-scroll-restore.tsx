'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function HomeScrollRestore() {
    const pathname = usePathname();
    const scrollRestoredRef = useRef<boolean>(false);
    const shouldSaveScrollRef = useRef<boolean>(true);
    const [isRestoringScroll, setIsRestoringScroll] = useState(false);

    // ВРЕМЕННО ОТКЛЮЧЕНО: Отключаем автоматическое восстановление прокрутки браузером
    // useEffect(() => {
    //     if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    //         window.history.scrollRestoration = 'manual';
    //     }
    // }, []);

    // ВРЕМЕННО ОТКЛЮЧЕНО: Сохраняем позицию прокрутки главной страницы
    // useEffect(() => {
    //     if (typeof window !== 'undefined' && pathname === '/') {
    //         let scrollTimeout: NodeJS.Timeout;
    //         
    //         const handleScroll = () => {
    //             if (!shouldSaveScrollRef.current) {
    //                 return;
    //             }
    //             
    //             clearTimeout(scrollTimeout);
    //             scrollTimeout = setTimeout(() => {
    //                 const scrollY = window.scrollY;
    //                 sessionStorage.setItem('homeScrollPosition', scrollY.toString());
    //             }, 150);
    //         };

    //         window.addEventListener('scroll', handleScroll, { passive: true });

    //         const handleBeforeUnload = () => {
    //             if (!shouldSaveScrollRef.current) {
    //                 return;
    //             }
    //             
    //             const scrollY = window.scrollY;
    //             sessionStorage.setItem('homeScrollPosition', scrollY.toString());
    //         };

    //         window.addEventListener('beforeunload', handleBeforeUnload);

    //         return () => {
    //             window.removeEventListener('scroll', handleScroll);
    //             window.removeEventListener('beforeunload', handleBeforeUnload);
    //             clearTimeout(scrollTimeout);
    //         };
    //     }
    // }, [pathname]);

    // ВРЕМЕННО ОТКЛЮЧЕНО: Отслеживаем нажатия кнопки "Назад" браузера
    // useEffect(() => {
    //     const handlePopState = () => {
    //         const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');
    //         if (savedScrollPosition) {
    //             setIsRestoringScroll(true);
    //             scrollRestoredRef.current = false;
    //         }
    //     };

    //     window.addEventListener('popstate', handlePopState);
    //     return () => {
    //         window.removeEventListener('popstate', handlePopState);
    //     };
    // }, []);

    // ВРЕМЕННО ОТКЛЮЧЕНО: Восстанавливаем позицию прокрутки при возврате на главную страницу
    // useEffect(() => {
    //     if (typeof window !== 'undefined' && pathname === '/' && !scrollRestoredRef.current) {
    //         const savedScrollPosition = sessionStorage.getItem('homeScrollPosition');
    //         const returnUrl = sessionStorage.getItem('homeReturnUrl');
    //         
    //         if (savedScrollPosition && returnUrl) {
    //             const scrollY = parseInt(savedScrollPosition, 10);
    //             
    //             if (!isNaN(scrollY) && scrollY >= 0) {
    //                 shouldSaveScrollRef.current = false;
    //                 
    //                 const restoreScroll = () => {
    //                     // Мгновенная прокрутка без анимации для главной страницы
    //                     window.scrollTo(0, scrollY);
    //                     
    //                     setTimeout(() => {
    //                         sessionStorage.removeItem('homeScrollPosition');
    //                         scrollRestoredRef.current = true;
    //                         setIsRestoringScroll(false);
    //                         
    //                         setTimeout(() => {
    //                             shouldSaveScrollRef.current = true;
    //                         }, 500);
    //                     }, 100);
    //                 };
    //                 
    //                 const restoreTimeout = setTimeout(() => {
    //                     const checkDataLoaded = () => {
    //                         const hasContent = document.body.scrollHeight > window.innerHeight;
    //                         return hasContent;
    //                     };
    //                     
    //                     if (checkDataLoaded()) {
    //                         restoreScroll();
    //                     } else {
    //                         const waitForData = setInterval(() => {
    //                             if (checkDataLoaded()) {
    //                                 clearInterval(waitForData);
    //                                 restoreScroll();
    //                             }
    //                         }, 50);
    //                         
    //                         setTimeout(() => {
    //                             clearInterval(waitForData);
    //                             restoreScroll();
    //                         }, 2000);
    //                     }
    //                 }, 400);

    //                 return () => clearTimeout(restoreTimeout);
    //             }
    //         } else {
    //             setIsRestoringScroll(false);
    //         }
    //     } else if (pathname === '/') {
    //         setIsRestoringScroll(false);
    //     }
    // }, [pathname]);

    // ВРЕМЕННО ОТКЛЮЧЕНО: Лоадер при возврате из карточки товара
    // if (isRestoringScroll) {
    //     return (
    //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
    //             <div className="flex flex-col items-center gap-4">
    //                 <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600"></div>
    //                 <p className="text-sm font-medium text-gray-700">Загружаем страницу...</p>
    //             </div>
    //         </div>
    //     );
    // }

    return null;
}

