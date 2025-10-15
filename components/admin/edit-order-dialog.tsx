'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ShoppingCart, User, Trash2, Search as SearchIcon, ChevronsUpDown, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const formSchema = z.object({
  delivery_method: z.enum(['delivery', 'pickup'], { message: 'Выберите способ доставки' }),
  delivery_cost: z.number().min(0, 'Стоимость доставки не может быть отрицательной'),
  has_manual_discount: z.boolean(),
  discount_amount: z.number().min(0, 'Скидка не может быть отрицательной'),
  comment: z.string().optional(),
  admin_comment: z.string().optional(),
});

interface Product {
  id: string;
  name: string;
  price: number;
  images?: string[];
}

interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price_at_time: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_contact?: string | null;
  contact_method?: 'telegram' | 'whatsapp' | 'phone' | null;
  delivery_method: 'delivery' | 'pickup';
  delivery_cost: number;
  discount_amount: number;
  items: OrderItem[];
  comment?: string | null;
}

interface EditOrderDialogProps {
  order: Order;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
}

export function EditOrderDialog({ order, isOpen, onOpenChange, onSave }: EditOrderDialogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>(order.items || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isProductPopoverOpen, setIsProductPopoverOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const productsListRef = useRef<HTMLDivElement | null>(null);

  const DISCOUNT_THRESHOLD_1 = 40000; // 5% discount + подарок
  const DISCOUNT_THRESHOLD_2 = 60000; // 10% discount + подарок
  const GIFT_THRESHOLD = 10000; // подарок от 10000

  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, images')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      toast.error('Ошибка при загрузке продуктов');
      console.error('Error fetching products:', error);
    }
  }, []);

  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[ёЁ]/g, 'е')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\u2de0-\u2dff\ufe20-\ufe2f]/g, '')
      .trim();

  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }
    const q = normalize(searchTerm);
    const filtered = products.filter((p) => normalize(p.name).includes(q));
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      delivery_method: order.delivery_method || 'delivery',
      delivery_cost: typeof order.delivery_cost === 'number' ? order.delivery_cost : 0,
      has_manual_discount: order.discount_amount > 0,
      discount_amount: typeof order.discount_amount === 'number' ? order.discount_amount : 0,
      comment: order.comment || undefined,
      admin_comment: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      setOrderItems(order.items || []);
      form.reset({
        delivery_method: order.delivery_method || 'delivery',
        delivery_cost: typeof order.delivery_cost === 'number' ? order.delivery_cost : 0,
        has_manual_discount: order.discount_amount > 0,
        discount_amount: typeof order.discount_amount === 'number' ? order.discount_amount : 0,
        comment: order.comment || undefined,
        admin_comment: undefined,
      });
    }
  }, [isOpen, fetchProducts, order, form]);

  useEffect(() => {
    if (isProductPopoverOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
      setSelectedProductId('');
    }
  }, [isProductPopoverOpen]);

  // Обработчик для скролла внутри поповера
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (productsListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = productsListRef.current;
      const isAtTop = scrollTop === 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;

      if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
        e.stopPropagation();
      }
    }
  }, []);

  const subtotalAmount = orderItems.reduce((acc, item) => acc + item.price_at_time * item.quantity, 0);
  const deliveryCost = form.watch('delivery_cost') || 0;
  const hasManualDiscount = form.watch('has_manual_discount');
  const manualDiscountAmount = form.watch('discount_amount') || 0;

  const automaticDiscountRate =
    subtotalAmount >= DISCOUNT_THRESHOLD_2 ? 0.1 :
      subtotalAmount >= DISCOUNT_THRESHOLD_1 ? 0.05 : 0;
  const automaticDiscountAmount = Math.round(subtotalAmount * automaticDiscountRate);
  const actualDiscountAmount = hasManualDiscount ? manualDiscountAmount : automaticDiscountAmount;
  const finalAmount = subtotalAmount + deliveryCost - actualDiscountAmount;

  const handleAddProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItemIndex = orderItems.findIndex((item) => item.product.id === productId);
    if (existingItemIndex >= 0) {
      const newItems = [...orderItems];
      newItems[existingItemIndex].quantity += 1;
      setOrderItems(newItems);
    } else {
      const newItem: OrderItem = {
        id: Math.random().toString(),
        product,
        quantity: 1,
        price_at_time: product.price,
      };
      setOrderItems([...orderItems, newItem]);
    }

    setSearchTerm('');
    setSelectedProductId('');
    setIsProductPopoverOpen(false);
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const newItems = [...orderItems];
    newItems[index].quantity = newQuantity;
    setOrderItems(newItems);
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (orderItems.length === 0) {
      toast.error('Добавьте хотя бы один товар в заказ');
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_contact: order.customer_contact || null,
        contact_method: order.contact_method || null,
        delivery_method: values.delivery_method,
        items: orderItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
        })),
        delivery_cost: Number(values.delivery_cost),
        total_amount: Number(finalAmount),
        comment: values.comment || null,
        admin_comment: values.admin_comment || null,
        discount_amount: Number(actualDiscountAmount),
        has_discount: values.has_manual_discount || actualDiscountAmount > 0,
        status: 'completed',
      };

      await onSave(payload);
    } catch (error) {
      toast.error('Ошибка при сохранении заказа');
      console.error('Error saving order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <ShoppingCart className="size-6" />
            Редактирование заказа
          </DialogTitle>
          <DialogDescription>
            Проверьте и откорректируйте состав заказа, стоимость доставки и скидки
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Клиентские данные */}
              <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
                <CardContent className="pt-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-orange-800">
                    <User className="size-5" />
                    Информация о клиенте
                  </h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-orange-700">Имя клиента</Label>
                      <div className="rounded-md border border-orange-200 bg-white/70 p-3 font-medium">
                        {order.customer_name}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-orange-700">Телефон</Label>
                      <div className="rounded-md border border-orange-200 bg-white/70 p-3 font-medium">
                        {order.customer_phone}
                      </div>
                    </div>
                    {order.customer_contact && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-orange-700">Контакт для связи</Label>
                        <div className="rounded-md border border-orange-200 bg-white/70 p-3 font-medium">
                          {order.customer_contact}
                        </div>
                      </div>
                    )}
                    {order.contact_method && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-orange-700">Способ связи</Label>
                        <div className="rounded-md border border-orange-200 bg-white/70 p-3 font-medium capitalize">
                          {order.contact_method === 'telegram'
                            ? '📱 Telegram'
                            : order.contact_method === 'whatsapp'
                              ? '📞 WhatsApp'
                              : order.contact_method === 'phone'
                                ? '☎️ Телефон'
                                : '☎️ Телефон'}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm italic text-orange-600">
                    ℹ️ Данные клиента берутся из оригинального заказа
                  </p>
                  {order.comment && (
                    <div className="mt-4 space-y-2">
                      <Label className="text-sm font-medium text-orange-700">Комментарий клиента</Label>
                      <div className="rounded-md border border-orange-200 bg-white/70 p-3">
                        {order.comment}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Способ доставки */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">Способ доставки</h3>
                  <FormField
                    control={form.control}
                    name="delivery_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Способ доставки *</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите способ доставки" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="delivery">Доставка</SelectItem>
                              <SelectItem value="pickup">Самовывоз</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Товары */}
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Товары в заказе</h3>
                    <Badge variant="secondary">{orderItems.length} товаров</Badge>
                  </div>

                  <div className="mb-4 space-y-3">
                    {orderItems.map((item, index) => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border p-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground mt-1 sm:mt-0">
                            {item.price_at_time.toLocaleString('ru-RU')} ₽ × {item.quantity} =
                            <span className="font-semibold ml-1">
                              {(item.price_at_time * item.quantity).toLocaleString('ru-RU')} ₽
                            </span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => updateQuantity(index, item.quantity - 1)} disabled={item.quantity <= 1} className="size-8 p-0">-</Button>
                          <Input type="number" value={item.quantity} onChange={(e) => updateQuantity(index, Math.max(1, parseInt(e.target.value) || 1))} className="w-16 text-center text-sm" min={1} />
                          <Button type="button" variant="outline" size="sm" onClick={() => updateQuantity(index, item.quantity + 1)} className="size-8 p-0">+</Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-destructive hover:text-destructive size-8 p-0">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {orderItems.length === 0 && (
                      <div className="text-muted-foreground py-8 text-center">
                        <ShoppingCart className="mx-auto mb-2 size-12 opacity-50" />
                        <p>Нет товаров в заказе</p>
                      </div>
                    )}
                  </div>

                  {/* Добавление товара - кастомная реализация */}
                  <div className="mt-4">
                    <FormLabel>Добавить товар</FormLabel>
                    <Popover open={isProductPopoverOpen} onOpenChange={setIsProductPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          <span className="truncate">
                            {selectedProductId
                              ? products.find((p) => p.id === selectedProductId)?.name
                              : "Выберите товар для добавления"}
                          </span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] p-0"
                        align="start"
                        onWheel={handleWheel}
                        onInteractOutside={(e) => {
                          // Предотвращаем закрытие при клике на скроллбар
                          if (e.target instanceof Element && e.target.closest('[class*="scrollbar"]')) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <div className="p-2 border-b">
                          <div className="relative">
                            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              ref={searchInputRef}
                              placeholder="Поиск товаров..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-8"
                            />
                            {searchTerm && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-1 top-1 h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div
                          ref={productsListRef}
                          className="max-h-[250px] overflow-y-auto"
                          style={{
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#cbd5e1 #f1f5f9'
                          }}
                        >
                          {filteredProducts.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              Товары не найдены
                            </div>
                          ) : (
                            <div className="p-1">
                              {filteredProducts.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                                  onClick={() => handleAddProduct(product.id)}
                                >
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="font-medium truncate">{product.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {product.price.toLocaleString("ru-RU")} ₽
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              {/* Остальные секции остаются без изменений */}
              {/* Доставка и скидки */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">Стоимость и скидки</h3>
                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="delivery_cost" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Стоимость доставки</FormLabel>
                        <FormControl>
                          <Input type="number" value={field.value || ''} min={0} placeholder="0" onChange={(e) => field.onChange(Math.max(0, parseInt(e.target.value) || 0))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="has_manual_discount" render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Применить скидку</FormLabel>
                        </div>
                      </FormItem>
                    )} />
                  </div>

                  {form.watch('has_manual_discount') && (
                    <FormField control={form.control} name="discount_amount" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Сумма скидки</FormLabel>
                        <FormControl>
                          <Input type="number" value={field.value || ''} min={0} placeholder="0" onChange={(e) => field.onChange(Math.max(0, parseInt(e.target.value) || 0))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                </CardContent>
              </Card>

              {/* Админ-комментарий */}
              <FormField control={form.control} name="admin_comment" render={({ field }) => (
                <FormItem>
                  <FormLabel>Комментарий администратора</FormLabel>
                  <FormControl>
                    <Textarea value={field.value || ''} onChange={field.onChange} placeholder="Комментарии и заметки для внутреннего использования..." className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Итог */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">Итоговый расчет</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Сумма товаров:</span>
                      <span className="font-medium">{subtotalAmount.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Доставка:</span>
                      <span className="font-medium">{deliveryCost.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    {actualDiscountAmount > 0 && (
                      <div className="text-destructive flex justify-between">
                        <span>Скидка{hasManualDiscount ? ' (вручную)' : automaticDiscountRate > 0 ? ` (авто ${Math.round(automaticDiscountRate * 100)}%)` : ''}:</span>
                        <span className="font-medium">-{actualDiscountAmount.toLocaleString('ru-RU')} ₽</span>
                      </div>
                    )}
                    {!hasManualDiscount && automaticDiscountRate === 0 && subtotalAmount > 0 && (
                      <div className="text-muted-foreground text-sm">
                        {subtotalAmount < GIFT_THRESHOLD
                          ? `До подарка осталось ${(GIFT_THRESHOLD - subtotalAmount).toLocaleString('ru-RU')} ₽`
                          : subtotalAmount < DISCOUNT_THRESHOLD_1
                            ? `До скидки 5% осталось ${(DISCOUNT_THRESHOLD_1 - subtotalAmount).toLocaleString('ru-RU')} ₽`
                            : subtotalAmount < DISCOUNT_THRESHOLD_2
                              ? `До скидки 10% осталось ${(DISCOUNT_THRESHOLD_2 - subtotalAmount).toLocaleString('ru-RU')} ₽`
                              : null}
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Итого к оплате:</span>
                      <span className="text-primary">{finalAmount.toLocaleString('ru-RU')} ₽</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <DialogFooter className="bg-background sticky bottom-0 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Отмена</Button>
                <Button type="submit" disabled={isLoading || orderItems.length === 0} className="min-w-[120px]">
                  {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}