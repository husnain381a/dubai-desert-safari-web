export const SUMMER_DISCOUNT_RATE = 0.5;

type PackagePrice = {
  old_price?: number | null;
  price?: number | null;
};

export function roundPrice(value: number) {
  return Math.round(value * 100) / 100;
}

export function getPackagePricing(pkg: PackagePrice) {
  const storedPrice = Number(pkg.price ?? 0);
  const originalPrice = Number(pkg.old_price ?? storedPrice);
  const discountedPrice = pkg.old_price
    ? storedPrice
    : roundPrice(originalPrice * SUMMER_DISCOUNT_RATE);

  return {
    originalPrice,
    discountedPrice,
    hasDiscount: originalPrice > discountedPrice,
  };
}

export function formatAED(value: number) {
  return `AED ${new Intl.NumberFormat("en-AE", {
    maximumFractionDigits: 2,
  }).format(value)}`;
}
