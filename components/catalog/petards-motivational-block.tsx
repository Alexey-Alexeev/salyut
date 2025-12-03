import Link from "next/link";

export function PetardsMotivationalBlock() {
    return (
        <div className="flex-1 lg:min-w-0">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-7 shadow-md lg:p-9">
                <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 right-0 h-40 w-40 rounded-full bg-emerald-300/30 blur-3xl" />

                <div className="relative space-y-5">
                    <div className="flex flex-col items-start gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-5 py-2.5 text-base font-semibold text-emerald-800 shadow-sm backdrop-blur lg:text-lg">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                                    <svg
                                        className="h-5 w-5 text-emerald-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </span>
                                Проверенный выбор магазина
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 lg:text-base">
                            Коротко о главном: безопасность, эффект и наш личный отбор.
                        </p>
                    </div>

                    <h3 className="text-xl font-semibold leading-snug text-gray-900 lg:text-3xl">
                        Почему мы предлагаем только петарды «Звиздец»?
                    </h3>

                    <div className="mt-4 space-y-6 text-sm leading-relaxed text-gray-700 lg:text-base">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-start gap-3 rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur">
                                <span className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                    <svg
                                        className="h-5 w-5 text-emerald-600"
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
                                    <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 lg:text-sm">
                                        Качество и безопасность
                                    </div>
                                    <p className="text-xs text-gray-600 lg:text-sm">
                                        Каждая партия проходит нашу внутреннюю проверку — от качества сборки и упаковки до стабильности срабатывания и соответствия заявленным характеристикам.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/90 p-4 shadow-sm">
                                <span className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                    <svg
                                        className="h-5 w-5 text-emerald-600"
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
                                    <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600 lg:text-sm">
                                        Видео перед покупкой
                                    </div>
                                    <p className="text-xs text-gray-600 lg:text-sm">
                                        В карточке товара есть{" "}
                                        <Link
                                            href="/product/Zvizdec/?tab=video"
                                            className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
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
                </div>
            </div>
        </div>
    );
}


