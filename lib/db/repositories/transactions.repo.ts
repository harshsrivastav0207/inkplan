import { db } from "../index";

import type {
  Transaction,
  TransactionType,
} from "../types";

import { enqueueSync } from "../sync/queue";

export type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string;
};

export type UpdateTransactionInput =
  Partial<CreateTransactionInput>;

export const transactionsRepo = {
  async create(
    input: CreateTransactionInput,
  ): Promise<Transaction> {
    const timestamp = Date.now();

    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: input.type,
      amount: input.amount,
      category: input.category,
      note: input.note,
      date: input.date,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.transaction(
      "rw",
      db.transactions,
      db.syncQueue,
      async () => {
        await db.transactions.add(transaction);

        await enqueueSync(db.syncQueue, {
          table: "transactions",
          recordId: transaction.id,
          operation: "upsert",
          payload: transaction,
        });
      },
    );

    return transaction;
  },

  async get(
    id: string,
  ): Promise<Transaction | undefined> {
    return db.transactions.get(id);
  },

  async listByMonth(
    yearMonth: string,
  ): Promise<Transaction[]> {
    const transactions =
      await db.transactions
        .where("date")
        .startsWith(yearMonth)
        .toArray();

    return transactions.sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }

      return b.createdAt - a.createdAt;
    });
  },

  async listByRange(
    fromDate: string,
    toDate: string,
  ): Promise<Transaction[]> {
    const transactions = await db.transactions
      .where("date")
      .between(
        fromDate,
        toDate,
        true,
        true,
      )
      .toArray();

    return transactions.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }

      return a.createdAt - b.createdAt;
    });
  },

  async listAll(): Promise<Transaction[]> {
    const transactions =
      await db.transactions.toArray();

    return transactions.sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }

      return b.createdAt - a.createdAt;
    });
  },

  async update(
    id: string,
    patch: UpdateTransactionInput,
  ): Promise<number> {
    let updated = 0;

    await db.transaction(
      "rw",
      db.transactions,
      db.syncQueue,
      async () => {
        updated = await db.transactions.update(id, {
          ...patch,
          updatedAt: Date.now(),
        });

        if (updated === 0) return;

        const transaction =
          await db.transactions.get(id);

        if (!transaction) return;

        await enqueueSync(db.syncQueue, {
          table: "transactions",
          recordId: id,
          operation: "upsert",
          payload: transaction,
        });
      },
    );

    return updated;
  },

  async remove(id: string): Promise<void> {
    await db.transaction(
      "rw",
      db.transactions,
      db.syncQueue,
      async () => {
        await db.transactions.delete(id);

        await enqueueSync(db.syncQueue, {
          table: "transactions",
          recordId: id,
          operation: "delete",
          payload: null,
        });
      },
    );
  },

  async sumByType(
    yearMonth: string,
    type: TransactionType,
  ): Promise<number> {
    const transactions =
      await db.transactions
        .where("date")
        .startsWith(yearMonth)
        .toArray();

    return transactions
      .filter(
        (transaction) =>
          transaction.type === type,
      )
      .reduce(
        (total, transaction) =>
          total + transaction.amount,
        0,
      );
  },

  async groupByCategory(
    yearMonth: string,
    type: TransactionType,
  ): Promise<
    { category: string; total: number }[]
  > {
    const transactions =
      await db.transactions
        .where("date")
        .startsWith(yearMonth)
        .toArray();

    const totals = new Map<string, number>();

    for (const transaction of transactions) {
      if (transaction.type !== type) {
        continue;
      }

      totals.set(
        transaction.category,
        (totals.get(transaction.category) ?? 0) +
          transaction.amount,
      );
    }

    return Array.from(totals.entries())
      .map(([category, total]) => ({
        category,
        total,
      }))
      .sort(
        (a, b) => b.total - a.total,
      );
  },

  async groupByCategoryInRange(
    fromDate: string,
    toDate: string,
    type: TransactionType,
  ): Promise<
    { category: string; total: number }[]
  > {
    const transactions = await db.transactions
      .where("date")
      .between(
        fromDate,
        toDate,
        true,
        true,
      )
      .toArray();

    const totals = new Map<string, number>();

    for (const transaction of transactions) {
      if (transaction.type !== type) {
        continue;
      }

      totals.set(
        transaction.category,
        (totals.get(transaction.category) ?? 0) +
          transaction.amount,
      );
    }

    return Array.from(totals.entries())
      .map(([category, total]) => ({
        category,
        total,
      }))
      .sort(
        (a, b) => b.total - a.total,
      );
  },
};