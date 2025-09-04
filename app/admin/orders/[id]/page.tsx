'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Package,
  DollarSign,
  MessageCircle,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Store,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_contact: string | null;
  contact_method: 'telegram' | 'whatsapp' | null;
  total_amount: number;
  delivery_cost: number;
  discount_amount: number;
  status: 'created' | 'in_progress' | 'completed' | 'cancelled';
  comment: string | null;
  delivery_method: 'delivery' | 'pickup';
  delivery_address: string | null;
  age_confirmed: boolean;
  created_at: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const loadOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to load order');
      }

      const orderData = await response.json();
      setOrder(orderData);
    } catch (error) {
      toast.error('Ошибка при загрузке заказа');
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      toast.success('Статус заказа обновлен');
    } catch (error) {
      toast.error('Ошибка при обновлении статуса');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Package className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      created: { label: 'Новый', variant: 'default' as const },
      in_progress: { label: 'В обработке', variant: 'secondary' as const },
      completed: { label: 'Завершен', variant: 'default' as const },
      cancelled: { label: 'Отменен', variant: 'destructive' as const },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.created;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Заказ не найден</p>
          <Button asChild className="mt-4">
            <Link href="/admin/orders">Вернуться к списку</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/orders">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Назад
                </Link>
              </Button>
              <h1 className="text-2xl font-bold">
                Заказ #{order.id.slice(0, 8)}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              {getStatusBadge(order.status)}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            {/* Информация о клиенте */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Информация о клиенте
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Имя
                    </label>
                    <p className="font-medium">{order.customer_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Телефон
                    </label>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {order.customer_phone}
                    </p>
                  </div>
                </div>

                {order.customer_contact && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {order.contact_method === 'telegram'
                        ? 'Telegram'
                        : 'WhatsApp'}
                    </label>
                    <p className="font-medium flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      {order.customer_contact}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Дата заказа
                  </label>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(order.created_at)}
                  </p>
                </div>

                {order.comment && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Комментарий
                    </label>
                    <p className="text-sm bg-muted p-3 rounded-md">
                      {order.comment}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Подтверждение возраста
                  </label>
                  <p className="font-medium">
                    {order.age_confirmed ? (
                      <span className="text-green-600 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Подтверждено
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Не подтверждено
                      </span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Товары в заказе */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Товары в заказе
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={
                            item.product.images?.[0] ||
                            '/placeholder-product.jpg'
                          }
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Количество: {item.quantity} шт.
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-medium">
                          {item.price_at_time.toLocaleString('ru-RU')} ₽
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Итого:{' '}
                          {(item.price_at_time * item.quantity).toLocaleString(
                            'ru-RU'
                          )}{' '}
                          ₽
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Информация о доставке */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {order.delivery_method === 'delivery' ? (
                    <Truck className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Store className="h-5 w-5 text-green-600" />
                  )}
                  Информация о доставке
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Способ получения
                  </label>
                  <p className="font-medium flex items-center gap-2">
                    {order.delivery_method === 'delivery' ? (
                      <>
                        <Truck className="h-4 w-4 text-blue-600" />
                        🚚 Доставка
                      </>
                    ) : (
                      <>
                        <Store className="h-4 w-4 text-green-600" />
                        🏬 Самовывоз
                      </>
                    )}
                  </p>
                </div>

                {order.delivery_method === 'delivery' &&
                  order.delivery_address && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Адрес доставки
                      </label>
                      <p className="font-medium flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        {order.delivery_address}
                      </p>
                    </div>
                  )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Стоимость доставки
                  </label>
                  <p className="font-medium">
                    {order.delivery_cost === 0 ? (
                      <span className="text-green-600">Бесплатно</span>
                    ) : (
                      `${order.delivery_cost.toLocaleString('ru-RU')} ₽`
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Статус заказа */}
            <Card>
              <CardHeader>
                <CardTitle>Статус заказа</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={order.status}
                  onValueChange={updateOrderStatus}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created">Новый</SelectItem>
                    <SelectItem value="in_progress">В обработке</SelectItem>
                    <SelectItem value="completed">Завершен</SelectItem>
                    <SelectItem value="cancelled">Отменен</SelectItem>
                  </SelectContent>
                </Select>

                {updating && (
                  <p className="text-sm text-muted-foreground">Обновление...</p>
                )}
              </CardContent>
            </Card>

            {/* Итоговая сумма */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Итоговая сумма
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Товары:</span>
                  <span>{order.total_amount.toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="flex justify-between">
                  <span>Доставка:</span>
                  <span>{order.delivery_cost.toLocaleString('ru-RU')} ₽</span>
                </div>

                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Скидка:</span>
                    <span>
                      -{order.discount_amount.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>К оплате:</span>
                  <span>
                    {(
                      order.total_amount +
                      order.delivery_cost -
                      order.discount_amount
                    ).toLocaleString('ru-RU')}{' '}
                    ₽
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
