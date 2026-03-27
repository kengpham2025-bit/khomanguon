/**
 * Các href không hiển thị trong menu điều hướng (header / danh mục trang chủ).
 * Danh sách sản phẩm do admin quản lý; không dùng mục "Cửa hàng" cố định trong menu.
 */
export const EXCLUDED_MENU_HREFS = new Set<string>(["/cua-hang"]);

export function filterNavMenus<T extends { href: string; children?: { href: string }[] }>(items: T[]): T[] {
  return items
    .filter((m) => !EXCLUDED_MENU_HREFS.has(m.href))
    .map((m) => {
      const children = m.children?.filter((c) => !EXCLUDED_MENU_HREFS.has(c.href)) ?? [];
      return { ...m, children } as T;
    });
}
