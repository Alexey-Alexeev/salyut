import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Пользовательское соглашение',
    description: 'Пользовательское соглашение сайта СалютГрад. Условия использования сервиса, права и обязанности пользователей.',
    alternates: {
        canonical: 'https://salutgrad.ru/terms/',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Пользовательское соглашение</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Условия использования сервиса СалютГрад
                    </p>
                </div>

                {/* Introduction */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Введение</h2>
                            <div className="space-y-4 text-gray-700 leading-relaxed">
                                <p>
                                    Настоящее Пользовательское соглашение (далее – «Соглашение») регулирует отношения между администрацией сайта <strong className="text-orange-600">salutgrad.ru</strong> (далее – «Администрация») и пользователями данного сайта (далее – «Пользователь»).
                                </p>
                                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                                    <p className="text-amber-800 font-medium">
                                        Используя сайт salutgrad.ru, вы автоматически соглашаетесь с условиями настоящего Соглашения. Если вы не согласны с какими-либо условиями, пожалуйста, прекратите использование сайта.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 1 */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 font-bold text-lg">1</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Общие положения</h2>

                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">1.1</span>
                                        Предмет соглашения
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed break-words">
                                        Настоящее Соглашение определяет условия использования сайта salutgrad.ru, включая все его поддомены, страницы и сервисы, а также права и обязанности Пользователей и Администрации.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">1.2</span>
                                        Принятие условий
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed break-words">
                                        Начало использования сайта означает полное и безоговорочное принятие Пользователем условий настоящего Соглашения. Если Пользователь не согласен с условиями Соглашения, он должен прекратить использование сайта.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">1.3</span>
                                        Изменения в соглашении
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed break-words">
                                        Администрация оставляет за собой право в любое время изменять условия настоящего Соглашения. Изменения вступают в силу с момента их размещения на сайте. Продолжение использования сайта после внесения изменений означает согласие с новыми условиями.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-purple-600 font-bold text-lg">2</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Права и обязанности пользователей</h2>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 sm:p-6 border border-purple-200 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center break-words">
                                        <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2.1</span>
                                        <span className="break-words">Права пользователей</span>
                                    </h3>

                                    <div className="space-y-4 ml-9">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Просмотр информации</h4>
                                                <p className="text-gray-700 text-sm">
                                                    Пользователь имеет право просматривать информацию о товарах, услугах и ценах, размещенную на сайте
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Оформление заказов</h4>
                                                <p className="text-gray-700 text-sm">
                                                    Пользователь имеет право оформлять заказы на товары и услуги, представленные на сайте
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Получение консультаций</h4>
                                                <p className="text-gray-700 text-sm">
                                                    Пользователь имеет право получать консультации по вопросам выбора и использования пиротехники
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center break-words">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2.2</span>
                                        <span className="break-words">Обязанности пользователей</span>
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-gray-700">Предоставлять достоверную информацию при оформлении заказов</p>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-gray-700">Соблюдать правила безопасности при использовании пиротехники</p>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-gray-700">Не нарушать работу сайта и не использовать его в противоправных целях</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-gray-700">Соблюдать возрастные ограничения при покупке пиротехники</p>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-gray-700">Не распространять вредоносное программное обеспечение</p>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-gray-700">Уважать права других пользователей и Администрации</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3 */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-orange-600 font-bold text-lg">3</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Условия заказа и оплаты</h2>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 sm:p-6 border border-orange-200 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center break-words">
                                        <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3.1</span>
                                        <span className="break-words">Оформление заказа</span>
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed break-words">
                                        Заказ оформляется путем заполнения формы на сайте. Пользователь обязуется предоставить достоверную информацию о себе и контактных данных. Администрация оставляет за собой право отказать в выполнении заказа без объяснения причин.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center break-words">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3.2</span>
                                        <span className="break-words">Оплата и доставка</span>
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center mb-2">
                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                    </svg>
                                                </div>
                                                <h4 className="font-semibold text-gray-900">Способы оплаты</h4>
                                            </div>
                                            <p className="text-gray-700 text-sm">Наличными при получении, банковской картой</p>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center mb-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                </div>
                                                <h4 className="font-semibold text-gray-900">Доставка</h4>
                                            </div>
                                            <p className="text-gray-700 text-sm">По Москве и МО, самовывоз в Балашихе</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center break-words">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3.3</span>
                                        <span className="break-words">Возврат и обмен</span>
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed break-words">
                                        Возврат товара возможен в течение 14 дней с момента покупки при условии сохранения товарного вида и упаковки. Возврат пиротехнических изделий осуществляется только при наличии дефектов, выявленных при получении товара.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4 */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="text-red-600 font-bold text-lg">4</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Ответственность и ограничения</h2>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 sm:p-6 border border-red-200 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center break-words">
                                        <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">4.1</span>
                                        <span className="break-words">Ответственность пользователя</span>
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed break-words">
                                        Пользователь несет полную ответственность за соблюдение правил безопасности при использовании пиротехнических изделий. Администрация не несет ответственности за последствия неправильного использования пиротехники.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center break-words">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">4.2</span>
                                        <span className="break-words">Ограничения ответственности</span>
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed break-words">
                                        Администрация не несет ответственности за временные технические сбои в работе сайта, а также за ущерб, причиненный в результате неправильного использования пиротехнических изделий или нарушения правил безопасности.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center break-words">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">4.3</span>
                                        <span className="break-words">Возрастные ограничения</span>
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed break-words">
                                        Покупка и использование пиротехнических изделий разрешены лицам, достигшим 18-летнего возраста. Пользователь подтверждает, что достиг указанного возраста и имеет право на приобретение пиротехники.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 5 */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <span className="text-indigo-600 font-bold text-lg">5</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Интеллектуальная собственность</h2>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 sm:p-6 border border-indigo-200 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center break-words">
                                        <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">5.1</span>
                                        <span className="break-words">Авторские права</span>
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed break-words">
                                        Все материалы сайта, включая тексты, изображения, дизайн, логотипы и программное обеспечение, являются объектами интеллектуальной собственности и защищены авторским правом. Использование материалов без письменного разрешения запрещено.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center break-words">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">5.2</span>
                                        <span className="break-words">Использование контента</span>
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed break-words">
                                        Пользователь имеет право просматривать материалы сайта исключительно для личного некоммерческого использования. Копирование, распространение или иное использование материалов в коммерческих целях запрещено.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 6 */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                <span className="text-teal-600 font-bold text-lg">6</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Заключительные положения</h2>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 sm:p-6 border border-teal-200 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center break-words">
                                        <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">6.1</span>
                                        <span className="break-words">Применимое право</span>
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed break-words">
                                        Настоящее Соглашение регулируется законодательством Российской Федерации. Все споры разрешаются в соответствии с действующим законодательством РФ.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center break-words">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">6.2</span>
                                        <span className="break-words">Контактная информация</span>
                                    </h3>
                                    <p className="text-gray-700 mb-4">
                                        По всем вопросам, связанным с настоящим Соглашением, вы можете обращаться к Администрации:
                                    </p>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div className="bg-white rounded-lg p-4 text-center">
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                            </div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Телефон</h4>
                                            <p className="text-sm text-gray-700">+7 (977) 360-20-08</p>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 text-center">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                                            <p className="text-sm text-gray-700">info@salutgrad.ru</p>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 text-center">
                                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Адрес</h4>
                                            <p className="text-sm text-gray-700">143921, Московская область, деревня Чёрное, улица Агрогородок, вл31</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6 overflow-hidden">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center break-words">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">6.3</span>
                                        <span className="break-words">Вступление в силу</span>
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed break-words">
                                        Настоящее Соглашение вступает в силу с момента начала использования сайта Пользователем и действует до прекращения использования сайта. Администрация оставляет за собой право в любое время изменить условия Соглашения.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center py-8">
                    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-500 mb-2">
                            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
                        </p>
                        <p className="text-xs text-gray-400">
                            © 2025 СалютГрад. Все права защищены.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
