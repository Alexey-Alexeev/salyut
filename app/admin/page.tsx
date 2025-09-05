'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadDashboardData();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // Проверяем роль пользователя
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      toast.error('У вас нет доступа к административной панели');
      router.push('/admin/login');
    }
  };

  const loadDashboardData = async () => {
    try {
      // Загружаем статистику
      const [productsResult, ordersResult] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('orders').select('*'),
      ]);

      const orders = ordersResult.data || [];
      const totalRevenue = orders.reduce(
        (sum, order) => sum + order.total_amount,
        0
      );
      const pendingOrders = orders.filter(
        order => order.status === 'created'
      ).length;

      setStats({
        totalProducts: productsResult.count || 0,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
      });

      // Загружаем последние заказы
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentOrders(recentOrdersData || []);
    } catch (error) {
      toast.error('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    toast.success('Выход выполнен');
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
            <h1 className="text-2xl font-bold">Админ-панель</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 size-4" />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Товары</CardTitle>
              <Package className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-muted-foreground text-xs">
                Всего товаров в каталоге
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Заказы</CardTitle>
              <ShoppingCart className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-muted-foreground text-xs">Всего заказов</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Выручка</CardTitle>
              <DollarSign className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalRevenue.toLocaleString('ru-RU')} ₽
              </div>
              <p className="text-muted-foreground text-xs">Общая выручка</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ожидают</CardTitle>
              <TrendingUp className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-muted-foreground text-xs">Новых заказов</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Button asChild className="h-20">
            <Link href="/admin/products">
              <Plus className="mr-2 size-6" />
              Добавить товар
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20">
            <Link href="/admin/orders">
              <Eye className="mr-2 size-6" />
              Просмотр заказов
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-20">
            <Link href="/admin/categories">
              <Edit className="mr-2 size-6" />
              Управление категориями
            </Link>
          </Button>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Последние заказы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-muted-foreground text-sm">
                      {order.total_amount.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}

              {recentOrders.length === 0 && (
                <p className="text-muted-foreground py-8 text-center">
                  Заказов пока нет
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
