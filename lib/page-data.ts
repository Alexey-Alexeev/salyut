import { cache } from 'react';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories, products, reviews } from '@/db/schema';
import { filterVisibleCategories } from '@/lib/schema-constants';

export const getVisibleCategories = cache(async () => {
  try {
    const categoriesData = await db.select().from(categories);
    return filterVisibleCategories(categoriesData);
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
});

export const getPopularProducts = cache(async () => {
  try {
    return await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        old_price: products.old_price,
        category_id: products.category_id,
        category_name: categories.name,
        category_slug: categories.slug,
        images: products.images,
        video_url: products.video_url,
        is_popular: products.is_popular,
        short_description: products.short_description,
        characteristics: products.characteristics,
        created_at: products.created_at,
      })
      .from(products)
      .leftJoin(categories, eq(products.category_id, categories.id))
      .where(and(eq(products.is_popular, true), eq(products.is_active, true)))
      .limit(4);
  } catch (error) {
    console.error('Error loading popular products:', error);
    return [];
  }
});

export const getVideoReviews = cache(async () => {
  try {
    return await db.select().from(reviews).orderBy(desc(reviews.created_at)).limit(4);
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
    const allProductsForEvents = await db
      .select({
        event_types: products.event_types,
      })
      .from(products)
      .where(eq(products.is_active, true));

    allProductsForEvents.forEach((product) => {
      const eventTypes = product.event_types as string[] | null;
      if (eventTypes && Array.isArray(eventTypes)) {
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
