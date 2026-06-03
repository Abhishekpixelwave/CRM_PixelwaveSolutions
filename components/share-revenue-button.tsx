"use client";

import Link from "next/link";
import { HandCoins } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShareRevenueButtonProps = {
  pendingAmount?: number;
  className?: string;
  size?: "default" | "sm" | "lg";
};

export function ShareRevenueButton({
  pendingAmount,
  className,
  size = "default",
}: ShareRevenueButtonProps) {
  return (
    <Link
      href="/revenue-share"
      className={cn(
        buttonVariants({ size }),
        "bg-boost text-boost-foreground hover:bg-boost-hover",
        className
      )}
    >
      <HandCoins className="mr-1.5 h-4 w-4" />
      Share revenue
      {pendingAmount !== undefined && pendingAmount > 0 && (
        <span className="ml-1.5 rounded-full bg-black/10 px-1.5 py-0.5 text-xs font-semibold dark:bg-white/15">
          ${pendingAmount.toFixed(2)} pending
        </span>
      )}
    </Link>
  );
}
