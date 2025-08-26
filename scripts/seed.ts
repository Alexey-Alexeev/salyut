import { db } from '../lib/db'
import { categories, manufacturers, products } from '../db/schema'

async function seed() {
  console.log('🌱 Начинаем заполнение базы данных...')

  try {
    // Создаем категории
    console.log('📂 Создаем категории...')
    const categoriesData = [
      { name: 'Петарды', slug: 'firecrackers', description: 'Петарды и хлопушки для праздников' },
      { name: 'Ракеты', slug: 'rockets', description: 'Ракеты и салюты' },
      { name: 'Фонтаны', slug: 'fountains', description: 'Фонтаны и батареи салютов' },
      { name: 'Римские свечи', slug: 'roman-candles', description: 'Римские свечи и фейерверки' },
      { name: 'Бенгальские огни', slug: 'sparklers', description: 'Бенгальские огни и свечи' },
    ]

    for (const category of categoriesData) {
      await db.insert(categories).values(category).onConflictDoNothing()
    }

    // Создаем производителей
    console.log('🏭 Создаем производителей...')
    const manufacturersData = [
      { name: 'Русский фейерверк', country: 'Россия', description: 'Ведущий производитель пиротехники в России' },
      { name: 'Пиротехника-М', country: 'Россия', description: 'Качественная пиротехника для праздников' },
      { name: 'Фейерверк-Люкс', country: 'Россия', description: 'Премиум фейерверки и салюты' },
      { name: 'Праздник-Пиро', country: 'Россия', description: 'Пиротехника для всех праздников' },
    ]

    for (const manufacturer of manufacturersData) {
      await db.insert(manufacturers).values(manufacturer).onConflictDoNothing()
    }

    // Получаем ID категорий и производителей
    const categoriesList = await db.select().from(categories)
    const manufacturersList = await db.select().from(manufacturers)

    // Создаем товары
    console.log('🎆 Создаем товары...')
    const productsData = [
      {
        name: 'Салют "Золотая россыпь" 36 залпов',
        slug: 'golden-shower-36',
        price: 250000, // 2500 рублей в копейках
        category_id: categoriesList.find(c => c.slug === 'rockets')?.id,
        manufacturer_id: manufacturersList.find(m => m.name === 'Русский фейерверк')?.id,
        images: [
          'https://images.pexels.com/photos/1387178/pexels-photo-1387178.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        description: 'Профессиональный салют с 36 залпами золотистых искр. Идеально подходит для новогодних праздников, свадеб и других торжественных мероприятий.',
        characteristics: {
          'Тип': 'Салют',
          'Количество залпов': '36',
          'Время работы': '45 секунд',
          'Калибр': '30 мм',
          'Единица продажи': 'штука'
        },
        is_popular: true,
        stock_quantity: 15
      },
      {
        name: 'Петарды "Корсар-1" упаковка 50 шт',
        slug: 'korsar-1-50',
        price: 89000, // 890 рублей в копейках
        category_id: categoriesList.find(c => c.slug === 'firecrackers')?.id,
        manufacturer_id: manufacturersList.find(m => m.name === 'Пиротехника-М')?.id,
        images: [
          'https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        description: 'Петарды Корсар-1 - это классические петарды с громким хлопком. В упаковке 50 штук.',
        characteristics: {
          'Тип': 'Петарда',
          'Количество в упаковке': '50 шт',
          'Громкость': 'Высокая',
          'Единица продажи': 'упаковка'
        },
        is_popular: true,
        stock_quantity: 25
      },
      {
        name: 'Фонтан "Вулкан" 30 секунд',
        slug: 'volcano-fountain',
        price: 120000, // 1200 рублей в копейках
        category_id: categoriesList.find(c => c.slug === 'fountains')?.id,
        manufacturer_id: manufacturersList.find(m => m.name === 'Фейерверк-Люкс')?.id,
        images: [
          'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        description: 'Фонтан Вулкан создает эффект извержения вулкана с яркими искрами и дымом.',
        characteristics: {
          'Тип': 'Фонтан',
          'Время работы': '30 секунд',
          'Высота': '3-5 метров',
          'Единица продажи': 'штука'
        },
        is_popular: false,
        stock_quantity: 8
      },
      {
        name: 'Ракета "Комета" набор 12 шт',
        slug: 'comet-rockets-12',
        price: 185000, // 1850 рублей в копейках
        category_id: categoriesList.find(c => c.slug === 'rockets')?.id,
        manufacturer_id: manufacturersList.find(m => m.name === 'Праздник-Пиро')?.id,
        images: [
          'https://images.pexels.com/photos/1387172/pexels-photo-1387172.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        description: 'Набор из 12 ракет Комета с яркими хвостами и эффектными взрывами.',
        characteristics: {
          'Тип': 'Ракета',
          'Количество в наборе': '12 шт',
          'Высота полета': '50-80 метров',
          'Единица продажи': 'набор'
        },
        is_popular: true,
        stock_quantity: 12
      },
      {
        name: 'Бенгальские огни "Звездочки" 10 шт',
        slug: 'sparklers-stars-10',
        price: 35000, // 350 рублей в копейках
        category_id: categoriesList.find(c => c.slug === 'sparklers')?.id,
        manufacturer_id: manufacturersList.find(m => m.name === 'Русский фейерверк')?.id,
        images: [
          'https://images.pexels.com/photos/1387179/pexels-photo-1387179.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        description: 'Бенгальские огни Звездочки - безопасные и красивые огни для детей и взрослых.',
        characteristics: {
          'Тип': 'Бенгальский огонь',
          'Количество в упаковке': '10 шт',
          'Время горения': '30 секунд',
          'Единица продажи': 'упаковка'
        },
        is_popular: false,
        stock_quantity: 50
      },
      {
        name: 'Римская свеча "Огненный дождь" 8 выстрелов',
        slug: 'fire-rain-roman-candle',
        price: 75000, // 750 рублей в копейках
        category_id: categoriesList.find(c => c.slug === 'roman-candles')?.id,
        manufacturer_id: manufacturersList.find(m => m.name === 'Пиротехника-М')?.id,
        images: [
          'https://images.pexels.com/photos/1387172/pexels-photo-1387172.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        description: 'Римская свеча с 8 выстрелами, создающими эффект огненного дождя.',
        characteristics: {
          'Тип': 'Римская свеча',
          'Количество выстрелов': '8',
          'Высота': '20-30 метров',
          'Единица продажи': 'штука'
        },
        is_popular: false,
        stock_quantity: 20
      },
      {
        name: 'Салют "Небесный фейерверк" 50 залпов',
        slug: 'sky-fireworks-50',
        price: 350000, // 3500 рублей в копейках
        category_id: categoriesList.find(c => c.slug === 'rockets')?.id,
        manufacturer_id: manufacturersList.find(m => m.name === 'Фейерверк-Люкс')?.id,
        images: [
          'https://images.pexels.com/photos/1387178/pexels-photo-1387178.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        description: 'Мощный салют с 50 залпами различных эффектов. Идеален для больших праздников.',
        characteristics: {
          'Тип': 'Салют',
          'Количество залпов': '50',
          'Время работы': '60 секунд',
          'Калибр': '40 мм',
          'Единица продажи': 'штука'
        },
        is_popular: true,
        stock_quantity: 5
      },
      {
        name: 'Петарды "Гром" упаковка 100 шт',
        slug: 'thunder-firecrackers-100',
        price: 150000, // 1500 рублей в копейках
        category_id: categoriesList.find(c => c.slug === 'firecrackers')?.id,
        manufacturer_id: manufacturersList.find(m => m.name === 'Праздник-Пиро')?.id,
        images: [
          'https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=800',
        ],
        description: 'Петарды Гром - самые громкие петарды в нашем ассортименте. 100 штук в упаковке.',
        characteristics: {
          'Тип': 'Петарда',
          'Количество в упаковке': '100 шт',
          'Громкость': 'Максимальная',
          'Единица продажи': 'упаковка'
        },
        is_popular: false,
        stock_quantity: 10
      }
    ]

    for (const product of productsData) {
      await db.insert(products).values(product).onConflictDoNothing()
    }

    console.log('✅ База данных успешно заполнена!')
    console.log(`📊 Создано:`)
    console.log(`   - ${categoriesList.length} категорий`)
    console.log(`   - ${manufacturersList.length} производителей`)
    console.log(`   - ${productsData.length} товаров`)

  } catch (error) {
    console.error('❌ Ошибка при заполнении базы данных:', error)
    process.exit(1)
  }
}

seed()
