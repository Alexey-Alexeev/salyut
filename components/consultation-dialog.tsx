// components/ConsultationDialog.tsx
'use client';

import { useState } from 'react';
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
import { Send, Phone } from 'lucide-react';

interface ConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConsultationDialog({
  open,
  onOpenChange,
}: ConsultationDialogProps) {
  const [loading, setLoading] = useState(false);
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
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          contactMethod: formData.contactMethod,
          contactInfo: formData.contactInfo,
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Ошибка сервера');
      }

      toast.success('Заявка отправлена! Мы свяжемся с вами в ближайшее время.');
      onOpenChange(false);
      setFormData({
        name: '',
        contactMethod: '',
        contactInfo: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting consultation:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Произошла ошибка при отправке заявки'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDirectContact = (type: 'telegram' | 'whatsapp') => {
    if (type === 'telegram') {
      window.open('https://t.me/artem_sk_red', '_blank');
    } else {
      window.open('https://wa.me/79773602008', '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Получить консультацию
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Имя <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ваше имя"
              required
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
                onChange={e =>
                  setFormData({ ...formData, contactInfo: e.target.value })
                }
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
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Комментарий</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={e =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Опишите, какой вопрос вас интересует..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Отправка...' : 'Отправить заявку'}
          </Button>
        </form>

        {/* Секция прямых контактов */}
        <div className="mt-4 border-t pt-4">
          <p className="text-muted-foreground mb-3 text-center text-sm">
            Или можете связаться с нами напрямую
          </p>
          <div className="flex justify-center gap-3">
            {/* Telegram */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex flex-1 items-center gap-2"
              onClick={() => handleDirectContact('telegram')}
            >
              <Send className="size-4" />
              Telegram
            </Button>

            {/* WhatsApp */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex flex-1 items-center gap-2"
              onClick={() => handleDirectContact('whatsapp')}
            >
              <Phone className="size-4" />
              WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
