import { getProductsByCategoryGroup } from "@/lib/data/products";
import { holidayOptions, shopperOptions } from "@/lib/data/shopFilters";

export interface MenuLink {
  href: string;
  label: string;
}

/** Header dropdown for Fashion & Style: Women / Men / Kids / Maternity (+ Outerwear), only those with products. */
export function getFashionMenu(): MenuLink[] {
  const fashion = getProductsByCategoryGroup("fashion-style");
  const shoppers = shopperOptions(fashion).filter((option) => !option.kids);
  const links: MenuLink[] = [{ href: "/category/fashion-style", label: "All Fashion" }];
  for (const option of shoppers) links.push({ href: `/category/fashion-style?shop=${option.value}`, label: option.label });
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
