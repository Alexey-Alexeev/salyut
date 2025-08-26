import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/product-card'
import { db } from '@/lib/db'
import { categories, products, reviews } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export default async function HomePage() {
  // Загружаем данные из БД с обработкой ошибок
  let categoriesData: any[] = []
  let popularProducts: any[] = []
  let videoReviews: any[] = []

  try {
    [categoriesData, popularProducts] = await Promise.all([
      db.select().from(categories),
      db.select().from(products).where(and(eq(products.is_popular, true), eq(products.is_active, true))).limit(4)
    ])
  } catch (error) {
    console.error('Error loading categories or products:', error)
  }

  // Отдельно загружаем отзывы, так как таблица может не существовать
  try {
    videoReviews = await db.select().from(reviews).where(eq(reviews.is_approved, true)).orderBy(desc(reviews.sort_order)).limit(3)
  } catch (error) {
    console.error('Error loading reviews:', error)
    // Fallback данные для отзывов
    videoReviews = [
      {
        id: '1',
        customer_name: 'Алексей М.',
        video_url: 'https://images.pexels.com/photos/1387178/pexels-photo-1387178.jpeg?auto=compress&cs=tinysrgb&w=600'
      },
      {
        id: '2', 
        customer_name: 'Марина К.',
        video_url: 'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=600'
      },
      {
        id: '3',
        customer_name: 'Дмитрий Л.',
        video_url: 'https://images.pexels.com/photos/1387172/pexels-photo-1387172.jpeg?auto=compress&cs=tinysrgb&w=600'
      }
    ]
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Fireworks background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 text-center text-white space-y-6 px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Незабываемые <span className="text-orange-400">фейерверки</span> для ваших праздников
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
            Качественная пиротехника от проверенных производителей. Создайте магию праздника вместе с нами!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
              <Link href="/catalog">Смотреть каталог</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
              <Link href="#consultation">Получить консультацию</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Категории товаров</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Выберите подходящую категорию фейерверков для вашего мероприятия
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {categoriesData.map((category) => (
            <Link key={category.id} href={`/catalog?category=${category.slug}`}>
              <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer">
                <div className="aspect-square relative">
                  <Image
                    src={category.image || 'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=400'}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white font-semibold text-center text-sm md:text-base px-2">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Популярные товары</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Самые востребованные фейерверки от наших покупателей
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="outline" size="lg">
            <Link href="/catalog">Смотреть все товары</Link>
          </Button>
        </div>
      </section>

      {/* Video Reviews */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Наши фейерверки в действии</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Посмотрите, как выглядят наши фейерверки на реальных праздниках наших клиентов
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videoReviews.map((video) => (
              <Card key={video.id} className="overflow-hidden group cursor-pointer">
                <div className="aspect-video relative">
                  <Image
                    src={video.video_url || 'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=600'}
                    alt={video.customer_name}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Отзыв от {video.customer_name}</h3>
                  <p className="text-sm text-muted-foreground">Видео отзыв</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="consultation" className="container mx-auto px-4">
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="p-8 md:p-12 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Нужна помощь в выборе?
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Наши эксперты помогут подобрать идеальные фейерверки для вашего мероприятия
            </p>
            <Button size="lg" variant="secondary">
              Получить бесплатную консультацию
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}