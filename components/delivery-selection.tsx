'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'
import { MapPin, Truck, Store, Phone } from 'lucide-react'
import {
    calculateDelivery,
    extractCityFromAddress,
    formatDeliveryCost,
    getPickupInfo,
    type DeliveryMethod,
    type DeliveryCalculationResult
} from '@/lib/delivery-utils'

export interface DeliverySelectionProps {
    onDeliveryChange: (result: DeliveryCalculationResult) => void
    selectedMethod?: DeliveryMethod
    initialAddress?: string
    className?: string
}

export function DeliverySelection({
    onDeliveryChange,
    selectedMethod = 'delivery',
    initialAddress = '',
    className = ''
}: DeliverySelectionProps) {
    const [method, setMethod] = useState<DeliveryMethod>(selectedMethod)
    const [address, setAddress] = useState(initialAddress)
    const [distanceFromMKAD, setDistanceFromMKAD] = useState<number | undefined>()
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false)
    const [deliveryResult, setDeliveryResult] = useState<DeliveryCalculationResult | null>(null)

    const pickupInfo = getPickupInfo()

    // 🔹 Уточнённый полигон МКАД (внешний край, с акцентом на север и восток)
    const MKAD_POINTS = [
        [37.430453, 55.663664],
        [37.417131, 55.683036],
        [37.383391, 55.713116],
        [37.373877, 55.733695],
        [37.397943, 55.702952],
        [37.368047, 55.766410],
        [37.368487, 55.772188],
        [37.366906, 55.791081],
        [37.393245, 55.833521],
        [37.391835, 55.849453],
        [37.413673, 55.871955],
        [37.429115, 55.877794],
        [37.447144, 55.882757],
        [37.484837, 55.890058],
        [37.497414, 55.893813],
        [37.547737, 55.908515],
        [37.591036, 55.910775],
        [37.629619, 55.899714],
        [37.678236, 55.895313],
        [37.707323, 55.891744],
        [37.725828, 55.883742],
        [37.829629, 55.828880],
        [37.840561, 55.812621],
        [37.845924, 55.777332],
        [37.844145, 55.767539],
        [37.842924, 55.755297],
        [37.840040, 55.745843],
        [37.844460, 55.742716],
        [37.841397, 55.730243],
        [37.838154, 55.719977],
        [37.839501, 55.711371],
        [37.835315, 55.706015],
        [37.832952, 55.684295],
        [37.840983, 55.656224],
        [37.818139, 55.639268],
        [37.780105, 55.616000],
        [37.726376, 55.590099],
        [37.685162, 55.575103],
        [37.652813, 55.572940],
        [37.641593, 55.574610],
        [37.598384, 55.575790],
        [37.596803, 55.574701],
        [37.571354, 55.580579],
        [37.527220, 55.591086],
        [37.494377, 55.609777],
        [37.457897, 55.640081],
    ];

    // 📏 Формула гаверсинуса — точное расстояние между двумя точками
    const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    // 🧭 Определяем направление от центра Москвы и подбираем коэффициент
    // const getDistanceCoefficient = (lat: number, lng: number): number => {
    //     // 🔹 Одинцово / Красногорск / Запад
    //     if (lng < 37.45 && lat < 55.75 && lat > 55.60) return 2.0

    //     // 🔹 Восток: Железнодорожный
    //     if (lng > 37.95 && lat > 55.70 && lat < 55.78) return 1.3

    //     // 🔹 Юго-восток: Дзержинский
    //     if (lng > 37.85 && lat < 55.65) return 1.9

    //     // 🔹 Северо-восток: Мытищи
    //     if (lng > 37.65 && lng < 37.85 && lat > 55.85) return 2.0

    //     // 🔹 Юг: Подольск
    //     if (lng < 37.70 && lat < 55.58) return 1.7

    //     // 🔹 Общие направления
    //     if (lng > 37.90) return 2.3
    //     if (lat > 55.85) return 1.8
    //     if (lat < 55.60) return 1.6
    //     if (lng < 37.40) return 1.8  // Увеличили общий запад

    //     return 1.6
    // }

    // 🚀 Основная функция расчёта расстояния от МКАД
    const calculateDistanceFromMKAD = async (addressText: string) => {
        if (!addressText || addressText.length < 10) {
            setDistanceFromMKAD(undefined)
            return
        }

        const apiKey = process.env.NEXT_PUBLIC_YANDEX_API_KEY
        if (!apiKey) {
            console.warn('🚫 Нет Yandex API key')
            setDistanceFromMKAD(undefined)
            return
        }

        setIsCalculatingDistance(true)

        try {
            const response = await fetch(
                `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${encodeURIComponent(addressText)}&results=1`
            )

            const data = await response.json()
            const geoObjects = data.response?.GeoObjectCollection?.featureMember
            if (!geoObjects?.length) {
                console.warn('🚫 Адрес не найден в Yandex Geocoder')
                setDistanceFromMKAD(undefined)
                return
            }

            const [lngStr, latStr] = geoObjects[0].GeoObject.Point.pos.split(' ')
            const deliveryLng = parseFloat(lngStr)
            const deliveryLat = parseFloat(latStr)

            if (!isFinite(deliveryLat) || !isFinite(deliveryLng)) {
                console.warn('🚫 Некорректные координаты')
                setDistanceFromMKAD(undefined)
                return
            }

            // 🎯 Находим минимальное прямое расстояние до любой точки МКАД
            let minStraightDistanceKm = Infinity
            for (const [mkadLng, mkadLat] of MKAD_POINTS) {
                const dist = haversineDistance(deliveryLat, deliveryLng, mkadLat, mkadLng)
                if (dist < minStraightDistanceKm) {
                    minStraightDistanceKm = dist
                }
            }

            // // 🛑 Если ближе 2 км — считаем внутри или у границы МКАД
            // if (minStraightDistanceKm < 2) {
            //     setDistanceFromMKAD(0)
            //     return
            // }

            // 🛣️ Применяем адаптивный коэффициент
            // const coefficient = getDistanceCoefficient(deliveryLat, deliveryLng)
            const estimatedRoadDistance = minStraightDistanceKm * 1.35;
            const finalDistance = Math.ceil(estimatedRoadDistance)

            console.log('📏 Расчет расстояния:', {
                straight: minStraightDistanceKm.toFixed(2),
                // coefficient,
                estimated: estimatedRoadDistance.toFixed(2),
                final: finalDistance
            })

            setDistanceFromMKAD(finalDistance)
        } catch (error) {
            console.error('🚨 Ошибка при расчете расстояния:', error)
            setDistanceFromMKAD(undefined)
        } finally {
            setIsCalculatingDistance(false)
        }
    }

    // Пересчёт при изменении
    useEffect(() => {
        const city = extractCityFromAddress(address)
        console.log('🔍 DeliverySelection useEffect - Адрес:', address)
        console.log('🔍 DeliverySelection useEffect - Город:', city)
        console.log('🔍 DeliverySelection useEffect - Расстояние от МКАД:', distanceFromMKAD)

        const result = calculateDelivery({
            method,
            address: method === 'delivery' ? address || undefined : undefined,
            city: method === 'delivery' ? city || undefined : undefined,
            distanceFromMKAD: method === 'delivery' ? distanceFromMKAD : undefined
        })

        console.log('🔍 DeliverySelection useEffect - Результат расчета:', result)

        setDeliveryResult(result)
        onDeliveryChange(result)
    }, [method, address, distanceFromMKAD])

    const handleMethodChange = (value: string) => {
        setMethod(value as DeliveryMethod)
        if (value === 'pickup') {
            setAddress('')
            setDistanceFromMKAD(undefined)
        }
    }

    const handleAddressChange = (value: string) => {
        console.log('📝 handleAddressChange вызвана с адресом:', value)
        setAddress(value)
        if (value && value.length > 10) {
            console.log('⏰ Запускаем таймер для расчета расстояния...')
            setTimeout(() => {
                calculateDistanceFromMKAD(value)
            }, 1000)
        } else {
            console.log('💯 Адрес слишком короткий, сбрасываем расстояние')
            setDistanceFromMKAD(undefined)
        }
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Способ получения заказа
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <RadioGroup value={method} onValueChange={handleMethodChange}>
                    {/* Доставка */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem value="delivery" id="delivery" />
                            <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer">
                                <Truck className="w-4 h-4 text-blue-600" />
                                <span className="font-medium">🚚 Доставка</span>
                            </Label>
                        </div>

                        {method === 'delivery' && (
                            <div className="ml-7 space-y-4 border-l-2 border-blue-100 pl-4">
                                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-medium text-blue-900">Условия доставки:</h4>
                                    <div className="text-sm text-blue-700 space-y-1">
                                        <p>• Москва, Балашиха, Люберцы — <strong>500 ₽</strong></p>
                                        <p>• За МКАД — <strong>500 ₽ базовая стоимость + 100 ₽ за каждый км</strong></p>
                                        <p>• Минимальная стоимость доставки — <strong>500 ₽</strong></p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="address">Адрес доставки</Label>
                                    <AddressAutocomplete
                                        id="address"
                                        value={address}
                                        onChange={handleAddressChange}
                                        placeholder="Введите адрес доставки..."
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        💡 Начните вводить — система предложит варианты. Адрес можно оставить пустым — менеджер уточнит его при подтверждении заказа
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Label>Расстояние от МКАД</Label>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <p className="text-sm text-yellow-800">
                                            {isCalculatingDistance ? (
                                                <span className="text-blue-600">🔄 Рассчитываем...</span>
                                            ) : distanceFromMKAD !== undefined && address ? (
                                                distanceFromMKAD === 0 ? (
                                                    <span className="text-green-600">✅ В пределах МКАД</span>
                                                ) : (
                                                    <span className="text-green-600">
                                                        ✅ Примерно: <strong>{distanceFromMKAD} км</strong> от МКАД (если вы считаете, что расстояние указано неверно — сообщите в комментарии или при общении с менеджером)
                                                    </span>
                                                )
                                            ) : (
                                                <span className="text-gray-600">📍 Будет рассчитано автоматически. </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {deliveryResult && deliveryResult.method === 'delivery' && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <p className="font-medium text-green-800">{deliveryResult.description}</p>
                                        <p className="text-lg font-bold text-green-900 mt-1">
                                            Стоимость: {formatDeliveryCost(deliveryResult.cost)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Самовывоз */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <RadioGroupItem value="pickup" id="pickup" />
                            <Label htmlFor="pickup" className="flex items-center gap-2 cursor-pointer">
                                <Store className="w-4 h-4 text-green-600" />
                                <span className="font-medium">🏬 Самовывоз</span>
                                <span className="text-sm text-green-600 font-medium">(бесплатно)</span>
                            </Label>
                        </div>

                        {method === 'pickup' && (
                            <div className="ml-7 space-y-4 border-l-2 border-green-100 pl-4">
                                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                                    <h4 className="font-medium text-green-900 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Адрес склада:
                                    </h4>
                                    <p className="text-green-800">{pickupInfo.address.fullAddress}</p>
                                    <div className="space-y-2 pt-2 border-t border-green-200">
                                        <div className="flex items-center gap-2 text-sm text-green-700">
                                            <Phone className="w-4 h-4" />
                                            <span>{pickupInfo.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </RadioGroup>

                {deliveryResult && (
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">
                                {deliveryResult.method === 'delivery' ? 'Стоимость доставки:' : 'Самовывоз:'}
                            </span>
                            <span className="text-lg font-bold">
                                {formatDeliveryCost(deliveryResult.cost)}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}