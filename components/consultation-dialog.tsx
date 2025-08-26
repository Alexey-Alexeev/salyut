// components/ConsultationDialog.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface ConsultationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ConsultationDialog({ open, onOpenChange }: ConsultationDialogProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        contactMethod: '',
        contactInfo: '',
        message: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!formData.name.trim()) {
            toast.error('Пожалуйста, укажите ваше имя')
            setLoading(false)
            return
        }

        if (!formData.contactMethod) {
            toast.error('Пожалуйста, выберите способ связи')
            setLoading(false)
            return
        }

        if (!formData.contactInfo.trim()) {
            const errorMsg =
                formData.contactMethod === 'phone'
                    ? 'Укажите номер телефона'
                    : formData.contactMethod === 'telegram'
                        ? 'Укажите username в Telegram'
                        : 'Укажите номер в WhatsApp'
            toast.error(errorMsg)
            setLoading(false)
            return
        }

        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            toast.success('Заявка отправлена! Мы свяжемся с вами в ближайшее время.')
            onOpenChange(false)
            setFormData({ name: '', contactMethod: '', contactInfo: '', message: '' })
        } catch (error) {
            toast.error('Произошла ошибка при отправке заявки')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Получить консультацию</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Имя <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                            onValueChange={(value) =>
                                setFormData({
                                    ...formData,
                                    contactMethod: value,
                                    contactInfo: '',
                                })
                            }
                        >
                            <SelectTrigger
                                className={!formData.contactMethod ? 'border-red-500 focus:ring-red-500' : ''}
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
                                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                                placeholder={
                                    formData.contactMethod === 'phone'
                                        ? '+7 (999) 123-45-67'
                                        : formData.contactMethod === 'telegram'
                                            ? '@username'
                                            : '+7 (999) 123-45-67'
                                }
                                type={formData.contactMethod === 'phone' || formData.contactMethod === 'whatsapp' ? 'tel' : 'text'}
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="message">Сообщение</Label>
                        <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Опишите, какие фейерверки вас интересуют..."
                            rows={3}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Отправка...' : 'Отправить заявку'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}