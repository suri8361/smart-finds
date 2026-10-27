import { Baby, BadgeCheck, CalendarHeart, ChefHat, Cpu, Gem, Monitor, PackageOpen, Shirt, Sparkles, Tent, ToyBrick } from "lucide-react";
import type { Category } from "@/types/catalog";

/**
 * Placeholder category list. In a later milestone this is replaced by the
 * `Category` table (SRS §11.1/§11.2), including its self-referencing
 * subcategory tree — this file only models the broad top-level groups used
 * for site navigation (nav menu, footer, "Shop by Category", /categories,
 * and /category/[slug]).
 *
 * `Product.category` itself does NOT use these slugs directly — it holds a
 * specific item-type value from lib/data/productCategories.ts (e.g.
 * "dresses", "tops"), which optionally rolls up into one of the broad groups
 * below via that file's `group` field. Who a clothing item is for is a
 * separate field, `Product.audience` (lib/data/audiences.ts) — never encode
 * age/gender into a category slug.
 */
export const categories: Category[] = [
  {
    slug: "home-kitchen",
    name: "Home & Kitchen",
    description: "Small appliances, cookware & everyday upgrades",
    icon: ChefHat,
  },
  {
    slug: "tech-electronics",
    name: "Tech & Electronics",
    description: "Gadgets, accessories & smart home finds",
    icon: Cpu,
  },
  {
    slug: "fashion-style",
    name: "Fashion & Style",
    description: "Apparel, shoes & accessories worth a look",
    icon: Shirt,
  },
  {
    slug: "shabbos-elegant",
    name: "Shabbos & Elegant",
    description: "Elegant, modest picks for Shabbos, Yom Tov and simchas",
    icon: Gem,
  },
  {
    // Built from Product.holidays (not Product.category) — see getProductsByCategoryGroup.
    slug: "yom-tov-holidays",
    name: "Yom Tov & Holidays",
    description: "Finds for Rosh Hashanah, Sukkos, Chanukah, Purim and every Yom Tov",
    icon: CalendarHeart,
  },
  {
    // Built from recommendationLabel "personally_tried" — finds Sara has tried herself.
    slug: "tried-true",
    name: "Tried & True",
    description: "Finds Sara has bought and used herself",
    icon: BadgeCheck,
  },
  {
    slug: "beauty-personal-care",
    name: "Beauty & Personal Care",
    description: "Skincare tools, routines & self-care picks",
    icon: Sparkles,
  },
  {
    slug: "outdoor-camping",
    name: "Outdoor & Camping",
    description: "Gear for the trail, campsite & backyard",
    icon: Tent,
  },
  {
    slug: "home-office",
    name: "Home Office",
    description: "Desk setups, organization & work-from-home gear",
    icon: Monitor,
  },
  {
    slug: "toys",
    name: "Toys",
    description: "Fun, gift-worthy toys, games & party favors for kids",
    icon: ToyBrick,
  },
  {
    slug: "baby-gear",
    name: "Baby Gear",
    description: "Clever baby & toddler essentials for everyday life",
    icon: Baby,
  },
  {
    // Slug stays "other" (it matches the product category value); shown as "More Finds".
    slug: "other",
    name: "More Finds",
    description: "Handy finds that don't fit anywhere else",
    icon: PackageOpen,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
