"use client";

import dynamic from "next/dynamic";

const ShopMiniMap = dynamic(
  () => import("./shop-map").then((mod) => mod.ShopMiniMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center rounded-lg bg-muted/30">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Map
        </div>
      </div>
    ),
  }
);

export { ShopMiniMap };
