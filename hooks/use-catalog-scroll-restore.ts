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
 */
export function useCatalogScrollRestore({
    currentPage,
    filteredProductsCount,
    isFiltering,
    isUpdatingURLRef,
}: UseCatalogScrollRestoreProps) {
    const urlSearchParams = useSearchParams();
    const [isRestoringScroll, setIsRestoringScroll] = useState(false);

    // Ref для отслеживания, была ли уже восстановлена позиция прокрутки
    const scrollRestoredRef = useRef<boolean>(false);

    // Ref для отслеживания предыдущей страницы
    const previousPageRef = useRef<number>(currentPage);

    // Ref для отслеживания, нужно ли сохранять позицию прокрутки
    // Отключаем сохранение сразу после восстановления позиции, чтобы не перезаписывать правильную позицию
    const shouldSaveScrollRef = useRef<boolean>(true);

    // Ref для хранения cleanup функции восстановления прокрутки
    const restoreCleanupRef = useRef<(() => void) | null>(null);

    // Сохраняем текущий URL каталога в sessionStorage при каждом изменении
    // Используем ref для предотвращения бесконечных циклов
    const lastSavedUrlRef = useRef<string>('');

    // Отключаем автоматическое восстановление прокрутки браузером
    useEffect(() => {
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    // Сохраняем текущий URL каталога в sessionStorage при каждом изменении
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Используем небольшую задержку, чтобы дать время router.replace обновить URL
            const timeoutId = setTimeout(() => {
                try {
                    // Используем window.location.search для получения всех параметров
                    const searchParams = new URLSearchParams(window.location.search);

                    // Если в URL нет параметра page, но currentPage > 1, добавляем его
                    if (!searchParams.has('page') && currentPage > 1) {
                        searchParams.set('page', currentPage.toString());
                    }

                    const queryString = searchParams.toString();
                    const currentUrl = `/catalog${queryString ? `?${queryString}` : ''}`;

                    // Сохраняем только если URL изменился
                    if (currentUrl !== lastSavedUrlRef.current) {
                        sessionStorage.setItem('catalogReturnUrl', currentUrl);
                        lastSavedUrlRef.current = currentUrl;
                    }
                } catch (error) {
                    // Игнорируем ошибки sessionStorage (например, QuotaExceededError или блокировка в инкогнито)
                    // Не прерываем выполнение кода, чтобы не влиять на другие компоненты
                    console.warn('Не удалось сохранить URL каталога в sessionStorage:', error);
                }
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [urlSearchParams.toString(), currentPage]);

    // Сохраняем позицию прокрутки каталога перед переходом в карточку товара
    useEffect(() => {
        if (typeof window !== 'undefined') {
            let scrollTimeout: NodeJS.Timeout;

            const handleScroll = () => {
                // Не сохраняем позицию прокрутки сразу после восстановления
                if (!shouldSaveScrollRef.current) {
                    return;
                }

                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    try {
                        const scrollY = window.scrollY;
                        sessionStorage.setItem('catalogScrollPosition', scrollY.toString());
                    } catch (error) {
                        // Игнорируем ошибки sessionStorage
                        console.warn('Не удалось сохранить позицию прокрутки:', error);
                    }
                }, 150);
            };

            // Сохраняем позицию прокрутки с небольшой задержкой (debounce)
            window.addEventListener('scroll', handleScroll, { passive: true });

            // Сохраняем позицию прокрутки перед уходом со страницы
            const handleBeforeUnload = () => {
                if (!shouldSaveScrollRef.current) {
                    return;
                }

                try {
                    const scrollY = window.scrollY;
                    sessionStorage.setItem('catalogScrollPosition', scrollY.toString());
                } catch (error) {
                    // Игнорируем ошибки sessionStorage
                    console.warn('Не удалось сохранить позицию прокрутки:', error);
                }
            };

            window.addEventListener('beforeunload', handleBeforeUnload);

            return () => {
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('beforeunload', handleBeforeUnload);
                clearTimeout(scrollTimeout);
            };
        }
    }, []);

    // Отслеживаем нажатия кнопки "Назад" браузера
    useEffect(() => {
        const handlePopState = () => {
            // Сбрасываем флаг обновления URL, чтобы синхронизация сработала
            isUpdatingURLRef.current = false;

            // Получаем текущую страницу из URL (один раз)
            const currentPageParam = new URLSearchParams(window.location.search).get('page');
            const currentPage = currentPageParam ? parseInt(currentPageParam, 10) : 1;

            // Проверяем, вернулись ли мы в каталог из карточки товара
            let savedScrollPosition: string | null = null;
            let returnUrl: string | null = null;
            try {
                savedScrollPosition = sessionStorage.getItem('catalogScrollPosition');
                returnUrl = sessionStorage.getItem('catalogReturnUrl');
            } catch (error) {
                console.warn('Не удалось прочитать данные из sessionStorage:', error);
            }
            const returnPageParam = returnUrl ? new URLSearchParams(returnUrl.split('?')[1] || '').get('page') : null;
            const returnPage = returnPageParam ? parseInt(returnPageParam, 10) : 1;

            if (savedScrollPosition) {
                // Если текущая страница меньше сохраненной страницы возврата, значит вернулись назад
                // и это не возврат из карточки товара, а возврат между страницами каталога
                if (currentPage < returnPage) {
                    try {
                        sessionStorage.removeItem('catalogScrollPosition');
                        sessionStorage.removeItem('catalogReturnUrl');
                    } catch (error) {
                        console.warn('Не удалось удалить данные из sessionStorage:', error);
                    }
                    setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                } else {
                    // Показываем лоадер при возврате из карточки товара
                    setIsRestoringScroll(true);
                    // Сбрасываем флаг восстановления, чтобы эффект восстановления сработал
                    scrollRestoredRef.current = false;
                }
            } else {
                // Если нет сохраненной позиции, значит это возврат между страницами каталога
                // Если вернулись на предыдущую страницу (меньшую), прокручиваем наверх
                if (currentPage < previousPageRef.current) {
                    setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                }
            }

            // Обновляем предыдущую страницу
            previousPageRef.current = currentPage;
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // isUpdatingURLRef - это ref, не нужно в зависимостях

    // Восстанавливаем позицию прокрутки при возврате в каталог
    useEffect(() => {
        if (typeof window !== 'undefined' && !scrollRestoredRef.current) {
            try {
                // Жестко отключаем восстановление, если только что была пагинация
                const disableOnce = sessionStorage.getItem('catalogDisableRestore');
                if (disableOnce) {
                    sessionStorage.removeItem('catalogDisableRestore');
                    scrollRestoredRef.current = true;
                    setIsRestoringScroll(false);
                    return;
                }

                // Проверяем, вернулись ли мы из карточки товара
                const savedScrollPosition = sessionStorage.getItem('catalogScrollPosition');
                const returnUrl = sessionStorage.getItem('catalogReturnUrl');

                // Нормализуем pathname (убираем слеш в конце)
                const currentPathname = window.location.pathname.replace(/\/$/, '') || '/';
                const isCatalogPage = currentPathname === '/catalog';

                // Если есть сохраненная позиция и мы на странице каталога
                if (savedScrollPosition && returnUrl && isCatalogPage) {
                    const scrollY = parseInt(savedScrollPosition, 10);

                    if (!isNaN(scrollY) && scrollY >= 0) {
                        // Восстанавливаем позицию прокрутки после задержки
                        // чтобы дать время странице отрендериться и данным загрузиться
                        // Используем несколько попыток для надежности
                        let attempts = 0;
                        const maxAttempts = 5;

                        const restoreScroll = () => {
                            attempts++;

                            // Ref для отслеживания активной анимации и возможности её отмены
                            let animationFrameId: number | null = null;
                            let isUserScrolling = false;
                            let lastUserScrollTime = 0;
                            let scrollTimeoutId: NodeJS.Timeout | null = null;
                            let expectedScrollPosition = scrollY;
                            let lastProgrammaticScroll = performance.now();

                            // Отслеживаем пользовательский скролл
                            const handleUserScroll = () => {
                                const now = performance.now();
                                const currentScroll = window.scrollY;
                                
                                // Если прошло меньше 50ms с последней программной прокрутки, это программная прокрутка
                                if (now - lastProgrammaticScroll < 50) {
                                    lastProgrammaticScroll = now;
                                    return;
                                }

                                // Если пользователь скроллит в направлении, отличном от ожидаемого, или слишком быстро
                                const scrollDifference = Math.abs(currentScroll - expectedScrollPosition);
                                if (scrollDifference > 50) {
                                    isUserScrolling = true;
                                    
                                    // Отменяем анимацию
                                    if (animationFrameId !== null) {
                                        cancelAnimationFrame(animationFrameId);
                                        animationFrameId = null;
                                    }
                                    
                                    // Отменяем проверку через setTimeout
                                    if (scrollTimeoutId !== null) {
                                        clearTimeout(scrollTimeoutId);
                                        scrollTimeoutId = null;
                                    }
                                    
                                    // Завершаем восстановление
                                    try {
                                        sessionStorage.removeItem('catalogScrollPosition');
                                    } catch (error) {
                                        console.warn('Не удалось удалить позицию прокрутки:', error);
                                    }
                                    
                                    scrollRestoredRef.current = true;
                                    setIsRestoringScroll(false);
                                    
                                    // Включаем сохранение позиции прокрутки сразу
                                    shouldSaveScrollRef.current = true;
                                    
                                    // Удаляем слушатель
                                    window.removeEventListener('scroll', handleUserScroll);
                                    return;
                                }
                                
                                lastUserScrollTime = now;
                                expectedScrollPosition = currentScroll;
                            };

                            // Добавляем слушатель для отслеживания пользовательского скролла
                            window.addEventListener('scroll', handleUserScroll, { passive: true });

                            // Используем быструю плавную прокрутку через requestAnimationFrame
                            // для более быстрого и плавного восстановления позиции
                            const startScroll = window.scrollY;
                            const distance = scrollY - startScroll;
                            const duration = Math.min(Math.abs(distance) * 0.5, 400); // Максимум 400ms
                            const startTime = performance.now();

                            const animateScroll = (currentTime: number) => {
                                // Проверяем, не начал ли пользователь скроллить
                                if (isUserScrolling) {
                                    return;
                                }

                                const elapsed = currentTime - startTime;
                                const progress = Math.min(elapsed / duration, 1);

                                // Используем easing функцию для более плавной анимации
                                const easeInOutQuad = progress < 0.5
                                    ? 2 * progress * progress
                                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                                const currentScroll = startScroll + distance * easeInOutQuad;
                                window.scrollTo(0, currentScroll);
                                lastProgrammaticScroll = performance.now();
                                expectedScrollPosition = currentScroll;

                                if (progress < 1 && !isUserScrolling) {
                                    animationFrameId = requestAnimationFrame(animateScroll);
                                } else {
                                    animationFrameId = null;
                                }
                            };

                            animationFrameId = requestAnimationFrame(animateScroll);

                            // Проверяем, была ли позиция восстановлена
                            // Задержка для проверки после начала анимации (максимум 400ms)
                            scrollTimeoutId = setTimeout(() => {
                                // Проверяем, не начал ли пользователь скроллить
                                if (isUserScrolling) {
                                    window.removeEventListener('scroll', handleUserScroll);
                                    return;
                                }

                                const currentScroll = window.scrollY;

                                // Если позиция не восстановилась и есть попытки, пробуем еще раз
                                // Увеличиваем допуск для плавной прокрутки (может быть небольшая погрешность)
                                if (Math.abs(currentScroll - scrollY) > 100 && attempts < maxAttempts && !isUserScrolling) {
                                    window.removeEventListener('scroll', handleUserScroll);
                                    // При рекурсивном вызове сохраняем cleanup функцию
                                    const cleanup = restoreScroll();
                                    if (cleanup) {
                                        restoreCleanupRef.current = cleanup.cancel;
                                    }
                                } else {
                                    // Удаляем слушатель
                                    window.removeEventListener('scroll', handleUserScroll);
                                    
                                    // Удаляем сохраненную позицию после восстановления
                                    try {
                                        sessionStorage.removeItem('catalogScrollPosition');
                                    } catch (error) {
                                        console.warn('Не удалось удалить позицию прокрутки:', error);
                                    }
                                    scrollRestoredRef.current = true;
                                    // Скрываем лоадер после восстановления позиции
                                    setIsRestoringScroll(false);

                                    // Включаем сохранение позиции прокрутки через небольшую задержку
                                    // чтобы не перезаписывать правильную позицию сразу после восстановления
                                    setTimeout(() => {
                                        shouldSaveScrollRef.current = true;
                                    }, 500);
                                }
                            }, 450);

                            // Возвращаем cleanup функцию для возможности отмены
                            return {
                                cancel: () => {
                                    if (animationFrameId !== null) {
                                        cancelAnimationFrame(animationFrameId);
                                    }
                                    if (scrollTimeoutId !== null) {
                                        clearTimeout(scrollTimeoutId);
                                    }
                                    window.removeEventListener('scroll', handleUserScroll);
                                }
                            };
                        };

                        // Отключаем сохранение позиции прокрутки во время восстановления
                        shouldSaveScrollRef.current = false;

                        // Первая попытка через 400ms (уменьшена задержка для более быстрого восстановления)
                        // Восстанавливаем только после загрузки данных
                        const restoreTimeout = setTimeout(() => {
                            // Проверяем, что данные загружены и страница отрендерена
                            const checkDataLoaded = () => {
                                const hasData = filteredProductsCount > 0 || !isFiltering;
                                const hasContent = document.body.scrollHeight > window.innerHeight;

                                return hasData && hasContent;
                            };

                            if (checkDataLoaded()) {
                                const cleanup = restoreScroll();
                                if (cleanup) {
                                    restoreCleanupRef.current = cleanup.cancel;
                                }
                            } else {
                                // Если данные еще не загружены, ждем еще
                                const waitForData = setInterval(() => {
                                    if (checkDataLoaded()) {
                                        clearInterval(waitForData);
                                        const cleanup = restoreScroll();
                                        if (cleanup) {
                                            restoreCleanupRef.current = cleanup.cancel;
                                        }
                                    }
                                }, 50); // Уменьшена задержка проверки

                                // Максимальное время ожидания - 2 секунды (уменьшено)
                                setTimeout(() => {
                                    clearInterval(waitForData);
                                    const cleanup = restoreScroll();
                                    if (cleanup) {
                                        restoreCleanupRef.current = cleanup.cancel;
                                    }
                                }, 2000);
                            }
                        }, 400);

                        return () => {
                            clearTimeout(restoreTimeout);
                            if (restoreCleanupRef.current) {
                                restoreCleanupRef.current();
                                restoreCleanupRef.current = null;
                            }
                        };
                    }
                } else {
                    // Скрываем лоадер, если условия не выполнены
                    setIsRestoringScroll(false);

                    // Получаем текущую страницу из URL (один раз)
                    const currentPageParam = urlSearchParams.get('page');
                    const currentPage = currentPageParam ? parseInt(currentPageParam, 10) : 1;

                    // Если нет сохраненной позиции, но мы на странице каталога,
                    // и это возврат назад между страницами, прокручиваем наверх
                    if (!savedScrollPosition && isCatalogPage) {
                        // Если вернулись на предыдущую страницу (меньшую), прокручиваем наверх
                        if (currentPage < previousPageRef.current) {
                            setTimeout(() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }, 100);
                        }
                    }

                    // Проверяем, вернулись ли мы на предыдущую страницу каталога (не из карточки товара)
                    // Если да, очищаем сохраненную позицию прокрутки из карточки товара и прокручиваем наверх
                    if (savedScrollPosition && returnUrl && isCatalogPage) {
                        const returnPageParam = returnUrl ? new URLSearchParams(returnUrl.split('?')[1] || '').get('page') : null;
                        const returnPage = returnPageParam ? parseInt(returnPageParam, 10) : 1;

                        // Если текущая страница меньше сохраненной страницы возврата, значит вернулись назад
                        // и это не возврат из карточки товара, а возврат между страницами каталога
                        if (currentPage < returnPage) {
                            try {
                                sessionStorage.removeItem('catalogScrollPosition');
                                sessionStorage.removeItem('catalogReturnUrl');
                            } catch (error) {
                                console.warn('Не удалось удалить данные из sessionStorage:', error);
                            }
                            setTimeout(() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }, 100);
                        }
                    }

                    // Обновляем предыдущую страницу
                    if (isCatalogPage) {
                        previousPageRef.current = currentPage;
                    }
                }
            } catch (error) {
                // Игнорируем ошибки sessionStorage (например, QuotaExceededError или блокировка в инкогнито)
                // Не прерываем выполнение кода, чтобы не влиять на другие компоненты
                console.warn('Ошибка при работе с sessionStorage:', error);
                setIsRestoringScroll(false);
            }
        } else {
            // Скрываем лоадер, если восстановление уже было
            setIsRestoringScroll(false);
        }
    }, [urlSearchParams.toString(), currentPage, filteredProductsCount, isFiltering]);

    // Сбрасываем флаг восстановления прокрутки при изменении URL или страницы
    // НО только если нет сохраненной позиции прокрутки (т.е. это не возврат из карточки товара)
    useEffect(() => {
        try {
            const savedScrollPosition = sessionStorage.getItem('catalogScrollPosition');
            // Сбрасываем флаг только если нет сохраненной позиции (т.е. это не возврат из карточки товара)
            if (!savedScrollPosition) {
                scrollRestoredRef.current = false;
            }
        } catch (error) {
            console.warn('Не удалось прочитать данные из sessionStorage:', error);
        }

        // Обновляем предыдущую страницу при изменении страницы
        previousPageRef.current = currentPage;
    }, [urlSearchParams.toString(), currentPage]);

    // Функция для очистки сохраненной позиции прокрутки (используется при смене страницы)
    const clearScrollPosition = useCallback(() => {
        if (typeof window !== 'undefined') {
            try {
                sessionStorage.removeItem('catalogScrollPosition');
                // Также очищаем URL возврата, чтобы не определять переход как возврат из карточки
                sessionStorage.removeItem('catalogReturnUrl');
                // Устанавливаем одноразовый флаг, чтобы полностью отключить восстановление на следующий рендер
                sessionStorage.setItem('catalogDisableRestore', '1');
            } catch (error) {
                console.warn('Не удалось обновить данные в sessionStorage:', error);
            }
            scrollRestoredRef.current = true; // Устанавливаем флаг, чтобы эффект восстановления не сработал
            setIsRestoringScroll(false); // Скрываем лоадер восстановления
            // Обновляем предыдущую страницу
            previousPageRef.current = currentPage;
        }
    }, [currentPage]);

    return {
        isRestoringScroll,
        clearScrollPosition,
    };
}
