import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { db } from '@/lib/db';
import { categories } from '@/db/schema';

export async function Footer() {
  // Загружаем категории из БД с обработкой ошибок
  let categoriesData: any[] = [];

  try {
    categoriesData = await db.select().from(categories).limit(5);
  } catch (error) {
    console.error('Error loading categories in footer:', error);
  }
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                <span className="text-sm font-bold text-white">🎆</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                СалютГрад
              </span>
            </Link>
            <p className="text-sm text-gray-700">
              Качественные фейерверки для незабываемых праздников
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Каталог</h3>
            <ul className="space-y-2 text-sm">
              {(categoriesData.length > 0
                ? categoriesData
                : [
                  { slug: 'firecrackers', name: 'Петарды' },
                  { slug: 'rockets', name: 'Ракеты' },
                  { slug: 'fountains', name: 'Фонтаны' },
                  { slug: 'roman-candles', name: 'Римские свечи' },
                  { slug: 'sparklers', name: 'Бенгальские огни' },
                ]
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

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Информация</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/services/launching"
                  className="text-gray-700 hover:text-orange-600"
                >
                  Услуги
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

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Контакты</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <Phone className="size-4" />
                <span>+7 (977) 360-20-08</span>
              </div>
            </div>
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
