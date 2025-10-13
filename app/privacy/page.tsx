import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Политика конфиденциальности',
    description: 'Политика конфиденциальности сайта СалютГрад. Обработка персональных данных пользователей.',
    robots: {
        index: true,
        follow: true,
    },
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-5xl">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full mb-4 sm:mb-6">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Политика конфиденциальности</h1>
                    <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                        Защита ваших персональных данных — наш приоритет
                    </p>
                </div>

                {/* Introduction */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Введение</h2>
                            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                                <p className="break-words">
                                    Настоящий документ «Политика конфиденциальности» (далее – по тексту – «Политика») представляет собой правила использования сайтом <strong className="text-orange-600">салютград.рф</strong> [ИП Владимиров А.] (далее – Оператор) персональной информации Пользователя, которую Оператор, включая всех лиц, входящих в одну группу с Оператором, могут получить о Пользователе во время использования им любого из сайтов, сервисов, служб, программ, продуктов или услуг Оператора (далее – Сайт) и в ходе исполнения Оператором любых соглашений и договоров с Пользователем.
                                </p>
                                <div className="bg-amber-50 border-l-4 border-amber-400 p-3 sm:p-4 rounded-r-lg">
                                    <p className="text-amber-800 font-medium text-sm sm:text-base">
                                        Использование Сайта означает безоговорочное согласие Пользователя с настоящей Политикой и указанными в ней условиями обработки его персональной информации; в случае несогласия с этими условиями Пользователь должен воздержаться от использования Сайта.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 1 */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 font-bold text-base sm:text-lg">1</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Общие положения политики</h2>

                            <div className="space-y-4 sm:space-y-6">
                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-start sm:items-center">
                                        <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0">1.1</span>
                                        <span className="break-words">Правовая основа</span>
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">
                                        Настоящая Политика является неотъемлемой частью Публичной оферты (далее – «Оферта»), размещенной и/или доступной в сети Интернет по адресу: <strong className="text-orange-600">https://салютград.рф</strong>, а также иных заключаемых с Пользователем договоров, когда это прямо предусмотрено их условиями.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-start sm:items-center">
                                        <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0">1.2</span>
                                        <span className="break-words">Соответствие законодательству</span>
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">
                                        Настоящая Политика составлена в соответствии с Федеральным законом «О персональных данных» № 152-ФЗ от 27 июля 2006 г., а также иными нормативно-правовыми актами Российской Федерации в области защиты и обработки персональных данных и действует в отношении всех персональных данных, которые Оператор может получить от Пользователя, являющегося стороной по гражданско-правовому договору.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-start sm:items-center">
                                        <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0">1.3</span>
                                        <span className="break-words">Изменения в политике</span>
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">
                                        Оператор имеет право вносить изменения в настоящую Политику. При внесении изменений в заголовке Политики указывается дата последнего обновления редакции. Новая редакция Политики вступает в силу с момента ее размещения на сайте, если иное не предусмотрено новой редакцией Политики.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-start sm:items-center">
                                        <span className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-0">1.4</span>
                                        <span className="break-words">Применимое право</span>
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">
                                        К настоящей Политике, включая толкование ее положений и порядок принятия, исполнения, изменения и прекращения, подлежит применению законодательство Российской Федерации.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8 border border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-purple-600 font-bold text-base sm:text-lg">2</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">Персональная информация Пользователей</h2>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">2.1</span>
                                        Под персональной информацией понимается:
                                    </h3>

                                    <div className="space-y-4 ml-9">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Информация, предоставляемая пользователем</h4>
                                                <p className="text-gray-700 text-sm">
                                                    информация, предоставляемая Пользователем самостоятельно при регистрации (создании учётной записи) или в процессе использования Сайта, включая персональные данные Пользователя. Обязательная для предоставления Сайтом информация помечена специальным образом. Иная информация предоставляется Пользователем на его усмотрение.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Автоматически передаваемые данные</h4>
                                                <p className="text-gray-700 text-sm">
                                                    данные, которые передаются в автоматическом режиме Сайту в процессе их использования с помощью установленного на устройстве Пользователя программного обеспечения, в том числе IP-адрес, данные файлов cookie, информация о браузере Пользователя, технические характеристики оборудования и программного обеспечения, используемых Пользователем, дата и время доступа к Сайту, адреса запрашиваемых страниц и иная подобная информация.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                                            <div>
                                                <h4 className="font-semibold text-gray-900 mb-2">Иная информация</h4>
                                                <p className="text-gray-700 text-sm">
                                                    иная информация о Пользователе, обработка которой предусмотрена условиями использования Сайта.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">2.2</span>
                                        Применимость политики
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Настоящая Политика применима только к информации, обрабатываемой в ходе использования Сайта. Сайт не контролирует и не несет ответственность за обработку информации сайтами третьих лиц, на которые Пользователь может перейти по ссылкам, доступным на Сайте.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">2.3</span>
                                        Проверка информации
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Сайт не проверяет достоверность персональной информации, предоставляемой Пользователем, и не имеет возможности оценивать его дееспособность.
                                    </p>
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
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Цели обработки персональной информации</h2>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6 border border-orange-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">3.1</span>
                                        Принципы сбора данных
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Сайт собирает и хранит только ту персональную информацию, которая необходима для предоставления сервисов или исполнения соглашений и договоров с Пользователем, за исключением случаев, когда законодательством предусмотрено обязательное хранение персональной информации в течение определенного законом срока.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">3.2</span>
                                        Цели обработки персональной информации
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                            <div className="flex items-center mb-2">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base break-words">Идентификация</h4>
                                            </div>
                                            <p className="text-gray-700 text-xs sm:text-sm break-words">идентификация стороны в рамках сервисов, соглашений и договоров с Сайтом</p>
                                        </div>

                                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                            <div className="flex items-center mb-2">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base break-words">Предоставление услуг</h4>
                                            </div>
                                            <p className="text-gray-700 text-xs sm:text-sm break-words">предоставление Пользователю персонализированных сервисов и услуг, а также исполнение соглашений и договоров</p>
                                        </div>

                                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                            <div className="flex items-center mb-2">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 0115 0v5z" />
                                                    </svg>
                                                </div>
                                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base break-words">Уведомления</h4>
                                            </div>
                                            <p className="text-gray-700 text-xs sm:text-sm break-words">направление уведомлений, запросов и информации, касающихся использования Сайта</p>
                                        </div>

                                        <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
                                            <div className="flex items-center mb-2">
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                                                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                    </svg>
                                                </div>
                                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base break-words">Улучшение качества</h4>
                                            </div>
                                            <p className="text-gray-700 text-xs sm:text-sm break-words">улучшение качества работы Сайта, удобства его использования для Пользователя</p>
                                        </div>
                                    </div>
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
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Условия обработки и передачи данных</h2>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-6 border border-red-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">4.1</span>
                                        Конфиденциальность
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        В отношении персональной информации Пользователя сохраняется ее конфиденциальность, кроме случаев добровольного предоставления Пользователем информации о себе для общего доступа неограниченному кругу лиц.
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">4.2</span>
                                        Передача данных третьим лицам
                                    </h3>
                                    <p className="text-gray-700 mb-4">Сайт вправе передать персональную информацию Пользователя третьим лицам в следующих случаях:</p>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-gray-700">Пользователь выразил согласие на такие действия</p>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-gray-700">Передача необходима для использования Пользователем определенного сервиса</p>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-gray-700">Передача необходима для функционирования и работоспособности самого Сайта</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-gray-700">Передача предусмотрена российским законодательством</p>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-gray-700">В рамках продажи или иной передачи бизнеса</p>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                                <p className="text-sm text-gray-700">В целях обеспечения возможности защиты прав и законных интересов</p>
                                            </div>
                                        </div>
                                    </div>
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
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Изменение и удаление персональной информации</h2>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">5.1</span>
                                        Права пользователя
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Пользователь может в любой момент изменить (обновить, дополнить) предоставленную им персональную информацию или её часть, обратившись к Сайту по контактам в разделе 9. «Контакты».
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">5.2</span>
                                        Ограничения
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Права, предусмотренные п. 5.1. настоящей Политики могут быть ограничены в соответствии с требованиями законодательства. Например, такие ограничения могут предусматривать обязанность Сайта сохранить измененную или удаленную Пользователем информацию на срок, установленный законодательством, и передать такую информацию в соответствии с законодательно установленной процедурой государственному органу.
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
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Обработка данных при помощи Cookie</h2>

                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-6 border border-teal-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">6.1</span>
                                        Использование Cookie
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        Файлы cookie, передаваемые Сайтом оборудованию Пользователя и оборудованием Пользователя Сайту, могут использоваться Сайтом для предоставления Пользователю персонализированных сервисов, для таргетирования рекламы, которая показывается Пользователю, в статистических и исследовательских целях, а также для улучшения Сайта.
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">6.2</span>
                                            Настройки браузера
                                        </h3>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            Пользователь осознает, что оборудование и программное обеспечение, используемые им для посещения сайтов в сети интернет могут обладать функцией запрещения операций с файлами cookie.
                                        </p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">6.3</span>
                                            Обязательность Cookie
                                        </h3>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            Сайт вправе установить, что предоставление определенного сервиса или услуги возможно только при условии, что прием и получение файлов cookie разрешены Пользователем.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 7 */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <span className="text-emerald-600 font-bold text-lg">7</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Защита персональной информации</h2>

                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-6 border border-emerald-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">7.1</span>
                                    Меры защиты
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Сайт предпринимает необходимые и достаточные организационные и технические меры для защиты персональной информации Пользователя от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения, а также от иных неправомерных действий с ней третьих лиц.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 8 */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                                <span className="text-amber-600 font-bold text-lg">8</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Изменение Политики конфиденциальности</h2>

                            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6 border border-amber-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">8.1</span>
                                    Право на изменения
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Сайт имеет право вносить изменения в настоящую Политику конфиденциальности. При внесении изменений в актуальной редакции указывается дата последнего обновления. Новая редакция Политики вступает в силу с момента ее размещения, если иное не предусмотрено новой редакцией Политики. Действующая редакция постоянно доступна на странице по адресу <strong className="text-orange-600">https://салютград.рф/privacy</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 9 - Contacts */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl shadow-lg p-8 mb-8 border border-orange-200">
                    <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-orange-600 font-bold text-lg">9</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Контакты и вопросы по персональным данным</h2>

                            <div className="bg-white rounded-lg p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold mr-3">9.1</span>
                                    Способы связи
                                </h3>
                                <p className="text-gray-700 mb-6">
                                    Все предложения, вопросы, запросы и иные обращения по поводу настоящей Политики и использования своих персональных данных Пользователь вправе направлять Сайту:
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Телефон</h4>
                                        <p className="text-xs sm:text-sm text-gray-700 break-words">+7 (977) 360-20-08</p>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                                            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Адрес</h4>
                                        <p className="text-xs sm:text-sm text-gray-700 break-words">143921, Московская область, деревня Чёрное, Рассветная улица, 14</p>
                                    </div>
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