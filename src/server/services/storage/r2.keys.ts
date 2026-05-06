export function buildProductImageStorageKey(input: {
  productId: string;
  fileName: string;
}) {
  const safeName = input.fileName.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  return `products/${input.productId}/${Date.now()}-${safeName}`;
}

export function buildBlogImageStorageKey(input: {
  postId: string;
  fileName: string;
}) {
  const safeName = input.fileName.toLowerCase().replace(/[^a-z0-9.-]+/g, "-");
  return `blog/${input.postId}/${Date.now()}-${safeName}`;
}
