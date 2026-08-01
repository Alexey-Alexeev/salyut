/**
 * Единая сортировка товаров каталога.
 * Используется И на сервере (сборка, lib/catalog-server.ts), И на клиенте
 * (lib/api-client.ts) — чтобы порядок товаров всегда совпадал.
 * Чистый модуль без внешних зависимостей (безопасен для обеих сред).
 */

type Sortable = {
  price: number;
  name: string;
  id: string;
  is_popular: boolean | null;
  created_at: string | null;
};

/** Сортирует список товаров на месте согласно sortBy. */
export function sortProducts<T extends Sortable>(list: T[], sortBy: string): void {
  const byName = (a: T, b: T) =>
    a.name.localeCompare(b.name, 'ru') || a.id.localeCompare(b.id);

  switch (sortBy) {
    case 'price-asc':
    case 'price_asc':
      list.sort((a, b) => a.price - b.price || byName(a, b));
      break;
    case 'price-desc':
    case 'price_desc':
      list.sort((a, b) => b.price - a.price || byName(a, b));
      break;
    case 'popular':
      list.sort(
        (a, b) => Number(!!b.is_popular) - Number(!!a.is_popular) || byName(a, b)
      );
      break;
    case 'newest':
      list.sort(
        (a, b) =>
          String(b.created_at || '').localeCompare(String(a.created_at || '')) ||
          byName(a, b)
      );
      break;
    case 'name':
    default:
      list.sort(byName);
  }
}
