'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { createConsultation } from '@/lib/api-client';
import { toast } from 'sonner';
import { ConsultationSuccessModal } from './consultation-success-modal';

interface QuizAnswers {
  eventType: string;
  guestsCount: string;
  budget: string;
  preferences: string;
  launchPlace: string;
  duration: string;
}

export function QuizSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    eventType: '',
    guestsCount: '',
    budget: '',
    preferences: '',
    launchPlace: '',
    duration: '',
  });
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactData, setContactData] = useState({
    name: '',
    contactMethod: '',
    contactInfo: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const questions = [
    {
      id: 'eventType',
      question: 'Для какого события нужен салют?',
      options: [
        { value: 'wedding', label: 'Свадьба' },
        { value: 'birthday', label: 'День рождения' },
        { value: 'new_year', label: 'Новый год' },
        { value: 'corporate', label: 'Корпоратив' },
        { value: 'other', label: 'Другое' },
      ],
    },
    {
      id: 'guestsCount',
      question: 'Сколько гостей ожидается?',
      options: [
        { value: 'up-to-20', label: 'До 20 человек' },
        { value: '20-50', label: '20-50 человек' },
        { value: '50-100', label: '50-100 человек' },
        { value: '100+', label: 'Более 100 человек' },
      ],
    },
    {
      id: 'budget',
      question: 'Какой у вас бюджет?',
      options: [
        { value: 'up-to-5000', label: 'До 5 000 ₽' },
        { value: '5000-15000', label: '5 000 - 15 000 ₽' },
        { value: '15000-30000', label: '15 000 - 30 000 ₽' },
        { value: '30000+', label: '30 000+ ₽' },
      ],
    },
    {
      id: 'preferences',
      question: 'Какие эффекты вам больше нравятся?',
      options: [
        { value: 'bright-colors', label: 'Яркие цвета и искры' },
        { value: 'loud-sounds', label: 'Громкие звуки' },
        { value: 'long-duration', label: 'Долгая продолжительность' },
        { value: 'combined', label: 'Комбинированный эффект' },
      ],
    },
    {
      id: 'launchPlace',
      question: 'Где планируете запускать салют?',
      options: [
        { value: 'open-area', label: 'Открытая площадка (дачный участок, поле)' },
        { value: 'limited-space', label: 'Ограниченное пространство (двор, парковка)' },
        { value: 'need-help', label: 'Нужна помощь специалиста' },
      ],
    },
    {
      id: 'duration',
      question: 'Какую длительность салюта предпочитаете?',
      options: [
        { value: 'short', label: 'Короткий (до 30 секунд)' },
        { value: 'medium', label: 'Средний (30-60 секунд)' },
        { value: 'long', label: 'Долгий (более 1 минуты)' },
      ],
    },
  ];

  const handleAnswer = (questionId: keyof QuizAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Последний вопрос - показываем форму контактов
      setShowContactForm(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };


  const formatQuizResults = (): string => {
    const eventTypeLabels: Record<string, string> = {
      wedding: 'Свадьба',
      birthday: 'День рождения',
      new_year: 'Новый год',
      corporate: 'Корпоратив',
      other: 'Другое',
    };

    const guestsLabels: Record<string, string> = {
      'up-to-20': 'До 20 человек',
      '20-50': '20-50 человек',
      '50-100': '50-100 человек',
      '100+': 'Более 100 человек',
    };

    const budgetLabels: Record<string, string> = {
      'up-to-5000': 'До 5 000 ₽',
      '5000-15000': '5 000 - 15 000 ₽',
      '15000-30000': '15 000 - 30 000 ₽',
      '30000+': '30 000+ ₽',
    };

    const preferencesLabels: Record<string, string> = {
      'bright-colors': 'Яркие цвета и искры',
      'loud-sounds': 'Громкие звуки',
      'long-duration': 'Долгая продолжительность',
      combined: 'Комбинированный эффект',
    };

    const launchPlaceLabels: Record<string, string> = {
      'open-area': 'Открытая площадка (дачный участок, поле)',
      'limited-space': 'Ограниченное пространство (двор, парковка)',
      'need-help': 'Нужна помощь специалиста',
    };

    const durationLabels: Record<string, string> = {
      short: 'Короткий (до 30 секунд)',
      medium: 'Средний (30-60 секунд)',
      long: 'Долгий (более 1 минуты)',
    };

    let result = 'Результаты квиза "Подбор идеального салюта":\n\n';
    result += `1. Тип события: ${eventTypeLabels[answers.eventType] || answers.eventType}\n`;
    result += `2. Количество гостей: ${guestsLabels[answers.guestsCount] || answers.guestsCount}\n`;
    result += `3. Бюджет: ${budgetLabels[answers.budget] || answers.budget}\n`;
    result += `4. Предпочтения: ${preferencesLabels[answers.preferences] || answers.preferences}\n`;
    result += `5. Место запуска: ${launchPlaceLabels[answers.launchPlace] || answers.launchPlace}\n`;
    result += `6. Длительность: ${durationLabels[answers.duration] || answers.duration}\n`;

    return result;
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!contactData.name.trim()) {
      toast.error('Пожалуйста, укажите ваше имя');
      setIsSubmitting(false);
      return;
    }

    if (!contactData.contactMethod) {
      toast.error('Пожалуйста, выберите способ связи');
      setIsSubmitting(false);
      return;
    }

    if (!contactData.contactInfo.trim()) {
      const errorMsg =
        contactData.contactMethod === 'phone'
          ? 'Укажите номер телефона'
          : contactData.contactMethod === 'telegram'
            ? 'Укажите username в Telegram'
            : 'Укажите номер в WhatsApp';
      toast.error(errorMsg);
      setIsSubmitting(false);
      return;
    }

    try {
      const quizResults = formatQuizResults();
      const result = await createConsultation({
        name: contactData.name,
        contactMethod: contactData.contactMethod,
        contactInfo: contactData.contactInfo,
        message: quizResults,
      });

      if (result.success) {
        setCustomerName(contactData.name);
        // Показываем модальное окно
        setShowSuccessModal(true);
        // Не сбрасываем форму сразу - это сделаем при закрытии модального окна
      } else {
        toast.error('Ошибка при отправке заявки');
      }
    } catch (error: any) {
      console.error('Error submitting consultation:', error);
      toast.error(error?.message || 'Произошла ошибка при отправке заявки');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Проверяем, что currentStep в пределах массива
  const currentQuestion = questions[currentStep] || questions[0];
  const isLastStep = currentStep === questions.length - 1;
  const canProceed = currentQuestion ? answers[currentQuestion.id as keyof QuizAnswers] !== '' : false;

  return (
    <>
      {/* Модальное окно успеха - вынесено за пределы условного рендеринга */}
      <ConsultationSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          // После закрытия модального окна сбрасываем форму
          setContactData({ name: '', contactMethod: '', contactInfo: '' });
          setAnswers({
            eventType: '',
            guestsCount: '',
            budget: '',
            preferences: '',
            launchPlace: '',
            duration: '',
          });
          setCurrentStep(0);
          setShowContactForm(false);
          setCustomerName('');
        }}
        customerName={customerName}
      />

      {showContactForm ? (
        <section className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl text-center">
                Спасибо за прохождение квиза!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  Мы учтем все ваши пожелания и подберем идеальный салют для вашего праздника.
                  Оставьте свои контакты, и мы свяжемся с вами в ближайшее время.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowContactForm(false);
                  setCurrentStep(questions.length - 1);
                }}
                className="mb-4"
              >
                <ArrowLeft className="mr-2" size={16} />
                Вернуться к вопросам
              </Button>

              <form onSubmit={handleSubmitContact} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-name">
                    Имя <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="quiz-name"
                    value={contactData.name}
                    onChange={e => setContactData({ ...contactData, name: e.target.value })}
                    placeholder="Ваше имя"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quiz-contact-method">
                    Способ связи <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={contactData.contactMethod}
                    onValueChange={value =>
                      setContactData({
                        ...contactData,
                        contactMethod: value,
                        contactInfo: '',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите способ связи" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phone">Звонок по телефону</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {contactData.contactMethod && (
                  <div className="space-y-2">
                    <Label htmlFor="quiz-contact-info">
                      {contactData.contactMethod === 'phone'
                        ? 'Номер телефона'
                        : contactData.contactMethod === 'telegram'
                          ? 'Telegram username'
                          : 'Номер WhatsApp'}{' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quiz-contact-info"
                      value={contactData.contactInfo}
                      onChange={e =>
                        setContactData({ ...contactData, contactInfo: e.target.value })
                      }
                      placeholder={
                        contactData.contactMethod === 'phone'
                          ? '+7 (999) 123-45-67'
                          : contactData.contactMethod === 'telegram'
                            ? '@username'
                            : '+7 (999) 123-45-67'
                      }
                      type={
                        contactData.contactMethod === 'phone' ||
                        contactData.contactMethod === 'whatsapp'
                          ? 'tel'
                          : 'text'
                      }
                      required
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      ) : (
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="text-orange-500" size={32} />
                <h2 className="text-3xl md:text-4xl font-bold">
                  Подбор идеального салюта
                </h2>
              </div>
              <p className="text-muted-foreground text-lg">
                Ответьте на несколько вопросов, и мы подберем идеальный салют для вашего
                праздника
              </p>
            </div>

            <Card>
              <CardContent className="p-6 md:p-8">
                {/* Прогресс-бар */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Вопрос {currentStep + 1} из {questions.length}</span>
                    <span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Вопрос */}
                <div className="space-y-6 min-h-[300px]">
                  <h3 className="text-xl md:text-2xl font-semibold">
                    {currentQuestion.question}
                  </h3>

                  <div className="space-y-3">
                    {currentQuestion.options.map(option => {
                      const isSelected =
                        answers[currentQuestion.id as keyof QuizAnswers] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleAnswer(currentQuestion.id as keyof QuizAnswers, option.value)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{option.label}</span>
                            {isSelected && <Check className="text-orange-500" size={20} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Навигация */}
                <div className="flex justify-between mt-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="mr-2" size={16} />
                    Назад
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed}
                  >
                    {isLastStep ? 'Завершить' : 'Далее'}
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </>
  );
}

