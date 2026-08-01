import { cache } from 'react';
import { getCatalog, withCategory } from '@/lib/catalog-data';
import { filterVisibleCategories } from '@/lib/schema-constants';

export const getVisibleCategories = cache(async () => {
  try {
    const { categories } = await getCatalog();
    return filterVisibleCategories(categories);
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
});

export const getPopularProducts = cache(async () => {
  try {
    const { products, categories } = await getCatalog();
    return products
      .filter((p) => p.is_popular && p.is_active)
      .slice(0, 4)
      .map((p) => withCategory(p, categories));
  } catch (error) {
    console.error('Error loading popular products:', error);
    return [];
  }
});

export const getVideoReviews = cache(async () => {
  try {
    const { reviews } = await getCatalog();
    return [...reviews]
      .sort((a, b) =>
        String(b.created_at || '').localeCompare(String(a.created_at || ''))
      )
      .slice(0, 4);
  } catch (error) {
    console.error('Error loading video reviews:', error);
    return [];
  }
});

export const getEventCounts = cache(async () => {
  const eventCounts = {
    wedding: 0,
    birthday: 0,
    new_year: 0,
  };

  try {
    const { products } = await getCatalog();
    products
      .filter((p) => p.is_active)
      .forEach((product) => {
        const eventTypes = product.event_types;
        if (Array.isArray(eventTypes)) {
          if (eventTypes.includes('wedding')) eventCounts.wedding++;
          if (eventTypes.includes('birthday')) eventCounts.birthday++;
          if (eventTypes.includes('new_year')) eventCounts.new_year++;
        }
      });
  } catch (error) {
    console.error('Error loading event counts:', error);
  }

  return eventCounts;
});
