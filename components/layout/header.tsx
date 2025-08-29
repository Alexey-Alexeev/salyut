// components/Header.tsx
'use client'

import Link from 'next/link'
import { Search, ShoppingCart, Phone, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useCartStore } from '@/lib/cart-store'
import { useState, useEffect } from 'react'
import { ConsultationDialog } from '../consultation-dialog'

export function Header() {
  const totalItems = useCartStore((state) => state.getTotalItems())
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydration check to prevent server-client mismatch
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const navItems = [
    { href: '/', label: 'Главная' },
    { href: '/catalog', label: 'Каталог' },
    { href: '/services/launching', label: 'Услуги' },
    { href: '/delivery', label: 'Доставка / Самовывоз' },
    { href: '/about', label: 'О нас' },
  ]

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🎆</span>
                </div>
                <span className="font-bold text-xl text-primary">КупитьСалюты</span>
              </Link>

              <nav className="hidden md:flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Кнопка "Консультация" в хедере */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex items-center space-x-1"
                onClick={() => setIsDialogOpen(true)}
                aria-label="Открыть форму консультации"
              >
                <Phone className="h-4 w-4" />
                <span className="text-sm">Консультация</span>
              </Button>

              {/* Кнопка корзины */}
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative" aria-label="Перейти в корзину">
                  <ShoppingCart className="h-4 w-4" />
                  {isHydrated && totalItems > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Мобильное меню */}
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden" aria-label="Открыть меню">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <nav className="flex flex-col space-y-4 mt-8">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-sm font-medium transition-colors hover:text-primary"
                        onClick={() => setIsSheetOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Button
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        setIsSheetOpen(false)
                        setIsDialogOpen(true)
                      }}
                      aria-label="Открыть форму консультации"
                    >
                      <Phone className="h-4 w-4 mr-2" />
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
  )
}