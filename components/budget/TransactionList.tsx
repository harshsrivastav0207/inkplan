"use client";

import { useMemo, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { transactionsRepo } from "@/lib/db/repositories/transactions.repo";
import type { Transaction } from "@/lib/db/types";

import { TransactionItem } from "./TransactionItem";

type TransactionListProps = {
  transactions: Transaction[];
};

export function TransactionList({
  transactions,
}: TransactionListProps) {
  const [deleteId, setDeleteId] =
    useState<string | null>(null);

  const groups = useMemo(() => {
    const grouped = new Map<
      string,
      Transaction[]
    >();

    for (const transaction of transactions) {
      const existing =
        grouped.get(transaction.date) ?? [];

      existing.push(transaction);
      grouped.set(
        transaction.date,
        existing,
      );
    }

    return Array.from(grouped.entries());
  }, [transactions]);

  async function confirmDelete() {
    if (!deleteId) {
      return;
    }

    await transactionsRepo.remove(deleteId);
    setDeleteId(null);
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="font-medium">
          No transactions this month
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Add your first income or expense above.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-4">
          <h2 className="font-semibold">
            Transactions
          </h2>

          <p className="text-sm text-muted-foreground">
            Your activity for this month.
          </p>
        </div>

        <div className="divide-y divide-border">
          {groups.map(
            ([date, dayTransactions]) => {
              const dayTotal =
                dayTransactions.reduce(
                  (total, transaction) =>
                    total +
                    (transaction.type === "income"
                      ? transaction.amount
                      : -transaction.amount),
                  0,
                );

              const dateLabel =
                new Intl.DateTimeFormat(
                  "en-IN",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  },
                ).format(
                  new Date(`${date}T00:00:00`),
                );

              return (
                <div key={date}>
                  <div className="flex items-center justify-between px-4 pt-4">
                    <p className="text-xs font-medium text-muted-foreground">
                      {dateLabel}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {dayTotal >= 0 ? "+" : "−"}
                      {Math.abs(
                        dayTotal,
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="px-1 pb-2 pt-1">
                    {dayTransactions.map(
                      (transaction) => (
                        <TransactionItem
                          key={transaction.id}
                          transaction={transaction}
                          onDelete={() =>
                            setDeleteId(
                              transaction.id,
                            )
                          }
                        />
                      ),
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      <AlertDialog
        open={deleteId !== null}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setDeleteId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete transaction?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This transaction will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}