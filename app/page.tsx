import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/product-card'
import { db } from '@/lib/db'
import { categories, products, reviews } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import {VideoReviewCard} from "@/components/video-review-card";
import {ConsultationDialog} from "@/components/consultation-dialog";
import {ConsultationCTA} from "@/components/consultation-cta";

export default async function HomePage() {
  // Загружаем данные из БД с обработкой ошибок
  let categoriesData: any[] = [];
  let popularProducts: any[] = [];
  let videoReviews: any[] = [];

  try {
    [categoriesData, popularProducts] = await Promise.all([
      db.select().from(categories),
      db.select().from(products).where(and(eq(products.is_popular, true), eq(products.is_active, true))).limit(4)
    ]);
  } catch (error) {
    console.error('Error loading categories or products:', error);
  }

  // Отдельно загружаем отзывы
  try {
    videoReviews = await db.select().from(reviews).limit(3);
  } catch (error) {
    console.error('Error loading reviews:', error);
  }

  return (
      <div className="space-y-16">
        {/* Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
                src="../../images/hero-bg.webp"
                alt="Яркие салюты на Новый год, праздничное настроение, вспышки огней"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                placeholder="blur"
                blurDataURL="../../images/hero-bg.webp"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 text-center text-white space-y-6 px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white bg-black/40 p-4 rounded-lg">
              Незабываемые <span className="text-orange-400">салюты</span> для ваших праздников
            </h1>
            <p className="text-lg md:text-xl text-white bg-black/30 p-4 rounded-lg max-w-2xl mx-auto">
              Качественная пиротехника от проверенных производителей. Создайте магию праздника вместе с нами!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600">
                <Link href="/catalog">Смотреть каталог</Link>
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
              <h2 className="text-3xl md:text-4xl font-bold">Наши салюты в действии</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Посмотрите, как выглядит наш товар на реальных праздниках клиентов
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {videoReviews.map((video) => (
                  <VideoReviewCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section с диалогом */}
        <ConsultationCTA />
      </div>
  );
}