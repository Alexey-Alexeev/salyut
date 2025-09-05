'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { X, Plus, Trash2, ShoppingCart, User, Search } from 'lucide-react';

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const formSchema = z.object({
  delivery_method: z.enum(['delivery', 'pickup'], { message: 'Выберите способ доставки' }),
  delivery_cost: z.number().min(0, 'Стоимость доставки не может быть отрицательной'),
  has_manual_discount: z.boolean(),
  discount_amount: z.number().min(0, 'Скидка не может быть отрицательной'),
  comment: z.string().optional(), // User comment - read only
  admin_comment: z.string().optional(), // Admin comment - editable
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // For search functionality
  const [searchTerm, setSearchTerm] = useState(''); // Search term for products
  const [selectedProductId, setSelectedProductId] = useState<string>(''); // For controlling Select value
  const [orderItems, setOrderItems] = useState<OrderItem[]>(order.items || []);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null); // Ref for search input

  // Constants from cart page
  const DISCOUNT_THRESHOLD_1 = 7000; // 5% discount
  const DISCOUNT_THRESHOLD_2 = 15000; // 10% discount

  // Мемоизированная функция для загрузки продуктов
  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, images')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []); // Initialize filtered products
    } catch (error) {
      toast.error('Ошибка при загрузке продуктов');
      console.error('Error fetching products:', error);
    }
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      // Reset order items when opening dialog
      setOrderItems(order.items || []);

      // Reset form with current order data
      form.reset({
        delivery_method: order.delivery_method || 'delivery',
        delivery_cost: typeof order.delivery_cost === 'number' ? order.delivery_cost : 0,
        has_manual_discount: order.discount_amount > 0,
        discount_amount: typeof order.discount_amount === 'number' ? order.discount_amount : 0,
        comment: order.comment || undefined,
        admin_comment: undefined, // Will be populated from completed order if exists
      });
    }
  }, [isOpen, fetchProducts, order]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      delivery_method: order.delivery_method || 'delivery',
      delivery_cost: typeof order.delivery_cost === 'number' ? order.delivery_cost : 0,
      has_manual_discount: order.discount_amount > 0,
      discount_amount: typeof order.discount_amount === 'number' ? order.discount_amount : 0,
      comment: order.comment || undefined, // Use undefined instead of empty string
      admin_comment: undefined, // Will be populated from completed order if exists
    },
  });

  // Расчет итоговой суммы
  const subtotalAmount = orderItems.reduce(
    (acc, item) => acc + item.price_at_time * item.quantity,
    0
  );

  const deliveryCost = form.watch('delivery_cost') || 0;
  const hasManualDiscount = form.watch('has_manual_discount');
  const manualDiscountAmount = form.watch('discount_amount') || 0;

  // Calculate automatic discount based on subtotal (like in cart)
  const automaticDiscountRate = subtotalAmount >= DISCOUNT_THRESHOLD_2 ? 0.1 :
    subtotalAmount >= DISCOUNT_THRESHOLD_1 ? 0.05 : 0;
  const automaticDiscountAmount = Math.round(subtotalAmount * automaticDiscountRate);

  // Use manual discount if has_manual_discount is checked, otherwise use automatic
  const actualDiscountAmount = hasManualDiscount ? manualDiscountAmount : automaticDiscountAmount;
  const finalAmount = subtotalAmount + deliveryCost - actualDiscountAmount;

  // Focus search input when dropdown opens (using a workaround since we can't directly detect dropdown open)
  useEffect(() => {
    if (searchInputRef.current && searchTerm === '') {
      // Small delay to ensure the dropdown is open
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchTerm]);

  const handleAddProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const existingItemIndex = orderItems.findIndex(item => item.product.id === productId);

      if (existingItemIndex >= 0) {
        // Увеличиваем количество существующего товара
        const newItems = [...orderItems];
        newItems[existingItemIndex].quantity += 1;
        setOrderItems(newItems);
      } else {
        // Добавляем новый товар
        const newItem: OrderItem = {
          id: Math.random().toString(),
          product,
          quantity: 1,
          price_at_time: product.price
        };
        setOrderItems([...orderItems, newItem]);
      }

      // Reset search term and selected product after selection
      setSearchTerm('');
      setSelectedProductId(''); // This will reset the Select to show placeholder
    }
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const newItems = [...orderItems];
    newItems[index].quantity = newQuantity;
    setOrderItems(newItems);
  };

  const updatePrice = (index: number, newPrice: number) => {
    if (newPrice < 0) return;

    const newItems = [...orderItems];
    newItems[index].price_at_time = newPrice;
    setOrderItems(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newItems);
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
        items: orderItems.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
        })),
        delivery_cost: Number(values.delivery_cost),
        total_amount: Number(finalAmount),
        comment: values.comment || null,
        admin_comment: values.admin_comment || null, // Add admin comment
        discount_amount: Number(actualDiscountAmount),
        has_discount: values.has_manual_discount || actualDiscountAmount > 0,
        status: 'completed',
      };

      console.log('Submitting order update with payload:', payload);

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

        <ScrollArea className="max-h-[70vh] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Information - Read Only */}
              <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
                <CardContent className="pt-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-orange-800">
                    <User className="size-5" />
                    Информация о клиенте (из оригинального заказа)
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
                          {order.contact_method === 'telegram' ? '📱 Telegram' :
                            order.contact_method === 'whatsapp' ? '📞 WhatsApp' :
                              order.contact_method === 'phone' ? '☎️ Телефон' :
                                '☎️ Телефон'}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm italic text-orange-600">
                    ℹ️ Данные клиента берутся из оригинального заказа и не могут быть изменены
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

              {/* Товары в заказе */}
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
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="size-8 p-0"
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(index, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 text-center text-sm"
                            min={1}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="size-8 p-0"
                          >
                            +
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-destructive hover:text-destructive size-8 p-0"
                          >
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

                  {/* Добавление товара */}
                  <div className="mt-4">
                    <FormLabel>Добавить товар</FormLabel>
                    <Select
                      value={selectedProductId}
                      onValueChange={(value) => {
                        handleAddProduct(value);
                      }}
                      onOpenChange={(open) => {
                        // Focus search input when dropdown opens
                        if (open && searchInputRef.current) {
                          setTimeout(() => {
                            if (searchInputRef.current) {
                              searchInputRef.current.focus();
                            }
                          }, 50);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите товар для добавления" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              ref={searchInputRef}
                              placeholder="Поиск товаров..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-8"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onKeyDown={(e) => {
                                e.stopPropagation();
                                // Prevent closing dropdown on Enter
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </div>
                        </div>
                        <Separator />
                        <ScrollArea className="h-60">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                              <SelectItem key={product.id} value={product.id}>
                                <div className="flex flex-col items-start w-full py-2">
                                  <span className="text-sm font-medium w-full break-words">{product.name}</span>
                                  <span className="text-xs text-gray-500 mt-1">
                                    {product.price.toLocaleString('ru-RU')} ₽
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              Товары не найдены
                            </div>
                          )}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Стоимость доставки и скидки */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">Стоимость и скидки</h3>

                  <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="delivery_cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Стоимость доставки</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value || ''}
                              min={0}
                              placeholder="0"
                              onChange={(e) => {
                                const value = Math.max(0, parseInt(e.target.value) || 0);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="has_manual_discount"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Применить скидку</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch('has_manual_discount') && (
                    <FormField
                      control={form.control}
                      name="discount_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Сумма скидки</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={field.value || ''}
                              min={0}
                              placeholder="0"
                              onChange={(e) => {
                                const value = Math.max(0, parseInt(e.target.value) || 0);
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Комментарий администратора */}
              <FormField
                control={form.control}
                name="admin_comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Комментарий администратора</FormLabel>
                    <FormControl>
                      <Textarea
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="Комментарии и заметки для внутреннего использования..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Итоговая сумма */}
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
                        {subtotalAmount < DISCOUNT_THRESHOLD_1 ? (
                          `До скидки 5% осталось ${(DISCOUNT_THRESHOLD_1 - subtotalAmount).toLocaleString('ru-RU')} ₽`
                        ) : subtotalAmount < DISCOUNT_THRESHOLD_2 ? (
                          `До скидки 10% осталось ${(DISCOUNT_THRESHOLD_2 - subtotalAmount).toLocaleString('ru-RU')} ₽`
                        ) : null}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || orderItems.length === 0}
                  className="min-w-[120px]"
                >
                  {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}