// import { Metadata } from 'next'
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { 
//   Shield, 
//   Award, 
//   Users, 
//   Phone,
//   Sparkles,
//   AlertTriangle,
//   CheckCircle
// } from 'lucide-react'
// import Link from 'next/link'

// export const metadata: Metadata = {
//   title: 'Профессиональный запуск салютов - КупитьСалюты',
//   description: 'Безопасный и профессиональный запуск фейерверков. Все детали обсуждаются индивидуально с менеджером.',
//   keywords: 'профессиональный запуск, салют, фейерверк, безопасность, мероприятие, праздник',
// }

// export default function LaunchingServicePage() {
//   return (
//     <div className="min-h-screen">
//       {/* Hero секция */}
//       <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
//         <div className="container mx-auto px-4 text-center">
//           <div className="flex justify-center mb-6">
//             <Sparkles className="h-16 w-16" />
//           </div>
//           <h1 className="text-4xl md:text-6xl font-bold mb-6">
//             Профессиональный запуск салютов
//           </h1>
//           <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
//             Доверьте запуск фейерверков профессионалам. Безопасность, качество и незабываемые впечатления гарантированы.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link href="/cart">
//               <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
//                 <Phone className="mr-2 h-5 w-5" />
//                 Заказать услугу
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Преимущества */}
//       <section className="py-16 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
//             Почему стоит выбрать профессиональный запуск?
//           </h2>

//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
//             <Card className="text-center p-6">
//               <div className="flex justify-center mb-4">
//                 <Shield className="h-12 w-12 text-orange-500" />
//               </div>
//               <h3 className="text-xl font-semibold mb-3">Максимальная безопасность</h3>
//               <p className="text-gray-600">
//                 Сертифицированные пиротехники с многолетним опытом. Соблюдение всех норм безопасности и требований законодательства.
//               </p>
//             </Card>

//             <Card className="text-center p-6">
//               <div className="flex justify-center mb-4">
//                 <Award className="h-12 w-12 text-orange-500" />
//               </div>
//               <h3 className="text-xl font-semibold mb-3">Профессиональное качество</h3>
//               <p className="text-gray-600">
//                 Идеальная синхронизация, продуманная хореография запуска и максимальный эффект от каждого салюта.
//               </p>
//             </Card>

//             <Card className="text-center p-6">
//               <div className="flex justify-center mb-4">
//                 <Users className="h-12 w-12 text-orange-500" />
//               </div>
//               <h3 className="text-xl font-semibold mb-3">Полное сопровождение</h3>
//               <p className="text-gray-600">
//                 От планирования до уборки территории. Вы наслаждаетесь праздником, мы заботимся о технической стороне.
//               </p>
//             </Card>
//           </div>
//         </div>
//       </section>

//       {/* Безопасность и юридические аспекты */}
//       <section className="py-16">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl mx-auto">
//             <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
//               Безопасность - наш приоритет
//             </h2>

//             <div className="grid md:grid-cols-2 gap-8">
//               <Card className="p-6">
//                 <div className="flex items-start gap-4">
//                   <AlertTriangle className="h-8 w-8 text-red-500 mt-1" />
//                   <div>
//                     <h3 className="text-xl font-semibold mb-3">Почему опасно запускать самостоятельно?</h3>
//                     <ul className="space-y-2 text-gray-600">
//                       <li>• Риск травм от неправильного обращения</li>
//                       <li>• Нарушение правил пожарной безопасности</li>
//                       <li>• Административная и уголовная ответственность</li>
//                       <li>• Возможный ущерб имуществу</li>
//                       <li>• Штрафы за нарушение законодательства</li>
//                     </ul>
//                   </div>
//                 </div>
//               </Card>

