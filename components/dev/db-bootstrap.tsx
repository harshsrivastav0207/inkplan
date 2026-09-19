"use client";

import { useEffect } from "react";

import { ensureSeedData } from "@/lib/db/seed";

import { runDbSmokeTest } from "@/lib/db/smoke-test";

export function DbBootstrap() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    (async () => {
      await ensureSeedData();
      await runDbSmokeTest();
    })();
  }, []);

  return null;
}