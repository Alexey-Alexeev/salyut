import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="mx-auto max-w-2xl space-y-6 px-4 text-center">
        <div className="relative mx-auto size-64">
          <Image
            src="https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="404 - Страница не найдена"
            fill
            className="rounded-full object-cover opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-primary text-6xl font-bold">404</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-primary text-4xl font-bold">
            Страница не найдена
          </h1>
          <p className="text-muted-foreground text-lg">
            К сожалению, запрашиваемая страница не существует или была
            перемещена
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 size-4" />
              На главную
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/catalog">
              <ArrowLeft className="mr-2 size-4" />
              Каталог товаров
            </Link>
          </Button>
        </div>

        <div className="pt-8">
          <p className="text-muted-foreground text-sm">
            Если вы считаете, что это ошибка, используйте форму консультации на
            сайте
          </p>
        </div>
      </div>
    </div>
  );
}
