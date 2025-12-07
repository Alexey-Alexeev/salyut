import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function PetardsMotivationalBlock() {
    return (
        <div className="flex-1 lg:min-w-0">
            <div className="relative space-y-5">
                <h3 className="text-xl font-semibold leading-snug text-gray-900 lg:text-3xl">
                    Почему мы предлагаем только петарды «Звиздец»?
                </h3>

                <div className="mt-4 space-y-6 text-sm leading-relaxed text-gray-700 lg:text-lg">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
                            <span className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                                <svg
                                    className="h-5 w-5 text-orange-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4.5l6 3.25v4.5c0 3.1-2.55 5.85-6 6.75-3.45-.9-6-3.65-6-6.75v-4.5L12 4.5z"
                                    />
                                </svg>
                            </span>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-orange-600 lg:text-base">
                                    Качество и безопасность
                                </div>
                                <p className="text-xs text-gray-600 lg:text-base">
                                    Каждая партия проходит нашу внутреннюю проверку — от качества сборки и упаковки до стабильности срабатывания и соответствия заявленным характеристикам.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-orange-300 bg-orange-50/90 p-4 shadow-sm">
                            <span className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                                <svg
                                    className="h-5 w-5 text-orange-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V7z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 9l5 3-5 3V9z"
                                    />
                                </svg>
                            </span>
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-orange-600 lg:text-base">
                                    Видео перед покупкой
                                </div>
                                <p className="text-xs text-gray-600 lg:text-base">
                                    В карточке товара есть{" "}
                                    <Link
                                        href="/product/Zvizdec/?tab=video"
                                        className="font-semibold text-orange-700 underline underline-offset-2 hover:text-orange-800"
                                    >
                                        видео с реальными запусками
                                    </Link>
                                    {" "}
                                    — вы заранее видите, как петарды ведут себя в работе, какой звук и визуальный эффект они дают.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white/80 p-5 shadow-sm backdrop-blur">
                        <p className="mb-3">
                            <strong>Ищете «Корсар»?</strong> Эти петарды не уступают «Корсару» по качеству, а по мощности часто даже превосходят его. Убедитесь в этом сами!
                        </p>
                        <p>
                            Мы тщательно отбираем каждый товар в нашем каталоге. Эти петарды прошли нашу проверку качества, и мы уверены в их надежности и безопасности. Мы предпочитаем предлагать вам только проверенные товары, в которых мы уверены на 100%.
                        </p>
                    </div>
                </div>

                {/* Кнопка "Перейти в товар" внизу по центру */}
                <div className="flex justify-center pt-2">
                    <Link href="/product/Zvizdec">
                        <Button 
                            size="lg" 
                            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 shadow-md"
                        >
                            Перейти в товар
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}


