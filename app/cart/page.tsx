'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Minus, Plus, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { useCartStore } from '@/lib/cart-store'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const orderSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  phone: z.string().min(10, 'Введите корректный номер телефона'),
  contactMethod: z.enum(['telegram', 'whatsapp']).optional(),
  contact: z.string().optional(),
  comment: z.string().optional(),
  ageConfirmed: z.boolean().refine(val => val === true, {
    message: 'Необходимо подтвердить возраст'
  })
}).refine(data => {
  if (data.contactMethod && !data.contact) {
    return false
  }
  return true
}, {
  message: 'Укажите контакт для связи',
  path: ['contact']
})

type OrderForm = z.infer<typeof orderSchema>

// Функция округления скидки до целых рублей
function roundDiscount(amount: number): number {
  return Math.round(amount);
}

const DELIVERY_COST = 500
const DISCOUNT_THRESHOLD_1 = 7000 // 5% discount
const DISCOUNT_THRESHOLD_2 = 15000 // 10% discount

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema)
  })

  const contactMethod = watch('contactMethod')

  const subtotal = getTotalPrice()
  const discount = subtotal >= DISCOUNT_THRESHOLD_2 ? 0.1 : subtotal >= DISCOUNT_THRESHOLD_1 ? 0.05 : 0
  const discountAmount = roundDiscount(subtotal * discount) // Округляем скидку
  const total = subtotal - discountAmount + (items.length > 0 ? DELIVERY_COST : 0)

  const onSubmit = async (data: OrderForm) => {
    if (items.length === 0) {
      toast.error('Корзина пуста')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Подготавливаем данные для API
      const orderData = {
        customer_name: data.name,
        customer_phone: data.phone,
        customer_contact: data.contact || null,
        contact_method: data.contactMethod || null,
        comment: data.comment || null,
        total_amount: Math.round(total), // округляем до целого числа рублей
        delivery_cost: DELIVERY_COST, // в рублях
        discount_amount: Math.round(discountAmount), // округляем скидку до целого числа рублей
        age_confirmed: data.ageConfirmed,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price_at_time: Math.round(item.price) // округляем цену до целого числа рублей
        }))
      }

      console.log('Отправляем заказ:', orderData)

      // Отправляем заказ в API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Ошибка при создании заказа')
      }

      const result = await response.json()
      console.log('Заказ создан:', result)
      
      clearCart()
      setOrderComplete(true)
      toast.success('Заказ успешно оформлен! Мы свяжемся с вами в ближайшее время.')
      
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error)
      toast.error(error instanceof Error ? error.message : 'Ошибка при оформлении заказа')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold">Заказ оформлен!</h1>
          <p className="text-muted-foreground">
            Спасибо за ваш заказ. Наш менеджер свяжется с вами в ближайшее время для подтверждения деталей.
          </p>
          <Button asChild>
            <a href="/">Вернуться на главную</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Breadcrumb
          items={[
            { label: 'Корзина' }
          ]}
        />
      </div>

      <h1 className="text-3xl font-bold mb-8">Корзина</h1>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Ваша корзина пуста</p>
          <Button asChild>
            <a href="/catalog">Перейти в каталог</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium line-clamp-2 text-sm">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.price.toLocaleString('ru-RU')} ₽ / шт.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border rounded-md">
                          <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3"/>
                          </Button>
                          <span className="px-2 py-1 text-sm min-w-[2rem] text-center">{item.quantity}</span>
                          <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3"/>
                          </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </div>
                    </div>

                    {/* Цена на отдельной строке */}
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="text-sm text-muted-foreground">Сумма:</span>
                      <p className="font-medium text-lg whitespace-nowrap">
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary & Form */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Итого</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Товары:</span>
                  <span>{subtotal.toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="flex justify-between">
                  <span>Доставка:</span>
                  <span>{DELIVERY_COST.toLocaleString('ru-RU')} ₽</span>
                </div>

                {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Скидка ({Math.round(discount * 100)}%):</span>
                      <span>-{discountAmount.toLocaleString('ru-RU')} ₽</span>
                    </div>
                )}

                <Separator/>

                <div className="flex justify-between text-lg font-bold">
                  <span>К оплате:</span>
                  <span>{total.toLocaleString('ru-RU')} ₽</span>
                </div>

                {subtotal < DISCOUNT_THRESHOLD_1 && (
                    <p className="text-sm text-muted-foreground">
                      До скидки 5% осталось {(DISCOUNT_THRESHOLD_1 - subtotal).toLocaleString('ru-RU')} ₽
                    </p>
                )}

                {subtotal >= DISCOUNT_THRESHOLD_1 && subtotal < DISCOUNT_THRESHOLD_2 && (
                    <p className="text-sm text-muted-foreground">
                      До скидки 10% осталось {(DISCOUNT_THRESHOLD_2 - subtotal).toLocaleString('ru-RU')} ₽
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Order Form */}
            <Card>
              <CardHeader>
                <CardTitle>Оформление заказа</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Имя *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Введите ваше имя"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="+7 (999) 123-45-67"
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contactMethod">Способ связи</Label>
                    <Select
                      onValueChange={(value) => setValue('contactMethod', value as 'telegram' | 'whatsapp')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите способ связи" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {contactMethod && (
                    <div>
                      <Label htmlFor="contact">
                        {contactMethod === 'telegram' ? 'Telegram' : 'WhatsApp'}
                      </Label>
                      <Input
                        id="contact"
                        {...register('contact')}
                        placeholder={contactMethod === 'telegram' ? '@username' : '+7 (999) 123-45-67'}
                      />
                      {errors.contact && (
                        <p className="text-sm text-destructive mt-1">{errors.contact.message}</p>
                      )}
                    </div>
                  )}

                  <div>
                    <Label htmlFor="comment">Комментарий к заказу</Label>
                    <Textarea
                      id="comment"
                      {...register('comment')}
                      placeholder="Дополнительная информация"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="ageConfirmed"
                      onCheckedChange={(checked) => setValue('ageConfirmed', checked as boolean)}
                    />
                    <Label
                      htmlFor="ageConfirmed"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Подтверждаю, что мне исполнилось 18 лет *
                    </Label>
                  </div>
                  {errors.ageConfirmed && (
                    <p className="text-sm text-destructive">{errors.ageConfirmed.message}</p>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Оформляется...' : 'Оформить заказ'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    После оформления заказа с вами свяжется менеджер для подтверждения деталей
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}