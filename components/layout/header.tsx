// components/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, Phone, Shield, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { useCartStore } from '@/lib/cart-store';

import { ConsultationDialog } from '../consultation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  const totalItems = useCartStore(state => state.getTotalItems());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const { role } = useAuth();

  // Hydration check to prevent server-client mismatch
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const navItems = [
    { href: '/', label: 'Главная' },
    { href: '/catalog', label: 'Каталог' },
    { href: '/services/launching', label: 'Услуги' },
    { href: '/delivery', label: 'Доставка / Самовывоз' },
    { href: '/about', label: 'О нас' },
  ];

  return (
    <>
      <header className="supports-[backdrop-filter]:bg-background/60 bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex size-8 items-center justify-center">
                  <Image
                    src="/icons/icon_32.png"
                    alt="СалютГрад"
                    width={32}
                    height={32}
                    className="rounded-full"
                    priority
                  />
                </div>
                <span className="text-primary text-xl font-bold">
                  СалютГрад
                </span>
              </Link>

              <nav className="hidden items-center space-x-6 md:flex">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hover:text-primary text-sm font-medium transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                {role === 'admin' && (
                  <Link
                    href="/admin"
                    className="hover:text-primary flex items-center text-sm font-medium transition-colors"
                  >
                    <Shield className="mr-1 size-4" />
                    Админ
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Кнопка "Консультация" в хедере */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden items-center space-x-1 md:flex"
                onClick={() => setIsDialogOpen(true)}
                aria-label="Открыть форму консультации"
              >
                <Phone className="size-4" />
                <span className="text-sm">Консультация</span>
              </Button>

              {/* Кнопка корзины */}
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative"
                  aria-label="Перейти в корзину"
                >
                  <ShoppingCart className="size-4" />
                  {isHydrated && totalItems > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full p-0 text-xs"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Мобильное меню */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden"
                    aria-label="Открыть меню"
                  >
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <nav className="mt-8 flex flex-col space-y-4">
                    {navItems.map(item => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="hover:text-primary text-sm font-medium transition-colors"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    {role === 'admin' && (
                      <Link
                        href="/admin"
                        className="hover:text-primary flex items-center text-sm font-medium transition-colors"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        <Shield className="mr-2 size-4" />
                        Админ-панель
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        setIsSheetOpen(false);
                        setIsDialogOpen(true);
                      }}
                      aria-label="Открыть форму консультации"
                    >
                      <Phone className="mr-2 size-4" />
                      Консультация
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Единый диалог для всей страницы */}
      <ConsultationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
}
