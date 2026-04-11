import React from "react";

type SkeletonProps = {
  className?: string;
};

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={`animate-pulse bg-neutral-200 rounded-lg ${className ?? ""}`}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
};

export const SkeletonLine: React.FC<SkeletonProps> = ({ className }) => {
  return <Skeleton className={`h-4 ${className ?? ""}`} />;
};
