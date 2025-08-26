'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  DollarSign 
} from 'lucide-react'

interface OrderStats {
  total: number
  created: number
  in_progress: number
  completed: number
  cancelled: number
  totalRevenue: number
}

interface OrderStatsProps {
  stats: OrderStats
}

export function OrderStats({ stats }: OrderStatsProps) {
  const statsCards = [
    {
      title: 'Всего заказов',
      value: stats.total,
      icon: ShoppingCart,
      description: 'За все время',
      color: 'text-blue-600'
    },
    {
      title: 'Новые заказы',
      value: stats.created,
      icon: Clock,
      description: 'Ожидают обработки',
      color: 'text-orange-600'
    },
    {
      title: 'В обработке',
      value: stats.in_progress,
      icon: TrendingUp,
      description: 'Выполняются',
      color: 'text-yellow-600'
    },
    {
      title: 'Завершенные',
      value: stats.completed,
      icon: CheckCircle,
      description: 'Успешно выполнены',
      color: 'text-green-600'
    },
    {
      title: 'Отмененные',
      value: stats.cancelled,
      icon: XCircle,
      description: 'Отменены',
      color: 'text-red-600'
    },
    {
      title: 'Общая выручка',
      value: `${(stats.totalRevenue / 100).toLocaleString('ru-RU')} ₽`,
      icon: DollarSign,
      description: 'За все время',
      color: 'text-green-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
