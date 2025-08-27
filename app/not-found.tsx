import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center space-y-6 px-4 max-w-2xl mx-auto">
        <div className="relative w-64 h-64 mx-auto">
          <Image
            src="https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="404 - Страница не найдена"
            fill
            className="object-cover rounded-full opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-primary">404</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-primary">
            Страница не найдена
          </h1>
          <p className="text-lg text-muted-foreground">
            К сожалению, запрашиваемая страница не существует или была перемещена
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/catalog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Каталог товаров
            </Link>
          </Button>
        </div>

        <div className="pt-8">
          <p className="text-sm text-muted-foreground">
            Если вы считаете, что это ошибка, используйте форму консультации на сайте
          </p>
        </div>
      </div>
    </div>
  )
}