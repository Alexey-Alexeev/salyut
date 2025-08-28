'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'
import { MapPin, Truck, Store, Clock, Phone } from 'lucide-react'
import {
    calculateDelivery,
    extractCityFromAddress,
    formatDeliveryCost,
    getPickupInfo,
    type DeliveryMethod,
    type DeliveryCalculationResult
} from '@/lib/delivery-utils'
import { log } from 'console'

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
    console.log('address', address)
    const pickupInfo = getPickupInfo()

    // Функция для расчета расстояния от МКАД до адреса
    const calculateDistanceFromMKAD = async (addressText: string) => {
        if (!addressText || addressText.length < 10) {
            setDistanceFromMKAD(undefined)
            return
        }

        const apiKey = process.env.NEXT_PUBLIC_YANDEX_API_KEY
        if (!apiKey) {
            console.warn('No Yandex API key for distance calculation')
            return
        }

        setIsCalculatingDistance(true)

        try {
            // Сначала получаем координаты адреса доставки
            const geocodeResponse = await fetch(
                `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${encodeURIComponent(addressText)}&results=1`
            )

            if (!geocodeResponse.ok) {
                throw new Error('Failed to geocode address')
            }

            const geocodeData = await geocodeResponse.json()
            const geoObjects = geocodeData.response?.GeoObjectCollection?.featureMember || []

            if (geoObjects.length === 0) {
                console.warn('Address not found for distance calculation')
                setDistanceFromMKAD(undefined)
                return
            }

            const coordinates = geoObjects[0].GeoObject.Point.pos.split(' ')
            const deliveryLng = parseFloat(coordinates[0])
            const deliveryLat = parseFloat(coordinates[1])

            // Координаты центра Москвы (Красная площадь)
            const moscowCenterLat = 55.7558
            const moscowCenterLng = 37.6176

            // Рассчитываем расстояние от центра Москвы
            const distanceFromCenter = calculateDistanceKm(
                moscowCenterLat, moscowCenterLng,
                deliveryLat, deliveryLng
            )

            // МКАД проходит на расстоянии примерно 15-25 км от центра
            // Используем средний радиус 19 км
            const mkadRadius = 15.5

            // Если адрес в пределах МКАД, расстояние = 0
            if (distanceFromCenter <= mkadRadius) {
                setDistanceFromMKAD(0)
                return
            }

            // Если за МКАД, рассчитываем расстояние от границы МКАД
            const distanceFromMKAD = Math.max(0, distanceFromCenter - mkadRadius)
            setDistanceFromMKAD(Math.round(distanceFromMKAD))

        } catch (error) {
            console.error('Error calculating distance from MKAD:', error)
            setDistanceFromMKAD(undefined)
        } finally {
            setIsCalculatingDistance(false)
        }
    }

    // Функция для расчета расстояния между двумя точками (формула гаверсинусов)
    const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371 // Радиус Земли в км

        // Конвертируем градусы в радианы
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLon = (lon2 - lon1) * Math.PI / 180

        // Формула гаверсинусов
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c // Возвращаем расстояние в км
    }

    // Пересчитываем доставку при изменении данных
    useEffect(() => {
        const city = extractCityFromAddress(address)
        const result = calculateDelivery({
            method,
            address: address || undefined,
            city: city || undefined,
            distanceFromMKAD
        })

        setDeliveryResult(result)
        onDeliveryChange(result)
    }, [method, address, distanceFromMKAD, onDeliveryChange])

    const handleMethodChange = (value: string) => {
        setMethod(value as DeliveryMethod)
    }

    const handleAddressChange = (value: string) => {
        setAddress(value)
        // Автоматически рассчитываем расстояние от МКАД
        if (value && value.length > 10) {
            // Дебаунс для сокращения количества API запросов
            const timeoutId = setTimeout(() => {
                calculateDistanceFromMKAD(value)
            }, 1000)
            return () => clearTimeout(timeoutId)
        } else {
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
                                        placeholder="Введите полный адрес доставки (город, улица, дом, квартира)..."
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        💡 Начните вводить — система предложит варианты адресов. Адрес можно оставить пустым — менеджер уточнит его при подтверждении заказа
                                    </p>
                                </div>

                                {/* Убрано поле расстояния, теперь показываем только текст */}
                                <div className="space-y-3">
                                    <Label>Расстояние от МКАД</Label>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <p className="text-sm text-yellow-800">
                                            {isCalculatingDistance ? (
                                                <span className="text-blue-600">
                                                    🔄 Рассчитываем расстояние от МКАД...
                                                </span>
                                            ) : distanceFromMKAD !== undefined && address ? (
                                                distanceFromMKAD === 0 ? (
                                                    <span className="text-green-600">
                                                        ✅ Адрес находится в пределах МКАД
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600">
                                                        ✅ Примерное расстояние: {distanceFromMKAD} км от МКАД
                                                    </span>
                                                )
                                            ) : (
                                                <span className="text-gray-600">
                                                    📍 Расстояние будет рассчитано автоматически по адресу доставки
                                                </span>
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
                                            <Clock className="w-4 h-4" />
                                            <span>{pickupInfo.workingHours}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-green-700">
                                            <Phone className="w-4 h-4" />
                                            <span>{pickupInfo.phone}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-green-600 bg-green-100 p-2 rounded">
                                        💡 {pickupInfo.notes}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </RadioGroup>

                {/* Итоговая информация */}
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