import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'
import { db } from '@/lib/db'
import { categories } from '@/db/schema'

export async function Footer() {
  // Загружаем категории из БД с обработкой ошибок
  let categoriesData: any[] = [];

  try {
    categoriesData = await db.select().from(categories).limit(5);
  } catch (error) {
    console.error('Error loading categories in footer:', error);
  }
  return (
    <footer className="bg-muted border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">🎆</span>
              </div>
              <span className="font-bold text-xl text-primary">КупитьСалюты</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Качественные фейерверки для незабываемых праздников
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Каталог</h3>
            <ul className="space-y-2 text-sm">
              {categoriesData.length > 0 ? (
                categoriesData.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/catalog?category=${category.slug}`}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                // Fallback на случай если категории не загрузились
                <>
                  <li><Link href="/catalog?category=firecrackers" className="text-muted-foreground hover:text-primary">Петарды</Link></li>
                  <li><Link href="/catalog?category=rockets" className="text-muted-foreground hover:text-primary">Ракеты</Link></li>
                  <li><Link href="/catalog?category=fountains" className="text-muted-foreground hover:text-primary">Фонтаны</Link></li>
                  <li><Link href="/catalog?category=roman-candles" className="text-muted-foreground hover:text-primary">Римские свечи</Link></li>
                  <li><Link href="/catalog?category=sparklers" className="text-muted-foreground hover:text-primary">Бенгальские огни</Link></li>
                </>
              )}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Информация</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">О компании</Link></li>
              <li><Link href="/delivery" className="text-muted-foreground hover:text-primary">Доставка</Link></li>
              <li><Link href="/safety" className="text-muted-foreground hover:text-primary">Безопасность</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Контакты</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+7 (977) 360-20-08</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            ©КупитьСалюты. Все права защищены.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
              Политика конфиденциальности
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
              Пользовательское соглашение
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}