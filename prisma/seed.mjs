import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    title: "Vase Greige Atelier",
    slug: "vase-greige-atelier",
    sku: "AHD-CER-001",
    barcode: "3760000000011",
    externalStockId: "SHOP-001",
    categorySlug: "ceramiques",
    shortDescription:
      "Vase en gres a finition mate, pense pour structurer une console, une table basse ou une etagere.",
    description:
      "Chaque piece presente de legeres variations de teinte et de texture. A associer avec des branches seches ou a laisser nu comme objet sculptural.",
    priceCents: 6900,
    stock: 8,
    shippingClass: "M",
    estimatedWeightGrams: 1200,
    isFragile: true,
    pickupOnly: false,
    image:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Coupe Terre Brulee",
    slug: "coupe-terre-brulee",
    sku: "AHD-CER-002",
    barcode: "3760000000028",
    externalStockId: "SHOP-002",
    categorySlug: "ceramiques",
    shortDescription: "Coupe basse en ceramique emaillee, ideale en centre de table ou vide-poche.",
    description: "Un volume simple, une teinte chaude, et une finition emaillee qui accroche la lumiere.",
    priceCents: 4200,
    stock: 13,
    shippingClass: "S",
    estimatedWeightGrams: 720,
    isFragile: true,
    pickupOnly: false,
    image:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Miroir Chene Clair",
    slug: "miroir-chene-clair",
    sku: "AHD-MOB-001",
    barcode: "3760000000035",
    externalStockId: "SHOP-003",
    categorySlug: "mobilier",
    shortDescription: "Miroir mural en chene clair, format vertical, fabrication artisanale.",
    description: "Son cadre discret adoucit l'espace sans l'alourdir. Retrait boutique recommande.",
    priceCents: 18900,
    stock: 3,
    shippingClass: "PICKUP_ONLY",
    estimatedWeightGrams: 7800,
    isFragile: true,
    pickupOnly: true,
    image:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85",
  },
  {
    title: "Lampe Lin Naturel",
    slug: "lampe-lin-naturel",
    sku: "AHD-LUM-001",
    barcode: "3760000000042",
    externalStockId: "SHOP-004",
    categorySlug: "luminaires",
    shortDescription: "Lampe d'appoint avec abat-jour en lin naturel et base minerale.",
    description: "Une lumiere douce pour les chambres, bureaux et coins lecture.",
    priceCents: 12900,
    stock: 5,
    shippingClass: "L",
    estimatedWeightGrams: 2500,
    isFragile: true,
    pickupOnly: false,
    image:
      "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=900&q=85",
  },
];

const blogPosts = [
  {
    title: "Composer une entree chaleureuse avec peu de pieces",
    slug: "composer-entree-chaleureuse",
    excerpt:
      "Un guide pratique pour choisir un miroir, une lumiere douce et quelques objets utiles sans surcharger l'entree.",
    content:
      "L'entree donne le ton de la maison. Commencez par une piece fonctionnelle, comme un miroir ou une console etroite, puis ajoutez une source lumineuse douce. Les matieres naturelles creent une transition plus calme entre l'exterieur et l'interieur.\n\nPour garder l'espace lisible, limitez les objets poses: un vide-poche, une coupe en ceramique, quelques branches seches. Les pieces doivent rester accessibles et faciles a deplacer.",
    imageUrl:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=85",
    category: "Conseils deco",
    seoTitle: "Composer une entree chaleureuse | Art Home Deco",
    seoDescription:
      "Conseils deco pour creer une entree chaleureuse avec miroir, lumiere douce et objets naturels.",
    reviewedByHuman: true,
    status: "published",
  },
  {
    title: "Ceramique artisanale: comment choisir la bonne piece",
    slug: "choisir-ceramique-artisanale",
    excerpt:
      "Vase, coupe, cache-pot: les criteres simples pour choisir une ceramique durable et facile a integrer.",
    content:
      "Une ceramique reussie ne depend pas seulement de sa couleur. Observez son volume, son poids visuel et sa capacite a dialoguer avec le mobilier. Une piece mate adoucit une etagere, tandis qu'un email brillant capte davantage la lumiere.\n\nAvant d'acheter, demandez-vous si l'objet sera utilise seul ou en composition. Les formats moyens sont souvent les plus polyvalents.",
    imageUrl:
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=85",
    category: "Guide achat",
    seoTitle: "Choisir une ceramique artisanale | Art Home Deco",
    seoDescription:
      "Guide d'achat pour choisir une ceramique artisanale: volume, matiere, usage et harmonie deco.",
    reviewedByHuman: true,
    status: "published",
  },
];

async function main() {
  const categories = [
    {
      title: "Ceramiques",
      slug: "ceramiques",
      description: "Vases, coupes et objets en gres pour composer la maison.",
    },
    {
      title: "Mobilier",
      slug: "mobilier",
      description: "Pieces fortes et petits meubles selectionnes pour leur matiere.",
    },
    {
      title: "Luminaires",
      slug: "luminaires",
      description: "Lumieres douces, bases minerales et abat-jour naturels.",
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  for (const product of products) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: product.categorySlug },
    });

    const savedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        title: product.title,
        sku: product.sku,
        barcode: product.barcode,
        externalStockId: product.externalStockId,
        externalProvider: "shopcaisse",
        stockSource: "local",
        shortDescription: product.shortDescription,
        description: product.description,
        priceCents: product.priceCents,
        stock: product.stock,
        status: "active",
        shippingClass: product.shippingClass,
        estimatedWeightGrams: product.estimatedWeightGrams,
        isFragile: product.isFragile,
        pickupOnly: product.pickupOnly,
      },
      create: {
        title: product.title,
        slug: product.slug,
        sku: product.sku,
        barcode: product.barcode,
        externalStockId: product.externalStockId,
        externalProvider: "shopcaisse",
        stockSource: "local",
        shortDescription: product.shortDescription,
        description: product.description,
        priceCents: product.priceCents,
        stock: product.stock,
        status: "active",
        shippingClass: product.shippingClass,
        estimatedWeightGrams: product.estimatedWeightGrams,
        isFragile: product.isFragile,
        pickupOnly: product.pickupOnly,
      },
    });

    await prisma.productCategory.upsert({
      where: {
        productId_categoryId: {
          productId: savedProduct.id,
          categoryId: category.id,
        },
      },
      update: {},
      create: {
        productId: savedProduct.id,
        categoryId: category.id,
      },
    });

    await prisma.productImage.upsert({
      where: {
        id: `${savedProduct.id}-primary`,
      },
      update: {
        url: product.image,
        alt: product.title,
        position: 0,
      },
      create: {
        id: `${savedProduct.id}-primary`,
        productId: savedProduct.id,
        url: product.image,
        alt: product.title,
        position: 0,
      },
    });
  }

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {
        ...post,
        publishedAt: new Date(),
      },
      create: {
        ...post,
        publishedAt: new Date(),
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
