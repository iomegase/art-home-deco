export const ADMIN_PRODUCTS_PAGE_SIZE = 30;

export type AdminProductsPaginationItem =
  | number
  | "ellipsis-start"
  | "ellipsis-end";

export function getAdminProductsPaginationState(
  totalItems: number,
  requestedPage: number,
  pageSize = ADMIN_PRODUCTS_PAGE_SIZE,
) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  return { currentPage, totalPages, startIndex, endIndex };
}

export function getAdminProductsPaginationItems(
  totalPages: number,
  currentPage: number,
): AdminProductsPaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [
    ...new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]),
  ]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);

  const items: AdminProductsPaginationItem[] = [];

  pages.forEach((page, index) => {
    const previous = pages[index - 1];
    if (previous && page - previous > 1) {
      items.push(previous === 1 ? "ellipsis-start" : "ellipsis-end");
    }
    items.push(page);
  });

  return items;
}
