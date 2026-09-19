"use client";

type LoadingSkeletonProps = {
  className?: string;
};

export function LoadingSkeleton({
  className = "",
}: LoadingSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-lg bg-muted ${className}`}
    />
  );
}

export function SkeletonRow() {
  return (
    <LoadingSkeleton className="h-14 w-full" />
  );
}

export function SkeletonCard() {
  return (
    <LoadingSkeleton className="h-52 w-full" />
  );
}

export function SkeletonCircle() {
  return (
    <LoadingSkeleton className="size-10 rounded-full" />
  );
}