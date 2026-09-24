"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoryById,
} from "@/lib/budget/categories";
import { transactionsRepo } from "@/lib/db/repositories/transactions.repo";
import type { Transaction } from "@/lib/db/types";

type TransactionItemProps = {
  transaction: Transaction;
  onDelete: () => void;
};

export function TransactionItem({
  transaction,
  onDelete,
}: TransactionItemProps) {
  const [editing, setEditing] =
    useState(false);

  const [amount, setAmount] =
    useState(String(transaction.amount));
  const [category, setCategory] =
    useState(transaction.category);
  const [date, setDate] =
    useState(transaction.date);
  const [note, setNote] =
    useState(transaction.note);

  const categoryData = getCategoryById(
    transaction.type,
    transaction.category,
  );

  const Icon = categoryData?.icon;

  const formattedDate = new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    },
  ).format(
    new Date(`${transaction.date}T00:00:00`),
  );

  async function save() {
    const numericAmount = Number(amount);

    if (
      !numericAmount ||
      numericAmount <= 0 ||
      !category ||
      !date
    ) {
      return;
    }

    await transactionsRepo.update(
      transaction.id,
      {
        amount: numericAmount,
        category,
        date,
        note: note.trim(),
      },
    );

    setEditing(false);
  }

  function cancel() {
    setAmount(String(transaction.amount));
    setCategory(transaction.category);
    setDate(transaction.date);
    setNote(transaction.note);
    setEditing(false);
  }

  if (editing) {
    const categories =
      transaction.type === "expense"
        ? EXPENSE_CATEGORIES
        : INCOME_CATEGORIES;

    return (
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
          />

          <Select
            value={category}
            onValueChange={(value) =>
              setCategory(value ?? "")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {categories.map((item) => (
                <SelectItem
                  key={item.id}
                  value={item.id}
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
          />

          <Input
            value={note}
            onChange={(event) =>
              setNote(event.target.value)
            }
            placeholder="Note"
          />
        </div>

        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={cancel}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={save}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  const displayAmount =
    transaction.type === "income"
      ? `+${transaction.amount.toLocaleString("en-IN")}`
      : `−${transaction.amount.toLocaleString("en-IN")}`;

  return (
    <div
      className="flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-muted/50"
      onDoubleClick={() => setEditing(true)}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        {Icon ? (
          <Icon className="h-4 w-4 text-muted-foreground" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {categoryData?.label ??
            transaction.category}
        </p>

        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>{formattedDate}</span>

          {transaction.note && (
            <>
              <span>•</span>
              <span className="truncate">
                {transaction.note}
              </span>
            </>
          )}
        </div>
      </div>

      <span
        className={`shrink-0 text-sm font-semibold ${
          transaction.type === "income"
            ? "text-success"
            : "text-foreground"
        }`}
      >
        {displayAmount}
      </span>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={onDelete}
        aria-label="Delete transaction"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}