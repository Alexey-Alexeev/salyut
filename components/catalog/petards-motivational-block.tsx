export function PetardsMotivationalBlock() {
    return (
        <div className="flex-1 lg:min-w-0">
            <div className="rounded-lg border border-orange-200 bg-orange-50/50 p-6 lg:p-8">
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 lg:h-14 lg:w-14">
                                <svg 
                                    className="h-6 w-6 text-orange-600 lg:h-7 lg:w-7" 
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
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="mb-3 text-lg font-semibold text-gray-900 lg:text-xl">
                                Почему мы предлагаем только этот вид петард?
                            </h3>
                            <p className="mb-3 text-sm leading-relaxed text-gray-700 lg:text-base">
                                Мы тщательно отбираем каждый товар в нашем каталоге. Эти петарды прошли нашу проверку качества, и мы уверены в их надежности и безопасности. Мы предпочитаем предлагать вам только проверенные товары, в которых мы уверены на 100%.
                            </p>
                            <p className="mb-3 text-sm leading-relaxed text-gray-700 lg:text-base">
                                <strong className="font-semibold text-gray-900">Ищете Корсар?</strong> Эти петарды не уступают Корсару по качеству, а по мощности даже превосходят его. Мы выбрали именно их, потому что они дают более мощный и яркий эффект при той же надежности и безопасности.
                            </p>
                            <p className="text-sm leading-relaxed text-gray-700 lg:text-base">
                                <strong className="font-semibold text-gray-900">Хотите увидеть товар в действии?</strong> В карточке товара вы можете посмотреть видео с демонстрацией работы этих петард. Это поможет вам принять взвешенное решение.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

