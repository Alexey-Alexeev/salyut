// components/ConsultationDialog.tsx
'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Send, Phone, MessageCircle } from 'lucide-react';
import { ConsultationSuccessModal } from './consultation-success-modal';
import { createConsultation } from '@/lib/api-client';

interface ConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Необязательный вводный блок, который отображается под заголовком.
   * Используется, например, для exit-intent сообщений.
   */
  introContent?: ReactNode;
  /**
   * Необязательный заголовок. По умолчанию — "Получить бесплатную консультацию".
   */
  title?: string;
  /**
   * Центрировать ли заголовок модалки
   */
  centerTitle?: boolean;
}

export function ConsultationDialog({
  open,
  onOpenChange,
  introContent,
  title,
  centerTitle,
}: ConsultationDialogProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    contactMethod: '',
    contactInfo: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name.trim()) {
      toast.error('Пожалуйста, укажите ваше имя');
      setLoading(false);
      return;
    }

    if (!formData.contactMethod) {
      toast.error('Пожалуйста, выберите способ связи');
      setLoading(false);
      return;
    }

    if (!formData.contactInfo.trim()) {
      const errorMsg =
        formData.contactMethod === 'phone'
          ? 'Укажите номер телефона'
          : formData.contactMethod === 'telegram'
            ? 'Укажите username в Telegram'
            : 'Укажите номер в WhatsApp';
      toast.error(errorMsg);
      setLoading(false);
      return;
    }

    try {
      const result = await createConsultation({
        name: formData.name,
        contactMethod: formData.contactMethod,
        contactInfo: formData.contactInfo,
        message: formData.message,
      });

      if (result.success) {
        // Сохраняем имя клиента для модального окна
        setCustomerName(formData.name);

        // Закрываем форму и показываем модальное окно успеха
        onOpenChange(false);
        setShowSuccessModal(true);

        // Очищаем форму
        setFormData({
          name: '',
          contactMethod: '',
          contactInfo: '',
          message: '',
        });
      } else {
        toast.error('Ошибка при отправке заявки');
      }
    } catch (error: any) {
      console.error('Error submitting consultation:', error);
      toast.error(
        error?.message || 'Произошла ошибка при отправке заявки'
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full mx-0 sm:mx-0 max-h-[95vh] overflow-y-auto focus:outline-none">
        <DialogHeader>
          <DialogTitle className={`text-lg sm:text-xl font-bold ${centerTitle ? 'text-center' : ''}`}>
            {title || 'Получить бесплатную консультацию'}
          </DialogTitle>
        </DialogHeader>
        {introContent && (
          <div className="mb-3 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
            {introContent}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Имя <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => {
                const value = e.target.value;
                console.log('[Webvisor] Имя (консультация):', value);
                setFormData({ ...formData, name: value });
              }}
              placeholder="Ваше имя"
              autoFocus={false}
              className="focus:ring-0 focus:outline-none ym-record-keys"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactMethod">
              Способ связи <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.contactMethod}
              onValueChange={value =>
                setFormData({
                  ...formData,
                  contactMethod: value,
                  contactInfo: '',
                })
              }
            >
              <SelectTrigger
                className={
                  !formData.contactMethod
                    ? 'border-red-500 focus:ring-red-500'
                    : ''
                }
              >
                <SelectValue placeholder="Выберите способ связи" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Звонок по телефону</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.contactMethod && (
            <div className="space-y-2">
              <Label htmlFor="contactInfo">
                {formData.contactMethod === 'phone'
                  ? 'Номер телефона'
                  : formData.contactMethod === 'telegram'
                    ? 'Telegram username'
                    : 'Номер WhatsApp'}{' '}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactInfo"
                value={formData.contactInfo}
                onChange={e => {
                  const value = e.target.value;
                  console.log(`[Webvisor] Контакт (консультация, ${formData.contactMethod}):`, value);
                  setFormData({ ...formData, contactInfo: value });
                }}
                placeholder={
                  formData.contactMethod === 'phone'
                    ? '+7 (999) 123-45-67'
                    : formData.contactMethod === 'telegram'
                      ? '@username'
                      : '+7 (999) 123-45-67'
                }
                type={
                  formData.contactMethod === 'phone' ||
                    formData.contactMethod === 'whatsapp'
                    ? 'tel'
                    : 'text'
                }
                autoFocus={false}
                className="focus:ring-0 focus:outline-none ym-record-keys"
                onKeyDown={(e) => {
                  // Разрешаем только цифры, +, -, (, ), пробел для телефона и WhatsApp
                  if (formData.contactMethod === 'phone' || formData.contactMethod === 'whatsapp') {
                    const allowedKeys = [
                      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                      'Home', 'End'
                    ];
                    const allowedChars = /[0-9+\-() ]/;

                    if (!allowedKeys.includes(e.key) && !allowedChars.test(e.key)) {
                      e.preventDefault();
                    }
                  }
                }}
                onInput={(e) => {
                  // Дополнительная проверка для очистки недопустимых символов
                  if (formData.contactMethod === 'phone' || formData.contactMethod === 'whatsapp') {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    const cleanedValue = value.replace(/[^0-9+\-() ]/g, '');
                    if (value !== cleanedValue) {
                      setFormData({ ...formData, contactInfo: cleanedValue });
                    }
                  }
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Комментарий</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={e => {
                const value = e.target.value;
                console.log('[Webvisor] Комментарий (консультация):', value);
                setFormData({ ...formData, message: value });
              }}
              className="focus:ring-0 focus:outline-none ym-record-keys"
              placeholder="Опишите, какой вопрос вас интересует..."
              rows={3}
              autoFocus={false}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Отправка...' : 'Получить бесплатную консультацию'}
          </Button>

          {/* Микро-доверие под кнопкой */}
          <div className="text-xs text-muted-foreground flex items-start gap-2 leading-snug">
            <span aria-hidden>🔒</span>
            <span>
              Мы не рассылаем спам, общаемся по делу и не передаём данные третьим лицам
            </span>
          </div>
        </form>

        {/* Секция прямых контактов */}
        <div className="mt-4 border-t pt-4">
          <p className="text-muted-foreground mb-3 text-center text-sm">
            Или свяжитесь напрямую 👇
          </p>
          <div className="flex justify-center gap-2 sm:gap-3">
            {/* Телефон */}
            <a
              href="tel:+79773602008"
              className="flex flex-1 items-center justify-center gap-1 sm:gap-2 h-8 sm:h-9 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-xs sm:text-sm transition-colors"
              aria-label="Позвонить по телефону"
            >
              <Phone className="size-3 sm:size-4" />
              <span>Телефон</span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/79773602008"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1 sm:gap-2 h-8 sm:h-9 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-xs sm:text-sm transition-colors"
              aria-label="Написать в WhatsApp"
            >
              <MessageCircle className="size-3 sm:size-4" />
              <span>WhatsApp</span>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/+79773602008"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-1 sm:gap-2 h-8 sm:h-9 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-xs sm:text-sm transition-colors"
              aria-label="Написать в Telegram"
            >
              <Send className="size-3 sm:size-4" />
              <span>Telegram</span>
            </a>
          </div>
        </div>
      </DialogContent>

      {/* Модальное окно успешной отправки заявки */}
      <ConsultationSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        customerName={customerName}
      />
    </Dialog>
  );
}
