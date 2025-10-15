import { CategoryCard } from '@/components/category-card';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface CategoriesSectionProps {
    categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
    return (
        <section className="container mx-auto bg-gray-50 px-4 py-12">
            <div className="mb-12 space-y-4 text-center">
                <h2 className="text-3xl font-bold md:text-4xl">Категории товаров</h2>
                <p className="text-muted-foreground mx-auto max-w-2xl">
                    Выберите подходящую категорию фейерверков для вашего мероприятия
                </p>
            </div>

            <div className={`grid gap-4 md:gap-6 ${categories.length === 7
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 xl:justify-center'
                : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
                }`}>
                {categories.map(category => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
        </section>
    );
}
