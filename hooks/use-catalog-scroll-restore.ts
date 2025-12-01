import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

interface UseCatalogScrollRestoreProps {
    currentPage: number;
    filteredProductsCount: number;
    isFiltering: boolean;
    isUpdatingURLRef: React.MutableRefObject<boolean>;
}

/**
 * Хук для управления восстановлением позиции прокрутки при возврате в каталог
 * из карточки товара или при навигации между страницами каталога
 * 
 * ВРЕМЕННО ОТКЛЮЧЕНО: Вся логика скролла закомментирована
 */
export function useCatalogScrollRestore({
    currentPage,
    filteredProductsCount,
    isFiltering,
    isUpdatingURLRef,
}: UseCatalogScrollRestoreProps) {
    const urlSearchParams = useSearchParams();
    const [isRestoringScroll, setIsRestoringScroll] = useState(false);

    // ВРЕМЕННО ОТКЛЮЧЕНО: Вся логика скролла
    // Ref для отслеживания, была ли уже восстановлена позиция прокрутки
    // const scrollRestoredRef = useRef<boolean>(false);

    // Ref для отслеживания предыдущей страницы
    // const previousPageRef = useRef<number>(currentPage);

    // Ref для отслеживания, нужно ли сохранять позицию прокрутки
    // const shouldSaveScrollRef = useRef<boolean>(true);

    // Сохраняем текущий URL каталога в sessionStorage при каждом изменении
    // const lastSavedUrlRef = useRef<string>('');

    // ВРЕМЕННО ОТКЛЮЧЕНО: Отключаем автоматическое восстановление прокрутки браузером
    // useEffect(() => {
    //     if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
    //         window.history.scrollRestoration = 'manual';
    //     }
    // }, []);

    // ВРЕМЕННО ОТКЛЮЧЕНО: Сохраняем текущий URL каталога в sessionStorage при каждом изменении
    // useEffect(() => {
    //     if (typeof window !== 'undefined') {
    //         const timeoutId = setTimeout(() => {
    //             try {
    //                 const searchParams = new URLSearchParams(window.location.search);
    //                 if (!searchParams.has('page') && currentPage > 1) {
    //                     searchParams.set('page', currentPage.toString());
    //                 }
    //                 const queryString = searchParams.toString();
    //                 const currentUrl = `/catalog${queryString ? `?${queryString}` : ''}`;
    //                 if (currentUrl !== lastSavedUrlRef.current) {
    //                     sessionStorage.setItem('catalogReturnUrl', currentUrl);
    //                     lastSavedUrlRef.current = currentUrl;
    //                 }
    //             } catch (error) {
    //                 console.warn('Не удалось сохранить URL каталога в sessionStorage:', error);
    //             }
    //         }, 100);
    //         return () => clearTimeout(timeoutId);
    //     }
    // }, [urlSearchParams.toString(), currentPage]);

    // ВРЕМЕННО ОТКЛЮЧЕНО: Сохраняем позицию прокрутки каталога перед переходом в карточку товара
    // useEffect(() => {
    //     if (typeof window !== 'undefined') {
    //         let scrollTimeout: NodeJS.Timeout;
    //         const handleScroll = () => {
    //             if (!shouldSaveScrollRef.current) {
    //                 return;
    //             }
    //             clearTimeout(scrollTimeout);
    //             scrollTimeout = setTimeout(() => {
    //                 try {
    //                     const scrollY = window.scrollY;
    //                     sessionStorage.setItem('catalogScrollPosition', scrollY.toString());
    //                 } catch (error) {
    //                     console.warn('Не удалось сохранить позицию прокрутки:', error);
    //                 }
    //             }, 150);
    //         };
    //         window.addEventListener('scroll', handleScroll, { passive: true });
    //         const handleBeforeUnload = () => {
    //             if (!shouldSaveScrollRef.current) {
    //                 return;
    //             }
    //             try {
    //                 const scrollY = window.scrollY;
    //                 sessionStorage.setItem('catalogScrollPosition', scrollY.toString());
    //             } catch (error) {
    //                 console.warn('Не удалось сохранить позицию прокрутки:', error);
    //             }
    //         };
    //         window.addEventListener('beforeunload', handleBeforeUnload);
    //         return () => {
    //             window.removeEventListener('scroll', handleScroll);
    //             window.removeEventListener('beforeunload', handleBeforeUnload);
    //             clearTimeout(scrollTimeout);
    //         };
    //     }
    // }, []);

    // ВРЕМЕННО ОТКЛЮЧЕНО: Отслеживаем нажатия кнопки "Назад" браузера
    // useEffect(() => {
    //     const handlePopState = () => {
    //         isUpdatingURLRef.current = false;
    //         const currentPageParam = new URLSearchParams(window.location.search).get('page');
    //         const currentPage = currentPageParam ? parseInt(currentPageParam, 10) : 1;
    //         let savedScrollPosition: string | null = null;
    //         let returnUrl: string | null = null;
    //         try {
    //             savedScrollPosition = sessionStorage.getItem('catalogScrollPosition');
    //             returnUrl = sessionStorage.getItem('catalogReturnUrl');
    //         } catch (error) {
    //             console.warn('Не удалось прочитать данные из sessionStorage:', error);
    //         }
    //         const returnPageParam = returnUrl ? new URLSearchParams(returnUrl.split('?')[1] || '').get('page') : null;
    //         const returnPage = returnPageParam ? parseInt(returnPageParam, 10) : 1;
    //         if (savedScrollPosition) {
    //             if (currentPage < returnPage) {
    //                 try {
    //                     sessionStorage.removeItem('catalogScrollPosition');
    //                     sessionStorage.removeItem('catalogReturnUrl');
    //                 } catch (error) {
    //                     console.warn('Не удалось удалить данные из sessionStorage:', error);
    //                 }
    //                 setTimeout(() => {
    //                     window.scrollTo({ top: 0, behavior: 'smooth' });
    //                 }, 100);
    //             } else {
    //                 setIsRestoringScroll(true);
    //                 scrollRestoredRef.current = false;
    //             }
    //         } else {
    //             if (currentPage < previousPageRef.current) {
    //                 setTimeout(() => {
    //                     window.scrollTo({ top: 0, behavior: 'smooth' });
    //                 }, 100);
    //             }
    //         }
    //         previousPageRef.current = currentPage;
    //     };
    //     window.addEventListener('popstate', handlePopState);
    //     return () => {
    //         window.removeEventListener('popstate', handlePopState);
    //     };
    // }, []);

    // ВРЕМЕННО ОТКЛЮЧЕНО: Восстанавливаем позицию прокрутки при возврате в каталог
    // useEffect(() => {
    //     if (typeof window !== 'undefined' && !scrollRestoredRef.current) {
    //         try {
    //             const disableOnce = sessionStorage.getItem('catalogDisableRestore');
    //             if (disableOnce) {
    //                 sessionStorage.removeItem('catalogDisableRestore');
    //                 scrollRestoredRef.current = true;
    //                 setIsRestoringScroll(false);
    //                 return;
    //             }
    //             const savedScrollPosition = sessionStorage.getItem('catalogScrollPosition');
    //             const returnUrl = sessionStorage.getItem('catalogReturnUrl');
    //             const currentPathname = window.location.pathname.replace(/\/$/, '') || '/';
    //             const isCatalogPage = currentPathname === '/catalog';
    //             if (savedScrollPosition && returnUrl && isCatalogPage) {
    //                 const scrollY = parseInt(savedScrollPosition, 10);
    //                 if (!isNaN(scrollY) && scrollY >= 0) {
    //                     // Вся логика восстановления скролла...
    //                 }
    //             } else {
    //                 setIsRestoringScroll(false);
    //                 const currentPageParam = urlSearchParams.get('page');
    //                 const currentPage = currentPageParam ? parseInt(currentPageParam, 10) : 1;
    //                 if (!savedScrollPosition && isCatalogPage) {
    //                     if (currentPage < previousPageRef.current) {
    //                         setTimeout(() => {
    //                             window.scrollTo({ top: 0, behavior: 'smooth' });
    //                         }, 100);
    //                     }
    //                 }
    //                 if (savedScrollPosition && returnUrl && isCatalogPage) {
    //                     const returnPageParam = returnUrl ? new URLSearchParams(returnUrl.split('?')[1] || '').get('page') : null;
    //                     const returnPage = returnPageParam ? parseInt(returnPageParam, 10) : 1;
    //                     if (currentPage < returnPage) {
    //                         try {
    //                             sessionStorage.removeItem('catalogScrollPosition');
    //                             sessionStorage.removeItem('catalogReturnUrl');
    //                         } catch (error) {
    //                             console.warn('Не удалось удалить данные из sessionStorage:', error);
    //                         }
    //                         setTimeout(() => {
    //                             window.scrollTo({ top: 0, behavior: 'smooth' });
    //                         }, 100);
    //                     }
    //                 }
    //                 if (isCatalogPage) {
    //                     previousPageRef.current = currentPage;
    //                 }
    //             }
    //         } catch (error) {
    //             console.warn('Ошибка при работе с sessionStorage:', error);
    //             setIsRestoringScroll(false);
    //         }
    //     } else {
    //         setIsRestoringScroll(false);
    //     }
    // }, [urlSearchParams.toString(), currentPage, filteredProductsCount, isFiltering]);

    // ВРЕМЕННО ОТКЛЮЧЕНО: Сбрасываем флаг восстановления прокрутки при изменении URL или страницы
    // useEffect(() => {
    //     try {
    //         const savedScrollPosition = sessionStorage.getItem('catalogScrollPosition');
    //         if (!savedScrollPosition) {
    //             scrollRestoredRef.current = false;
    //         }
    //     } catch (error) {
    //         console.warn('Не удалось прочитать данные из sessionStorage:', error);
    //     }
    //     previousPageRef.current = currentPage;
    // }, [urlSearchParams.toString(), currentPage]);

    // ВРЕМЕННО ОТКЛЮЧЕНО: Функция для очистки сохраненной позиции прокрутки
    const clearScrollPosition = useCallback(() => {
        // Вся логика очистки скролла временно отключена
        // if (typeof window !== 'undefined') {
        //     try {
        //         sessionStorage.removeItem('catalogScrollPosition');
        //         sessionStorage.removeItem('catalogReturnUrl');
        //         sessionStorage.setItem('catalogDisableRestore', '1');
        //     } catch (error) {
        //         console.warn('Не удалось обновить данные в sessionStorage:', error);
        //     }
        //     scrollRestoredRef.current = true;
        //     setIsRestoringScroll(false);
        //     previousPageRef.current = currentPage;
        // }
    }, []);

    return {
        isRestoringScroll: false, // Всегда false, так как логика отключена
        clearScrollPosition,
    };
}
