import { getProductsByCategoryGroup } from "@/lib/data/products";
import { holidayOptions, shopperOptions } from "@/lib/data/shopFilters";

export interface MenuLink {
  href: string;
  label: string;
  /** Shown indented under the link above it (Kids → Girls / Boys). */
  sub?: boolean;
}

/** Header dropdown for Fashion & Style: Women / Men / Kids / Maternity (+ Outerwear), only those with products. */
export function getFashionMenu(): MenuLink[] {
  const fashion = getProductsByCategoryGroup("fashion-style");
  const shoppers = shopperOptions(fashion).filter((option) => !option.kids);
  const links: MenuLink[] = [{ href: "/category/fashion-style", label: "All Fashion" }];
  const kidSplits = shopperOptions(fashion).filter((option) => option.value === "girls" || option.value === "boys");
  for (const option of shoppers) {
    links.push({ href: `/category/fashion-style?shop=${option.value}`, label: option.label });
    // Kids is split into Girls and Boys right in the menu (Sara, Nov 2, 2026).
    if (option.value === "kids") {
      for (const kid of kidSplits) links.push({ href: `/category/fashion-style?shop=${kid.value}`, label: kid.label, sub: true });
    }
  }
  if (fashion.some((product) => product.category === "coats-jackets")) {
    links.push({ href: "/category/fashion-style?type=coats-jackets", label: "Outerwear" });
  }
  return links;
}

/** Header dropdown for Yom Tov & Holidays: All + each holiday that has products. */
export function getHolidayMenu(): MenuLink[] {
  const holidayProducts = getProductsByCategoryGroup("yom-tov-holidays");
  return [
    { href: "/category/yom-tov-holidays", label: "All Yom Tov & Holidays" },
    ...holidayOptions(holidayProducts).map((option) => ({
      href: `/category/yom-tov-holidays?holiday=${option.value}`,
      label: option.label,
    })),
  ];
}
