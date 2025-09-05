'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { ConsultationDialog } from '@/components/consultation-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Award,
  Users,
  Phone,
  RussianRuble,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin,
  Clock,
  Flame,
  Star,
  Info,
  XCircle,
  Home,
  FireExtinguisher,
  UserCheck,
  FileCheck,
  ThumbsUp,
  Hospital,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LaunchingServicePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <div className="min-h-screen">
      {/* Hero секция с изображением */}
      <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/services-bg.webp"
            alt="Профессиональный запуск салютов, пиротехника на празднике"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="/images/services-bg.webp"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl space-y-6 px-4 text-center text-white">
          <h1 className="rounded-lg bg-black/40 p-4 text-3xl font-bold leading-tight text-white backdrop-blur-sm md:text-4xl lg:text-5xl">
            <span className="text-orange-400">Профессиональный</span> запуск
            салютов
          </h1>
          <p className="mx-auto max-w-2xl rounded-lg bg-black/30 p-4 text-lg text-white md:text-xl">
            Доверьте запуск фейерверков профессионалам. Безопасность, качество и
            незабываемые впечатления гарантированы.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600"
              onClick={() => setIsDialogOpen(true)}
            >
              Заказать консультацию
            </Button>
          </div>
        </div>
      </section>

      {/* Факты и статистика */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Факты и статистика МЧС
            </h2>
            <p className="mb-12 text-gray-600">
              Независимая статистика подтверждает: самостоятельный запуск
              фейерверков — это не только риск, но и реальные последствия.
            </p>

            <div className="grid gap-8 md:grid-cols-2">
              <Card className="flex flex-col items-center p-8 text-center shadow-md">
                <AlertTriangle className="mb-4 size-12 text-red-600" />
                <p className="mb-4 text-5xl font-bold text-red-600">1000</p>
                <p className="text-gray-700">
                  человек ежегодно госпитализируют после несчастных случаев с
                  пиротехникой по данным МЧС{' '}
                  <sup>
                    <a
                      href="https://pharmmedprom.ru/articles/chto-delat-pri-travmah-ot-pirotehniki-soveti-travmatologa/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      [источник]
                    </a>
                  </sup>
                </p>
              </Card>

              <Card className="flex flex-col items-center p-8 text-center shadow-md">
                <Flame className="mb-4 size-12 text-orange-500" />
                <p className="mb-4 text-5xl font-bold text-orange-500">136</p>
                <p className="text-gray-700">
                  пожаров за 2023 год, вызванных пиротехникой{' '}
                  <sup>
                    <a
                      href="https://newizv.ru/news/2023-12-31/v-mchs-rasskazali-kak-vybrat-pirotehniku-i-napomnili-o-zapretah-425768"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      [МЧС]
                    </a>
                  </sup>
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Безопасность и преимущества */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
              Безопасность — наш приоритет
            </h2>
            <p className="mb-12 text-center text-gray-600">
              Самостоятельный запуск фейерверков связан с высоким риском травм и
              пожаров. Мы строго соблюдаем все правила безопасности, чтобы
              праздник оставил только приятные воспоминания.
            </p>

            <div className="grid items-stretch gap-8 md:grid-cols-2">
              {/* Почему опасно самостоятельно */}
              <Card className="flex h-full flex-col p-6 shadow-md">
                <h3 className="mb-4 flex min-h-[3.5rem] items-center gap-2 text-xl font-semibold">
                  <AlertTriangle className="size-6 text-red-500" />
                  Почему опасно запускать самостоятельно?
                </h3>
                <ul className="flex-1 space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <Hospital className="mt-0.5 size-5 shrink-0 text-red-500" />
                    <span>Риск травм от неправильного обращения</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FireExtinguisher className="mt-0.5 size-5 shrink-0 text-red-500" />
                    <span>Нарушение правил пожарной безопасности</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Home className="mt-0.5 size-5 shrink-0 text-red-500" />
                    <span>Возможный ущерб имуществу</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" />
                    <span>
                      Использование несертифицированной продукции, которая часто
                      становится причиной несчастных случаев
                    </span>
                  </li>
                </ul>
              </Card>

              {/* С нами вы получаете */}
              <Card className="flex h-full flex-col p-6 shadow-md">
                <h3 className="mb-4 flex min-h-[3.5rem] items-center gap-2 text-xl font-semibold">
                  <CheckCircle className="size-6 text-green-500" />С нами вы
                  получаете:
                </h3>
                <ul className="flex-1 space-y-3 text-gray-600">
                  <li className="flex items-start gap-3">
                    <UserCheck className="mt-0.5 size-5 shrink-0 text-green-500" />
                    <span>
                      Профессиональных специалистов с опытом проведения салютов
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <FileCheck className="mt-0.5 size-5 shrink-0 text-green-500" />
                    <span>
                      Сертифицированную пиротехнику от проверенных поставщиков
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="mt-0.5 size-5 shrink-0 text-green-500" />
                    <span>Ответственный подход к безопасности</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ThumbsUp className="mt-0.5 size-5 shrink-0 text-green-500" />
                    <span>Положительные отзывы довольных клиентов</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Детали услуги */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Индивидуальный подход к каждому клиенту
            </h2>
            <p className="mb-12 text-xl text-gray-600">
              Мы понимаем, что каждое мероприятие уникально. Все детали
              обсуждаются индивидуально с нашими менеджерами.
            </p>

            <div className="mb-12 grid gap-8 md:grid-cols-1">
              <Card className="p-8">
                <h3 className="mb-6 text-2xl font-semibold">
                  Что мы обсуждаем с вами:
                </h3>
                <div className="grid gap-6 text-left md:grid-cols-2">
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start gap-2">
                      <Calendar className="mt-0.5 size-5 shrink-0 text-orange-500" />
                      <span>Место проведения и его особенности</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Award className="mt-0.5 size-5 shrink-0 text-orange-500" />
                      <span>Объем и тип фейерверков</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="mt-0.5 size-5 shrink-0 text-orange-500" />
                      <span>Время проведения и продолжительность</span>
                    </li>
                  </ul>
                  <ul className="space-y-4 text-gray-600">
                    <li className="flex items-start gap-2">
                      <Shield className="mt-0.5 size-5 shrink-0 text-orange-500" />
                      <span>Меры безопасности для конкретной площадки</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 size-5 shrink-0 text-orange-500" />
                      <span>Синхронизация с музыкой (при желании)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <RussianRuble className="mt-0.5 size-5 shrink-0 text-orange-500" />
                      <span>Стоимость и варианты оплаты</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA секция */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">
            Готовы заказать профессиональный запуск?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
            Просто отметьте услугу при оформлении заказа, и наш менеджер
            свяжется с вами для обсуждения всех деталей и расчета стоимости.
          </p>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
            Или закажите консультацию сейчас
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="w-auto whitespace-nowrap px-6"
            onClick={() => setIsDialogOpen(true)}
          >
            Получить бесплатную консультацию
          </Button>
        </div>
      </section>

      {/* Диалог консультации */}
      <ConsultationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
