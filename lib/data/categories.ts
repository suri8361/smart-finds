import { ChefHat, Cpu, Monitor, Shirt, Sparkles, Tent } from "lucide-react";
import type { Category } from "@/types/catalog";

/**
 * Placeholder category list. In a later milestone this is replaced by the
 * `Category` table (SRS §11.1/§11.2), including its self-referencing
 * subcategory tree — this file only models the top level used by the
 * homepage nav and "Shop by Category" section.
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
];
