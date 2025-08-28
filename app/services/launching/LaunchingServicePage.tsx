
"use client"

import { useState } from 'react';
import { Metadata } from 'next'
import { ConsultationDialog } from '@/components/consultation-dialog';
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function LaunchingServicePage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    return (
        <div className="min-h-screen">
            {/* Hero секция с изображением */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
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

                <div className="relative z-10 text-center text-white space-y-6 px-4 max-w-4xl mx-auto">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white bg-black/40 p-4 rounded-lg backdrop-blur-sm">
                        <span className="text-orange-400">Профессиональный</span> запуск салютов
                    </h1>
                    <p className="text-lg md:text-xl text-white bg-black/30 p-4 rounded-lg max-w-2xl mx-auto">
                        Доверьте запуск фейерверков профессионалам. Безопасность, качество и незабываемые впечатления гарантированы.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg"
                            className="bg-orange-500 hover:bg-orange-600"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            Заказать консультацию
                        </Button>
                    </div>
                </div>
            </section >

            {/* Факты и статистика */}
            < section className="py-16 bg-gray-50" >
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Факты и статистика МЧС
                        </h2>
                        <p className="text-gray-600 mb-12">
                            Независимая статистика подтверждает: самостоятельный запуск фейерверков — это не только риск, но и реальные последствия.
                        </p>

                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="p-8 text-center shadow-md flex flex-col items-center">
                                <AlertTriangle className="w-12 h-12 text-red-600 mb-4" />
                                <p className="text-5xl font-bold text-red-600 mb-4">1000</p>
                                <p className="text-gray-700">
                                    человек ежегодно госпитализируют после несчастных случаев с пиротехникой по данным МЧС <sup><a href="https://pharmmedprom.ru/articles/chto-delat-pri-travmah-ot-pirotehniki-soveti-travmatologa/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">[источник]</a></sup>
                                </p>
                            </Card>

                            <Card className="p-8 text-center shadow-md flex flex-col items-center">
                                <Flame className="w-12 h-12 text-orange-500 mb-4" />
                                <p className="text-5xl font-bold text-orange-500 mb-4">136</p>
                                <p className="text-gray-700">
                                    пожаров за 2023 год, вызванных пиротехникой <sup><a href="https://newizv.ru/news/2023-12-31/v-mchs-rasskazali-kak-vybrat-pirotehniku-i-napomnili-o-zapretah-425768" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">[МЧС]</a></sup>
                                </p>
                            </Card>
                        </div>
                    </div>
                </div>
            </section >

            {/* Безопасность и преимущества */}
            < section className="py-16 bg-white" >
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                            Безопасность - наш приоритет
                        </h2>
                        <p className="text-center text-gray-600 mb-12">
                            Самостоятельный запуск фейерверков связан с высоким риском травм и пожаров. Мы строго соблюдаем все правила безопасности, чтобы праздник оставил только приятные воспоминания.
                        </p>

                        <div className="grid md:grid-cols-2 gap-8 items-stretch">
                            {/* Почему опасно самостоятельно */}
                            <Card className="p-6 shadow-md h-full flex flex-col">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 min-h-[3.5rem]">
                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                    Почему опасно запускать самостоятельно?
                                </h3>
                                <ul className="space-y-3 text-gray-600 flex-1">
                                    <li className="flex items-start gap-3">
                                        <Hospital className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <span>Риск травм от неправильного обращения</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <FireExtinguisher className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <span>Нарушение правил пожарной безопасности</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Home className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <span>Возможный ущерб имуществу</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <span>Использование несертифицированной продукции, которая часто становится причиной несчастных случаев</span>
                                    </li>
                                </ul>
                            </Card>

                            {/* С нами вы получаете */}
                            <Card className="p-6 shadow-md h-full flex flex-col">
                                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 min-h-[3.5rem]">
                                    <CheckCircle className="h-6 w-6 text-green-500" />
                                    С нами вы получаете:
                                </h3>
                                <ul className="space-y-3 text-gray-600 flex-1">
                                    <li className="flex items-start gap-3">
                                        <UserCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Профессиональных специалистов с опытом проведения салютов</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <FileCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Сертифицированную пиротехнику от проверенных поставщиков</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Ответственный подход к безопасности</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <ThumbsUp className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Положительные отзывы довольных клиентов</span>
                                    </li>
                                </ul>
                            </Card>
                        </div>
                    </div>
                </div>
            </section >


            {/* Детали услуги */}
            < section className="py-16 bg-gray-50" >
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Индивидуальный подход к каждому клиенту
                        </h2>
                        <p className="text-xl text-gray-600 mb-12">
                            Мы понимаем, что каждое мероприятие уникально. Все детали обсуждаются индивидуально с нашими менеджерами.
                        </p>

                        <div className="grid md:grid-cols-1 gap-8 mb-12">
                            <Card className="p-8">
                                <h3 className="text-2xl font-semibold mb-6">Что мы обсуждаем с вами:</h3>
                                <div className="grid md:grid-cols-2 gap-6 text-left">
                                    <ul className="space-y-4 text-gray-600">
                                        <li className="flex items-start gap-2">
                                            <Calendar className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <span>Место проведения и его особенности</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Award className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <span>Объем и тип фейерверков</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Clock className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <span>Время проведения и продолжительность</span>
                                        </li>
                                    </ul>
                                    <ul className="space-y-4 text-gray-600">
                                        <li className="flex items-start gap-2">
                                            <Shield className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <span>Меры безопасности для конкретной площадки</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Sparkles className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <span>Синхронизация с музыкой (при желании)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <RussianRuble className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <span>Стоимость и варианты оплаты</span>
                                        </li>
                                    </ul>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section >

            {/* CTA секция */}
            < section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white" >
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Готовы заказать профессиональный запуск?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Просто отметьте услугу при оформлении заказа, и наш менеджер свяжется с вами для обсуждения всех деталей и расчета стоимости.
                    </p>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
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
            </section >

            {/* Диалог консультации */}
            < ConsultationDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </div >
    )
}