//               <Card className="p-6">
//                 <div className="flex items-start gap-4">
//                   <CheckCircle className="h-8 w-8 text-green-500 mt-1" />
//                   <div>
//                     <h3 className="text-xl font-semibold mb-3">С нами вы получаете:</h3>
//                     <ul className="space-y-2 text-gray-600">
//                       <li>• Полную юридическую защищенность</li>
//                       <li>• Все необходимые разрешения</li>
//                       <li>• Страхование гражданской ответственности</li>
//                       <li>• Сертифицированное оборудование</li>
//                       <li>• Квалифицированных специалистов</li>
//                     </ul>
//                   </div>
//                 </div>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Индивидуальный подход */}
//       <section className="py-16 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <div className="max-w-4xl mx-auto text-center">
//             <h2 className="text-3xl md:text-4xl font-bold mb-8">
//               Индивидуальный подход к каждому клиенту
//             </h2>
//             <p className="text-xl text-gray-600 mb-12">
//               Мы понимаем, что каждое мероприятие уникально. Поэтому все детали услуги обсуждаются индивидуально с нашими менеджерами.
//             </p>

//             <div className="grid md:grid-cols-1 gap-8 mb-12">
//               <Card className="p-8">
//                 <h3 className="text-2xl font-semibold mb-4">Что мы обсуждаем с вами:</h3>
//                 <div className="grid md:grid-cols-2 gap-6 text-left">
//                   <ul className="space-y-3 text-gray-600">
//                     <li>• Место проведения и его особенности</li>
//                     <li>• Количество гостей на мероприятии</li>
//                     <li>• Объем и тип фейерверков</li>
//                     <li>• Время проведения и продолжительность</li>
//                   </ul>
//                   <ul className="space-y-3 text-gray-600">
//                     <li>• Необходимые разрешения и документы</li>
//                     <li>• Меры безопасности для конкретной площадки</li>
//                     <li>• Синхронизация с музыкой (при желании)</li>
//                     <li>• Стоимость и варианты оплаты</li>
//                   </ul>
//                 </div>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA секция */}
//       <section className="py-16 bg-gradient-to-r from-orange-500 to-red-500 text-white">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-3xl md:text-4xl font-bold mb-6">
//             Готовы заказать профессиональный запуск?
//           </h2>
//           <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
//             Просто отметьте услугу при оформлении заказа, и наш менеджер свяжется с вами для обсуждения всех деталей и расчета стоимости
//           </p>
//           <Link href="/cart">
//             <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
//               <Phone className="mr-2 h-5 w-5" />
//               Перейти к оформлению заказа
//             </Button>
//           </Link>
//         </div>
//       </section>
//     </div>
//   )
// }

// app/launching-service/page.tsx
import { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Shield,
  Award,
  Users,
  Phone,
  RussianRuble,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin,
  Clock,
  Flame,
  Star,
  Info,
  XCircle,
  Home,
  FireExtinguisher,
  UserCheck,
  FileCheck,
  ThumbsUp,
  Hospital,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import LaunchingServicePage from './LaunchingServicePage'

// Metadata должен быть экспортирован на уровне модуля, не внутри компонента
export const metadata: Metadata = {
  title: 'Профессиональный запуск салютов - КупитьСалюты.рф',
  description: 'Безопасный и профессиональный запуск фейерверков. Все детали обсуждаются индивидуально с менеджером. Профессиональные пиротехники и максимальная безопасность.',
  keywords: 'профессиональный запуск, салют, фейерверк, безопасность, мероприятие, праздник, запуск салютов, пиротехника',
  openGraph: {
    title: 'Профессиональный запуск салютов - КупитьСалюты.рф',
    description: 'Безопасный и профессиональный запуск фейерверков. Все детали обсуждаются индивидуально с менеджером.',
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Профессиональный запуск салютов - КупитьСалюты.рф',
    description: 'Безопасный и профессиональный запуск фейерверков. Все детали обсуждаются индивидуально с менеджером.',
  },
}

// Удалите "use client" если он есть в файле
export default function LaunchingPage() {
  return (
    <LaunchingServicePage />
  )
}