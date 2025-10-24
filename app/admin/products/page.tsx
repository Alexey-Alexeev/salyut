'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    price: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Товар создан и отправлен в Яндекс!');
        setFormData({ name: '', slug: '', price: '', description: '' });
      } else {
        toast.error('Ошибка создания товара');
      }
    } catch (error) {
      toast.error('Ошибка при создании товара');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlugChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    setFormData(prev => ({ ...prev, name, slug }));
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Создание товара с IndexNow</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Название товара</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="Например: Петарда Гром"
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">URL slug (автозаполняется)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="petarda-grom"
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Цена (руб.)</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="1500"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Описание товара..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Создаем товар...' : 'Создать товар и отправить в Яндекс'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">Что происходит при создании:</h3>
            <ol className="mt-2 text-sm text-blue-800 space-y-1">
              <li>1. Товар сохраняется в базе данных</li>
              <li>2. Автоматически отправляется в Яндекс через IndexNow</li>
              <li>3. Яндекс индексирует новую страницу /product/{"{slug}"}</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
