import { PartyPopper } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ProductCard } from '@/components/product-card'
import { db } from '@/lib/db'
import { categories, products, reviews } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { VideoReviewCard } from "@/components/video-review-card";
import { ConsultationCTA } from "@/components/consultation-cta";

export default async function HomePage() {
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

  try {
    videoReviews = await db.select().from(reviews).limit(3);
  } catch (error) {
    console.error('Error loading reviews:', error);
  }

  return (
    <div className="space-y-8">

      {/* Hero Section */}
      <section className="relative flex items-center justify-center overflow-hidden pt-12 pb-12 sm:pt-16 sm:pb-16 min-h-[50vh] md:min-h-[70vh]">
        <div className="absolute inset-0 z-0">
          <Image
            src="../../images/hero-bg.webp"
            alt=""
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="../../images/hero-bg.webp"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 text-center space-y-4 px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white bg-black/40 p-4 rounded-lg">
            Незабываемые <span className="text-orange-400">салюты</span> для ваших праздников
          </h1>

          <p className="text-lg md:text-xl text-white bg-black/30 p-4 rounded-lg max-w-2xl mx-auto">
            Качественная пиротехника от проверенных производителей. Создайте магию праздника вместе с нами!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Button aria-label="Смотреть каталог" asChild size="lg" className="bg-orange-700 text-white shadow-lg hover:bg-orange-800">
              <Link href="/catalog">Смотреть каталог</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Discount Promotion Section */}
      <section className="w-full">
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-none">
          <CardContent className="container mx-auto px-4 py-6 md:py-12 text-center space-y-6">
            <h2 className="text-2xl md:text-4xl font-bold flex items-center justify-center gap-2">
              <PartyPopper className="inline-block mr-2 animate-bounce text-yellow-200" size={32} />
              Выгодные скидки при покупке!
            </h2>
            <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
              Чем больше заказ, тем больше экономия — скидки применяются автоматически
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="bg-white/20 backdrop-blur border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-yellow-300 mb-2">5%</div>
                  <div className="text-lg font-semibold mb-1">скидка</div>
                  <div className="text-sm text-white/90">при заказе от 7 000 ₽</div>
                </CardContent>
              </Card>
              <Card className="bg-white/20 backdrop-blur border-white/20">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-yellow-300 mb-2">10%</div>
                  <div className="text-lg font-semibold mb-1">скидка</div>
                  <div className="text-sm text-white/90">при заказе от 15 000 ₽</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Delivery & Pickup Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Доставка и самовывоз</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Доставка к двери или самовывоз из пункта выдачи.{' '}
            <span className="bg-red-700 text-white font-semibold px-2 py-1 rounded whitespace-nowrap">
              Только Москва и Московская область
            </span>
          </p>
        </div>

        <Card className="max-w-4xl mx-auto p-6 md:p-8 bg-gradient-to-br from-orange-50 to-green-50 border border-orange-300 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
            <div className="flex flex-col items-center text-center max-w-sm">
              <div className="text-6xl mb-2">🚚</div>
              <h3 className="font-semibold text-lg mb-2">Доставка</h3>
              <p className="text-sm text-gray-800">
                Доставка по Москве и Московской области в течение 1–3 дней. Время согласовывается с менеджером.
              </p>
            </div>

            <div className="flex flex-col items-center text-center max-w-sm">
              <div className="text-6xl mb-2">🏪</div>
              <h3 className="font-semibold text-lg mb-2">Самовывоз</h3>
              <p className="text-sm text-gray-800">
                Самовывоз возможен из пункта выдачи в Балашихе. Заказ будет готов к согласованному времени.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              asChild
              aria-label="Подробнее о доставке и самовывозе"
              size="lg"
              className="w-full max-w-xs sm:w-auto bg-orange-700 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-800 transition-colors"
            >
              <Link href="/delivery">Подробнее о доставке и самовывозе</Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 bg-gray-50 py-12">
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
                    alt="" // decorative
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
          <Button asChild aria-label="Смотреть все товары" variant="outline" size="lg">
            <Link href="/catalog">Смотреть все товары</Link>
          </Button>
        </div>
      </section>

      {/* Professional Launch Service */}
      <section className="w-full py-12">
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-none">
          <CardContent className="container mx-auto px-4 py-8 md:py-16">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col justify-center space-y-8 text-center">
                  <div className="text-6xl">🎆</div>
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Профессиональный запуск салютов
                  </h2>
                  <p className="text-lg text-white/90">
                    Доверьте запуск профессионалам! Мы обеспечим полную безопасность, соблюдение всех норм и незабываемое шоу. <strong>Не рискуйте безопасностью — оставьте всё профессионалам!</strong>
                  </p>
                </div>
                <div className="flex flex-col justify-center space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <Card className="bg-white/20 backdrop-blur border-white/20">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="text-2xl">🛡️</div>
                        <div className="text-left">
                          <h3 className="font-semibold text-lg">Безопасность и опыт</h3>
                          <p className="text-sm text-white/90">Опытные пиротехники с соблюдением всех мер безопасности</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/20 backdrop-blur border-white/20">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="text-2xl">💥</div>
                        <div className="text-left">
                          <h3 className="font-semibold text-lg">Профессиональный подход</h3>
                          <p className="text-sm text-white/90">Качественное шоу по высшему уровню</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/20 backdrop-blur border-white/20">
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="text-2xl">👥</div>
                        <div className="text-left">
                          <h3 className="font-semibold text-lg">Много довольных клиентов</h3>
                          <p className="text-sm text-white/90">Клиенты, которые много раз сказали нам спасибо</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              <div className="flex justify-center pt-8">

                <Button asChild aria-label="Подробнее об услуге" size="lg"
                  variant="secondary"
                  className="w-auto whitespace-nowrap px-6">
                  <Link href="/services/launching">Подробнее об услуге</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Video Reviews */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Наши салюты в действии</h2>
            <p className="text-gray-800 max-w-2xl mx-auto">
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
      <ConsultationCTA className="pb-8 md:pb-16" />

    </div>
  )
}
