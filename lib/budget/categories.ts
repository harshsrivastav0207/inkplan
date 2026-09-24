import type { LucideIcon } from "lucide-react";

import {
  BriefcaseBusiness,
  Car,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  House,
  MoreHorizontal,
  Plane,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Utensils,
  Wallet,
  Zap,
} from "lucide-react";

export type BudgetCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export const EXPENSE_CATEGORIES: BudgetCategory[] = [
  { id: "food", label: "Food", icon: Utensils },
  { id: "transport", label: "Transport", icon: Car },
  { id: "rent", label: "Rent", icon: House },
  { id: "utilities", label: "Utilities", icon: Zap },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "health", label: "Health", icon: HeartPulse },
  { id: "entertainment", label: "Entertainment", icon: Clapperboard },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "subscriptions", label: "Subscriptions", icon: Smartphone },
  { id: "travel", label: "Travel", icon: Plane },
  { id: "personal", label: "Personal", icon: ShoppingCart },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

export const INCOME_CATEGORIES: BudgetCategory[] = [
  { id: "salary", label: "Salary", icon: BriefcaseBusiness },
  { id: "freelance", label: "Freelance", icon: Wallet },
  { id: "business", label: "Business", icon: BriefcaseBusiness },
  { id: "gift", label: "Gift", icon: Wallet },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

export const ALL_BUDGET_CATEGORIES = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
];

export function getCategoryById(
  type: "expense" | "income",
  id: string,
): BudgetCategory | undefined {
  const categories =
    type === "expense"
      ? EXPENSE_CATEGORIES
      : INCOME_CATEGORIES;

  return categories.find(
    (category) => category.id === id,
  );
}
