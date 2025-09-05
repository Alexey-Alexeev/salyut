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
import { EditOrderDialog } from '@/components/admin/edit-order-dialog';

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  product: {
    id: string;
    name: string;
    price: number;
    images?: string[];
  };
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_contact?: string;
  contact_method: 'telegram' | 'whatsapp' | null;
  total_amount: number;
  delivery_cost: number;
  discount_amount: number;
  status: 'created' | 'in_progress' | 'completed' | 'cancelled';
  comment?: string;
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleStatusChange = (newStatus: string) => {
    console.log("handleStatusChange called with:", newStatus);
    if (newStatus === 'completed') {
      console.log("setting isModalOpen to true");
      setIsModalOpen(true);
    } else {
      updateOrderStatus(newStatus);
    }
  };

  const updateOrder = async (values: any) => {
    if (!order) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...values, status: 'completed' }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      toast.success('Заказ обновлен');
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Ошибка при обновлении заказа');
    } finally {
      setUpdating(false);
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
        return <Clock className="size-4" />;
      case 'in_progress':
        return <Package className="size-4" />;
      case 'completed':
        return <CheckCircle className="size-4" />;
      case 'cancelled':
        return <XCircle className="size-4" />;
      default:
        return <Clock className="size-4" />;
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 size-8 animate-spin rounded-full border-b-2"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
    <>
      <div className="bg-muted/50 min-h-screen">
        {/* Header */}
        <header className="border-b bg-white">
          <div className="container mx-auto p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/admin/orders">
                    <ArrowLeft className="mr-2 size-4" />
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
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Основная информация */}
            <div className="space-y-6 lg:col-span-2">
              {/* Информация о клиенте */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="size-5" />
                    Информация о клиенте
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Имя
                      </label>
                      <p className="font-medium">{order.customer_name}</p>
                    </div>
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Телефон
                      </label>
                      <p className="flex items-center gap-2 font-medium">
                        <Phone className="size-4" />
                        {order.customer_phone}
                      </p>
                    </div>
                  </div>

                  {order.customer_contact && (
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        {order.contact_method === 'telegram'
                          ? 'Telegram'
                          : 'WhatsApp'}
                      </label>
                      <p className="flex items-center gap-2 font-medium">
                        <MessageCircle className="size-4" />
                        {order.customer_contact}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Дата заказа
                    </label>
                    <p className="flex items-center gap-2 font-medium">
                      <Calendar className="size-4" />
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  {order.comment && (
                    <div>
                      <label className="text-muted-foreground text-sm font-medium">
                        Комментарий
                      </label>
                      <p className="bg-muted rounded-md p-3 text-sm">
                        {order.comment}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Подтверждение возраста
                    </label>
                    <p className="font-medium">
                      {order.age_confirmed ? (
                        <span className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="size-4" />
                          Подтверждено
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-red-600">
                          <XCircle className="size-4" />
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
                    <Package className="size-5" />
                    Товары в заказе
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 rounded-lg border p-4"
                      >
                        <div className="relative size-16 overflow-hidden rounded-lg">
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
                          <p className="text-muted-foreground text-sm">
                            Количество: {item.quantity} шт.
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-medium">
                            {item.price_at_time.toLocaleString('ru-RU')} ₽
                          </p>
                          <p className="text-muted-foreground text-sm">
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
                      <Truck className="size-5 text-blue-600" />
                    ) : (
                      <Store className="size-5 text-green-600" />
                    )}
                    Информация о доставке
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
                      Способ получения
                    </label>
                    <p className="flex items-center gap-2 font-medium">
                      {order.delivery_method === 'delivery' ? (
                        <>
                          <Truck className="size-4 text-blue-600" />
                          🚚 Доставка
                        </>
                      ) : (
                        <>
                          <Store className="size-4 text-green-600" />
                          🏬 Самовывоз
                        </>
                      )}
                    </p>
                  </div>

                  {order.delivery_method === 'delivery' &&
                    order.delivery_address && (
                      <div>
                        <label className="text-muted-foreground text-sm font-medium">
                          Адрес доставки
                        </label>
                        <p className="flex items-start gap-2 font-medium">
                          <MapPin className="mt-0.5 size-4 shrink-0 text-blue-600" />
                          {order.delivery_address}
                        </p>
                      </div>
                    )}

                  <div>
                    <label className="text-muted-foreground text-sm font-medium">
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
                    onValueChange={handleStatusChange}
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
                    <p className="text-muted-foreground text-sm">Обновление...</p>
                  )}
                </CardContent>
              </Card>

              {/* Итоговая сумма */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="size-5" />
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
      {order && (
        <EditOrderDialog
          order={order}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSave={updateOrder}
        />
      )}
    </>
  );
}