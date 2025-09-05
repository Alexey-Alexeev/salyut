import { PartyPopper } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProductCard } from '@/components/product-card';
import { db } from '@/lib/db';
import { categories, products, reviews } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { VideoReviewCard } from '@/components/video-review-card';
import { ConsultationCTA } from '@/components/consultation-cta';

export default async function HomePage() {
  let categoriesData: any[] = [];
  let popularProducts: any[] = [];
  let videoReviews: any[] = [];

  try {
    [categoriesData, popularProducts] = await Promise.all([
      db.select().from(categories),
      db
        .select()
        .from(products)
        .where(and(eq(products.is_popular, true), eq(products.is_active, true)))
        .limit(4),
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
      <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden py-12 sm:py-16 md:min-h-[70vh]">
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

        <div className="relative z-10 mx-auto max-w-4xl space-y-4 px-4 text-center">
          <h1 className="rounded-lg bg-black/40 p-4 text-4xl font-bold leading-tight text-white md:text-6xl">
            Незабываемые <span className="text-orange-400">салюты</span> для
            ваших праздников
          </h1>

          <p className="mx-auto max-w-2xl rounded-lg bg-black/30 p-4 text-lg text-white md:text-xl">
            Качественная пиротехника от проверенных производителей. Создайте
            магию праздника вместе с нами!
          </p>

          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              aria-label="Смотреть каталог"
              asChild
              size="lg"
              className="bg-orange-700 text-white shadow-lg hover:bg-orange-800"
            >
              <Link href="/catalog">Смотреть каталог</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Discount Promotion Section */}
      <section className="w-full">
        <Card className="rounded-none bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="container mx-auto space-y-6 px-4 py-6 text-center md:py-12">
            <h2 className="flex items-center justify-center gap-2 text-2xl font-bold md:text-4xl">
              <PartyPopper
                className="mr-2 inline-block animate-bounce text-yellow-200"
                size={32}
              />
              Выгодные скидки при покупке!
            </h2>
            <p className="mx-auto max-w-2xl text-base text-white/90 md:text-lg">
              Чем больше заказ, тем больше экономия — скидки применяются
              автоматически
            </p>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="border-white/20 bg-white/20 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="mb-2 text-4xl font-bold text-yellow-300">
                    5%
                  </div>
                  <div className="mb-1 text-lg font-semibold">скидка</div>
                  <div className="text-sm text-white/90">
                    при заказе от 7 000 ₽
                  </div>
                </CardContent>
              </Card>
              <Card className="border-white/20 bg-white/20 backdrop-blur">
                <CardContent className="p-6 text-center">
                  <div className="mb-2 text-4xl font-bold text-yellow-300">
                    10%
                  </div>
                  <div className="mb-1 text-lg font-semibold">скидка</div>
                  <div className="text-sm text-white/90">
                    при заказе от 15 000 ₽
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Delivery & Pickup Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Доставка и самовывоз
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Доставка к двери или самовывоз из пункта выдачи.{' '}
            <span className="whitespace-nowrap rounded bg-red-700 px-2 py-1 font-semibold text-white">
              Только Москва и Московская область
            </span>
          </p>
        </div>

        <Card className="mx-auto max-w-4xl rounded-lg border border-orange-300 bg-gradient-to-br from-orange-50 to-green-50 p-6 shadow-lg md:p-8">
          <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2">
            <div className="flex max-w-sm flex-col items-center text-center">
              <div className="mb-2 text-6xl">🚚</div>
              <h3 className="mb-2 text-lg font-semibold">Доставка</h3>
              <p className="text-sm text-gray-800">
                Доставка по Москве и Московской области в течение 1–3 дней.
                Время согласовывается с менеджером.
              </p>
            </div>

            <div className="flex max-w-sm flex-col items-center text-center">
              <div className="mb-2 text-6xl">🏪</div>
              <h3 className="mb-2 text-lg font-semibold">Самовывоз</h3>
              <p className="text-sm text-gray-800">
                Самовывоз возможен из пункта выдачи в Балашихе. Заказ будет
                готов к согласованному времени.
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              asChild
              aria-label="Подробнее о доставке и самовывозе"
              size="lg"
              className="w-full max-w-xs rounded-lg bg-orange-700 font-semibold text-white shadow-lg transition-colors hover:bg-orange-800 sm:w-auto"
            >
              <Link href="/delivery">Подробнее о доставке и самовывозе</Link>
            </Button>
          </div>
        </Card>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto bg-gray-50 px-4 py-12">
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Категории товаров</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Выберите подходящую категорию фейерверков для вашего мероприятия
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-5">
          {categoriesData.map(category => (
            <Link key={category.id} href={`/catalog?category=${category.slug}`}>
              <Card className="group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg">
                <div className="relative aspect-square">
                  <Image
                    src={
                      category.image ||
                      'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }
                    alt="" // decorative
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="px-2 text-center text-sm font-semibold text-white md:text-base">
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
        <div className="mb-12 space-y-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Популярные товары</h2>
          <p className="text-muted-foreground mx-auto max-w-2xl">
            Самые востребованные фейерверки от наших покупателей
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {popularProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            asChild
            aria-label="Смотреть все товары"
            variant="outline"
            size="lg"
          >
            <Link href="/catalog">Смотреть все товары</Link>
          </Button>
        </div>
      </section>

      {/* Professional Launch Service */}
      <section className="w-full py-12">
        <Card className="rounded-none bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardContent className="container mx-auto px-4 py-8 md:py-16">
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                <div className="flex flex-col justify-center space-y-8 text-center">
                  <div className="text-6xl">🎆</div>
                  <h2 className="text-3xl font-bold md:text-4xl">
                    Профессиональный запуск салютов
                  </h2>
                  <p className="text-lg text-white/90">
                    Доверьте запуск профессионалам! Мы обеспечим полную
                    безопасность, соблюдение всех норм и незабываемое шоу.{' '}
                    <strong>
                      Не рискуйте безопасностью — оставьте всё профессионалам!
                    </strong>
                  </p>
                </div>
                <div className="flex flex-col justify-center space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <Card className="border-white/20 bg-white/20 backdrop-blur">
                      <CardContent className="flex items-center gap-4 p-6">
                        <div className="text-2xl">🛡️</div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold">
                            Безопасность и опыт
                          </h3>
                          <p className="text-sm text-white/90">
                            Опытные пиротехники с соблюдением всех мер
                            безопасности
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-white/20 bg-white/20 backdrop-blur">
                      <CardContent className="flex items-center gap-4 p-6">
                        <div className="text-2xl">💥</div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold">
                            Профессиональный подход
                          </h3>
                          <p className="text-sm text-white/90">
                            Качественное шоу по высшему уровню
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-white/20 bg-white/20 backdrop-blur">
                      <CardContent className="flex items-center gap-4 p-6">
                        <div className="text-2xl">👥</div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold">
                            Много довольных клиентов
                          </h3>
                          <p className="text-sm text-white/90">
                            Клиенты, которые много раз сказали нам спасибо
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              <div className="flex justify-center pt-8">
                <Button
                  asChild
                  aria-label="Подробнее об услуге"
                  size="lg"
                  variant="secondary"
                  className="w-auto whitespace-nowrap px-6"
                >
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
          <div className="mb-12 space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">
              Наши салюты в действии
            </h2>
            <p className="mx-auto max-w-2xl text-gray-800">
              Посмотрите, как выглядит наш товар на реальных праздниках клиентов
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {videoReviews.map(video => (
              <VideoReviewCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section с диалогом */}
      <ConsultationCTA className="pb-8 md:pb-16" />
    </div>
  );
}
