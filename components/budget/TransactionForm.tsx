"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/lib/budget/categories";
import { transactionsRepo } from "@/lib/db/repositories/transactions.repo";
import type { TransactionType } from "@/lib/db/types";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function TransactionForm() {
  const amountRef = useRef<HTMLInputElement>(null);

  const [type, setType] =
    useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(getToday());
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const categories =
    type === "expense"
      ? EXPENSE_CATEGORIES
      : INCOME_CATEGORIES;

  function changeType(nextType: TransactionType) {
    setType(nextType);
    setCategory("");
    setError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      setError("Enter an amount greater than 0.");
      amountRef.current?.focus();
      return;
    }

    if (!category) {
      setError("Select a category.");
      return;
    }

    if (!date) {
      setError("Select a date.");
      return;
    }

    await transactionsRepo.create({
      type,
      amount: numericAmount,
      category,
      note: note.trim(),
      date,
    });

    setAmount("");
    setCategory("");
    setNote("");
    setError("");

    amountRef.current?.focus();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">
            Add transaction
          </h2>

          <p className="text-sm text-muted-foreground">
            Quickly record income or spending.
          </p>
        </div>

        <div className="flex rounded-lg border border-border p-1">
          <button
            type="button"
            onClick={() => changeType("expense")}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              type === "expense"
                ? "bg-muted font-medium"
                : "text-muted-foreground"
            }`}
          >
            Expense
          </button>

          <button
            type="button"
            onClick={() => changeType("income")}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              type === "income"
                ? "bg-muted font-medium"
                : "text-muted-foreground"
            }`}
          >
            Income
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="budget-amount">
            Amount
          </Label>

          <Input
            ref={amountRef}
            id="budget-amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>

          <Select
            value={category}
            onValueChange={(value) =>
              setCategory(value ?? "")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget-date">
            Date
          </Label>

          <Input
            id="budget-date"
            type="date"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget-note">
            Note
          </Label>

          <Input
            id="budget-note"
            placeholder="Optional"
            value={note}
            onChange={(event) =>
              setNote(event.target.value)
            }
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <Button type="submit">
          Add transaction
        </Button>
      </div>
    </form>
  );
}