import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import { db } from '@/lib/db';
import { categories } from '@/db/schema';
import { filterVisibleCategories } from '@/lib/schema-constants';

export async function Footer() {
  // Загружаем категории из БД с обработкой ошибок
  let categoriesData: any[] = [];

  try {
    categoriesData = await db.select().from(categories);
    // Фильтруем скрытые категории
    categoriesData = filterVisibleCategories(categoriesData);
  } catch (error) {
    console.error('Error loading categories in footer:', error);
  }
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Логотип и описательная часть/бренд — первым на моб и md+ */}
          <div className="space-y-4 order-1 md:order-first">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex size-8 items-center justify-center">
                <Image
                  src="/icons/icon_32.png"
                  alt="СалютГрад"
                  width={32}
                  height={32}
                  className="rounded-full logo-image"
                  priority
                  sizes="32px"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">
                СалютГрад
              </span>
            </Link>
            <p className="text-sm text-gray-700">
              Качественные фейерверки для незабываемых праздников
            </p>
          </div>
          {/* Связаться с нами — только мобильный блок, скрывать на md+ */}
          <div className="space-y-4 order-2 md:hidden">
            <h3 className="font-semibold text-gray-900">Связаться с нами</h3>
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-600 mb-1">Связаться с нами через мессенджеры:</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="https://wa.me/79773602008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition-colors"
                  aria-label="Написать в WhatsApp"
                >
                  <MessageCircle className="size-3" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="https://t.me/+79773602008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors"
                  aria-label="Написать в Telegram"
                >
                  <Send className="size-3" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>
          </div>
          {/* Контакты — только мобильный блок, скрывать на md+ */}
          <div className="space-y-4 order-3 md:hidden">
            <h3 className="font-semibold text-gray-900">Контакты</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <Phone className="size-4 text-orange-600" />
                <a
                  href="tel:+79773602008"
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  +7 (977) 360-20-08
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="size-4 text-orange-600" />
                <a
                  href="mailto:info@salutgrad.ru"
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  info@salutgrad.ru
                </a>
              </div>
            </div>
          </div>
          {/* Связаться с нами + Контакты — только на md+ (один столбец), скрывать на мобиле */}
          <div className="hidden md:block space-y-4 md:order-none">
            <h3 className="font-semibold text-gray-900">Связаться с нами</h3>
            <div className="flex flex-col gap-2 mb-4">
              <p className="text-xs text-gray-600 mb-1">Связаться через мессенджеры:</p>
              <div className="flex gap-2">
                <a
                  href="https://wa.me/79773602008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition-colors"
                  aria-label="Написать в WhatsApp"
                >
                  <MessageCircle className="size-3" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="https://t.me/+79773602008"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors"
                  aria-label="Написать в Telegram"
                >
                  <Send className="size-3" />
                  <span>Telegram</span>
                </a>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900">Контакты</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <Phone className="size-4 text-orange-600" />
                <a
                  href="tel:+79773602008"
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  +7 (977) 360-20-08
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="size-4 text-orange-600" />
                <a
                  href="mailto:info@salutgrad.ru"
                  className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
                >
                  info@salutgrad.ru
                </a>
              </div>
            </div>
          </div>
          {/* Каталог — order-4 мобильный, обычный md+ */}
          <div className="space-y-4 order-4 md:order-none">
            <h3 className="font-semibold text-gray-900">Каталог</h3>
            <ul className="space-y-2 text-sm">
              {(categoriesData.length > 0
                ? categoriesData
                : filterVisibleCategories([
                  { slug: 'firecrackers', name: 'Петарды' },
                  { slug: 'rockets', name: 'Ракеты' },
                  { slug: 'fountains', name: 'Фонтаны' },
                  { slug: 'roman-candles', name: 'Римские свечи' },
                  { slug: 'sparklers', name: 'Бенгальские огни' },
                ])
              ).map(cat => (
                <li key={cat.slug}>
                  <Link
                    href={`/catalog?category=${cat.slug}`}
                    className="text-gray-700 hover:text-orange-600"
                    aria-label={`Перейти к категории ${cat.name}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* Информация — order-5 мобильный, обычный md+ */}
          <div className="space-y-4 order-5 md:order-none">
            <h3 className="font-semibold text-gray-900">Информация</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/services/launching"
                  className="text-gray-700 hover:text-orange-600"
                >
                  Организация запуска салютов
                </Link>
              </li>
              <li>
                <Link
                  href="/delivery"
                  className="text-gray-700 hover:text-orange-600"
                >
                  Доставка и самовывоз
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-orange-600"
                >
                  О компании
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t pt-8 md:flex-row">
          <p className="text-sm text-gray-700">
            ©СалютГрад. Все права защищены.
          </p>
          <div className="mt-4 flex items-center space-x-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-sm text-gray-700 hover:text-orange-600"
            >
              Политика конфиденциальности
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-700 hover:text-orange-600"
            >
              Пользовательское соглашение
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
