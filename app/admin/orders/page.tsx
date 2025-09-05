'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { OrderStats } from '@/components/admin/order-stats';
import { EditOrderDialog } from '@/components/admin/edit-order-dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Search,
  Eye,
  Edit,
  Calendar,
  Phone,
  User,
  Truck,
  Store,
} from 'lucide-react';
import Link from 'next/link';

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
  created_at: string;
  items?: any[];
}

interface OrderStats {
  total: number;
  created: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    created: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select(
          'id, customer_name, customer_phone, customer_contact, contact_method, total_amount, delivery_cost, discount_amount, status, comment, delivery_method, delivery_address, created_at'
        )
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        query = query.or(
          `customer_name.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query.range(
        (currentPage - 1) * 10,
        currentPage * 10 - 1
      );

      if (error) throw error;

      setOrders(data || []);

      // Получаем общее количество для пагинации
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      setTotalPages(Math.ceil((count || 0) / 10));
    } catch (error) {
      toast.error('Ошибка при загрузке заказов');
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, total_amount');

      if (error) throw error;

      const stats = {
        total: data.length,
        created: data.filter(o => o.status === 'created').length,
        in_progress: data.filter(o => o.status === 'in_progress').length,
        completed: data.filter(o => o.status === 'completed').length,
        cancelled: data.filter(o => o.status === 'cancelled').length,
        totalRevenue: data.reduce((sum, order) => sum + order.total_amount, 0),
      };

      setStats(stats);
    } catch (error) {
      toast.error('Ошибка при загрузке статистики');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (order: Order, newStatus: string) => {
    if (newStatus === 'completed') {
      try {
        // Use the API endpoint that properly handles the relationship
        const response = await fetch(`/api/orders/${order.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const orderWithItems = await response.json();
        console.log('order with items data', orderWithItems);

        setSelectedOrder({ ...order, items: orderWithItems.items });
        setIsModalOpen(true);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast.error('Ошибка при загрузке товаров заказа');
      }
    } else {
      updateOrderStatus(order.id, newStatus);
    }
  };

  const updateOrder = async (values: any) => {
    if (!selectedOrder) return;

    console.log("Updating order with values:", values);

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      toast.success('Заказ обновлен');
      loadOrders();
      loadStats();
      setIsModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Ошибка при обновлении заказа');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Статус заказа обновлен');
      loadOrders();
      loadStats();
    } catch (error) {
      toast.error('Ошибка при обновлении статуса');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      created: {
        label: 'Новый',
        variant: 'default' as const,
        color: 'bg-blue-100 text-blue-800',
      },
      in_progress: {
        label: 'В обработке',
        variant: 'secondary' as const,
        color: 'bg-yellow-100 text-yellow-800',
      },
      completed: {
        label: 'Завершен',
        variant: 'default' as const,
        color: 'bg-green-100 text-green-800',
      },
      cancelled: {
        label: 'Отменен',
        variant: 'destructive' as const,
        color: 'bg-red-100 text-red-800',
      },
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

  return (
    <div className="bg-muted/50 min-h-screen">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Управление заказами</h1>
            <Button asChild variant="outline">
              <Link href="/admin">← Назад к дашборду</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8">
          <OrderStats stats={stats} />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute left-3 top-3 size-4" />
                <Input
                  placeholder="Поиск по имени или телефону..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Статус заказа" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="created">Новые</SelectItem>
                  <SelectItem value="in_progress">В обработке</SelectItem>
                  <SelectItem value="completed">Завершенные</SelectItem>
                  <SelectItem value="cancelled">Отмененные</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setCurrentPage(1);
                }}
              >
                Сбросить фильтры
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Список заказов</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Заказ</TableHead>
                  <TableHead>Клиент</TableHead>
                  <TableHead>Контакты</TableHead>
                  <TableHead>Доставка</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="text-muted-foreground size-4" />
                        {order.customer_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Phone className="text-muted-foreground size-4" />
                          {order.customer_phone}
                        </div>
                        {order.customer_contact && (
                          <div className="text-muted-foreground text-sm">
                            {order.contact_method === 'telegram' ? '📱' : '📞'}{' '}
                            {order.customer_contact}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {order.delivery_method === 'delivery' ? (
                          <>
                            <Truck className="size-4 text-blue-600" />
                            <div>
                              <div className="font-medium">🚚 Доставка</div>
                              {order.delivery_address && (
                                <div className="text-muted-foreground max-w-32 truncate text-sm">
                                  {order.delivery_address}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <Store className="size-4 text-green-600" />
                            <div className="font-medium">🏬 Самовывоз</div>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {(
                            order.total_amount - order.discount_amount
                          ).toLocaleString('ru-RU')}{' '}
                          ₽
                        </div>
                        {order.discount_amount > 0 && (
                          <div className="text-sm text-green-600">
                            Скидка:{' '}
                            {order.discount_amount.toLocaleString('ru-RU')} ₽
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={value =>
                          handleStatusChange(order, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="created">Новый</SelectItem>
                          <SelectItem value="in_progress">
                            В обработке
                          </SelectItem>
                          <SelectItem value="completed">Завершен</SelectItem>
                          <SelectItem value="cancelled">Отменен</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground size-4" />
                        {formatDate(order.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {orders.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Заказов не найдено</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={
                      currentPage === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
      {selectedOrder && (
        <EditOrderDialog
          order={{
            ...selectedOrder,
            customer_contact: selectedOrder.customer_contact || undefined,
            comment: selectedOrder.comment || undefined,
            items: selectedOrder.items || [],
          }}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSave={updateOrder}
        />
      )}
    </div>
  );
}
