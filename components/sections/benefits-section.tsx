import { Card } from '@/components/ui/card';
import {
    AlertTriangle,
    CheckCircle,
    Hospital,
    FireExtinguisher,
    Home,
    XCircle,
    UserCheck,
    FileCheck,
    Shield,
    ThumbsUp,
} from 'lucide-react';

export function BenefitsSection() {
    return (
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
                                <AlertTriangle className="size-6 text-red-500" aria-hidden="true" />
                                Почему опасно запускать самостоятельно?
                            </h3>
                            <ul className="flex-1 space-y-3 text-gray-600">
                                <li className="flex items-start gap-3">
                                    <Hospital className="mt-0.5 size-5 shrink-0 text-red-500" aria-hidden="true" />
                                    <span>Риск травм от неправильного обращения</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FireExtinguisher className="mt-0.5 size-5 shrink-0 text-red-500" aria-hidden="true" />
                                    <span>Нарушение правил пожарной безопасности</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Home className="mt-0.5 size-5 shrink-0 text-red-500" aria-hidden="true" />
                                    <span>Возможный ущерб имуществу</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <XCircle className="mt-0.5 size-5 shrink-0 text-red-500" aria-hidden="true" />
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
                                <CheckCircle className="size-6 text-green-500" aria-hidden="true" />С нами вы
                                получаете:
                            </h3>
                            <ul className="flex-1 space-y-3 text-gray-600">
                                <li className="flex items-start gap-3">
                                    <UserCheck className="mt-0.5 size-5 shrink-0 text-green-500" aria-hidden="true" />
                                    <span>
                                        Профессиональных специалистов с опытом проведения салютов
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <FileCheck className="mt-0.5 size-5 shrink-0 text-green-500" aria-hidden="true" />
                                    <span>
                                        Сертифицированную пиротехнику от проверенных поставщиков
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Shield className="mt-0.5 size-5 shrink-0 text-green-500" aria-hidden="true" />
                                    <span>Ответственный подход к безопасности</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ThumbsUp className="mt-0.5 size-5 shrink-0 text-green-500" aria-hidden="true" />
                                    <span>Положительные отзывы довольных клиентов</span>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
