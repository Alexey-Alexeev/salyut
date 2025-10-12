'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Save, Eye } from 'lucide-react';

interface DescriptionEditorProps {
    productId: string;
    initialData?: {
        description?: string;
        shortDescription?: string;
        descriptionStructured?: {
            intro?: string;
            features?: string[];
            effects?: string[];
            conclusion?: string;
        };
        highlights?: string[];
    };
    onSave: (data: any) => Promise<void>;
}

export function DescriptionEditor({ productId, initialData, onSave }: DescriptionEditorProps) {
    const [description, setDescription] = useState(initialData?.description || '');
    const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');

    // Структурированное описание
    const [intro, setIntro] = useState(initialData?.descriptionStructured?.intro || '');
    const [features, setFeatures] = useState<string[]>(initialData?.descriptionStructured?.features || []);
    const [effects, setEffects] = useState<string[]>(initialData?.descriptionStructured?.effects || []);
    const [conclusion, setConclusion] = useState(initialData?.descriptionStructured?.conclusion || '');

    // Ключевые особенности
    const [highlights, setHighlights] = useState<string[]>(initialData?.highlights || []);
    const [newHighlight, setNewHighlight] = useState('');
    const [newFeature, setNewFeature] = useState('');
    const [newEffect, setNewEffect] = useState('');

    const [isPreview, setIsPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const addHighlight = () => {
        if (newHighlight.trim()) {
            setHighlights([...highlights, newHighlight.trim()]);
            setNewHighlight('');
        }
    };

    const removeHighlight = (index: number) => {
        setHighlights(highlights.filter((_, i) => i !== index));
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFeatures([...features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    const addEffect = () => {
        if (newEffect.trim()) {
            setEffects([...effects, newEffect.trim()]);
            setNewEffect('');
        }
    };

    const removeEffect = (index: number) => {
        setEffects(effects.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const data = {
                description,
                shortDescription,
                descriptionStructured: {
                    intro: intro || undefined,
                    features: features.length > 0 ? features : undefined,
                    effects: effects.length > 0 ? effects : undefined,
                    conclusion: conclusion || undefined,
                },
                highlights: highlights.length > 0 ? highlights : undefined,
            };

            await onSave(data);
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
        } finally {
            setIsSaving(false);
        }
    };

    if (isPreview) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Предварительный просмотр</h3>
                    <Button variant="outline" onClick={() => setIsPreview(false)}>
                        <Eye className="mr-2 size-4" />
                        Редактировать
                    </Button>
                </div>

                {/* Здесь будет компонент ProductDescription */}
                <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm text-gray-600">Предварительный просмотр будет здесь</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Редактор описания</h3>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsPreview(true)}>
                        <Eye className="mr-2 size-4" />
                        Предпросмотр
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="mr-2 size-4" />
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </div>
            </div>

            {/* Короткое описание */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Краткое описание</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder="Краткое описание товара (1-2 предложения)"
                        rows={3}
                    />
                </CardContent>
            </Card>

            {/* Ключевые особенности */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Ключевые особенности</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4">
                        <Input
                            value={newHighlight}
                            onChange={(e) => setNewHighlight(e.target.value)}
                            placeholder="Добавить особенность"
                            onKeyPress={(e) => e.key === 'Enter' && addHighlight()}
                        />
                        <Button onClick={addHighlight} size="sm">
                            <Plus className="size-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {highlights.map((highlight, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {highlight}
                                <button
                                    onClick={() => removeHighlight(index)}
                                    className="ml-1 hover:text-red-500"
                                >
                                    <X className="size-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Структурированное описание */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Структурированное описание</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Введение */}
                    <div>
                        <label className="text-sm font-medium">Введение</label>
                        <Textarea
                            value={intro}
                            onChange={(e) => setIntro(e.target.value)}
                            placeholder="Основное описание товара"
                            rows={3}
                        />
                    </div>

                    {/* Особенности */}
                    <div>
                        <label className="text-sm font-medium">Особенности</label>
                        <div className="flex gap-2 mb-2">
                            <Input
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Добавить особенность"
                                onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                            />
                            <Button onClick={addFeature} size="sm">
                                <Plus className="size-4" />
                            </Button>
                        </div>
                        <ul className="space-y-1">
                            {features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">•</span>
                                    <span className="flex-1">{feature}</span>
                                    <button
                                        onClick={() => removeFeature(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Эффекты */}
                    <div>
                        <label className="text-sm font-medium">Эффекты фейерверка</label>
                        <div className="flex gap-2 mb-2">
                            <Input
                                value={newEffect}
                                onChange={(e) => setNewEffect(e.target.value)}
                                placeholder="Добавить эффект"
                                onKeyPress={(e) => e.key === 'Enter' && addEffect()}
                            />
                            <Button onClick={addEffect} size="sm">
                                <Plus className="size-4" />
                            </Button>
                        </div>
                        <ul className="space-y-1">
                            {effects.map((effect, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-400">•</span>
                                    <span className="flex-1">{effect}</span>
                                    <button
                                        onClick={() => removeEffect(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Заключение */}
                    <div>
                        <label className="text-sm font-medium">Заключение</label>
                        <Textarea
                            value={conclusion}
                            onChange={(e) => setConclusion(e.target.value)}
                            placeholder="Дополнительная информация о товаре"
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Обычное описание (fallback) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Обычное описание (fallback)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Полное описание товара (используется если нет структурированного)"
                        rows={6}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
