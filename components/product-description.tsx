import React from 'react';
import { Star } from 'lucide-react';

interface ProductDescriptionProps {
    description: string | null;
    shortDescription?: string | null;
}

export function ProductDescription({
    description,
    shortDescription
}: ProductDescriptionProps) {
    if (!description) {
        return (
            <div className="text-muted-foreground">
                Описание товара отсутствует.
            </div>
        );
    }

    // Функция для парсинга описания с поддержкой абзацев
    const parseDescription = (text: string) => {
        // Разделяем текст по специальным маркерам абзацев
        const paragraphs = text.split(/\n\s*\n|\|\|\|/).filter(p => p.trim());
        const elements: React.ReactNode[] = [];

        paragraphs.forEach((paragraph, paragraphIndex) => {
            const lines = paragraph.split('\n').filter(line => line.trim());
            let currentList: string[] = [];
            let currentParagraph = '';

            const flushList = () => {
                if (currentList.length > 0) {
                    elements.push(
                        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 mb-4">
                            {currentList.map((item, index) => (
                                <li key={index} className="text-muted-foreground">
                                    {item.replace(/^-\s*/, '')}
                                </li>
                            ))}
                        </ul>
                    );
                    currentList = [];
                }
            };

            const flushParagraph = () => {
                if (currentParagraph.trim()) {
                    elements.push(
                        <p key={`paragraph-${elements.length}`} className="text-muted-foreground leading-relaxed mb-4">
                            {currentParagraph.trim()}
                        </p>
                    );
                    currentParagraph = '';
                }
            };

            lines.forEach((line) => {
                const trimmedLine = line.trim();

                // Проверяем, является ли строка элементом списка
                if (trimmedLine.startsWith('-') || trimmedLine.match(/^\d+\./)) {
                    flushParagraph();
                    currentList.push(trimmedLine);
                } else if (trimmedLine) {
                    flushList();
                    if (currentParagraph) {
                        currentParagraph += ' ' + trimmedLine;
                    } else {
                        currentParagraph = trimmedLine;
                    }
                }
            });

            // Обрабатываем оставшиеся элементы в абзаце
            flushList();
            flushParagraph();
        });

        return elements;
    };


    return (
        <div className="space-y-4">
            {/* Короткое описание */}
            {shortDescription && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <Star className="mr-2 size-4" />
                        Краткое описание
                    </h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                        {shortDescription}
                    </p>
                </div>
            )}

            {/* Основное описание */}
            <div>
                <h4 className="font-semibold text-gray-900 mb-3">Подробное описание</h4>
                <div className="prose prose-sm max-w-none">
                    {parseDescription(description)}
                </div>
            </div>
        </div>
    );
}
