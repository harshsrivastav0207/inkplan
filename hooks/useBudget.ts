"use client";

import { useLiveQuery } from "dexie-react-hooks";

import { transactionsRepo } from "@/lib/db/repositories/transactions.repo";
import { settingsRepo } from "@/lib/db/repositories/settings.repo";
import type {
  Settings,
  Transaction,
} from "@/lib/db/types";

export function useBudget(yearMonth: string) {
  const data = useLiveQuery(
    async () => {
      const [
        transactions,
        incomeTotal,
        expenseTotal,
        categoryTotals,
        settings,
      ] = await Promise.all([
        transactionsRepo.listByMonth(yearMonth),
        transactionsRepo.sumByType(
          yearMonth,
          "income",
        ),
        transactionsRepo.sumByType(
          yearMonth,
          "expense",
        ),
        transactionsRepo.groupByCategory(
          yearMonth,
          "expense",
        ),
        settingsRepo.getWithDefaults(),
      ]);

      const monthlyBudget =
        settings?.monthlyBudget ?? 0;

      return {
        transactions,
        incomeTotal,
        expenseTotal,
        remaining:
          monthlyBudget > 0
            ? monthlyBudget - expenseTotal
            : 0,
        categoryTotals,
        settings,
        hasBudget: monthlyBudget > 0,
      };
    },
    [yearMonth],
  );

  return {
    transactions:
      data?.transactions ??
      ([] as Transaction[]),
    incomeTotal:
      data?.incomeTotal ?? 0,
    expenseTotal:
      data?.expenseTotal ?? 0,
    remaining:
      data?.remaining ?? 0,
    categoryTotals:
      data?.categoryTotals ?? [],
    settings:
      data?.settings as
        | Settings
        | undefined,
    hasBudget:
      data?.hasBudget ?? false,
    loading:
      data === undefined,
  };
}