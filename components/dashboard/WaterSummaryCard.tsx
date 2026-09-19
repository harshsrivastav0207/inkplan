"use client";

import Link from "next/link";
import { Droplets } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ProgressRing } from "@/components/water/ProgressRing";

type WaterSummaryCardProps = {
  waterTotal: number;
  waterTarget: number;
};

export function WaterSummaryCard({
  waterTotal,
  waterTarget,
}: WaterSummaryCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-muted">
              <Droplets className="size-5" />
            </div>

            <CardTitle className="text-base">
              Water
            </CardTitle>
          </div>

          <Link
            href="/water"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Log water
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-center">
          <ProgressRing
            current={waterTotal}
            target={waterTarget}
            size={120}
            strokeWidth={8}
          />
        </div>

        {waterTotal >= waterTarget ? (
          <p className="mt-4 text-center text-xs font-medium">
            Goal reached
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}