import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import type MapViewType from "./MapView";

const MapView = lazy(() => import("./MapView"));

type MapPanelProps = ComponentProps<typeof MapViewType>;

function MapSkeleton({ className = "size-full" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-surface ${className}`}>
      <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

/** SSR-safe wrapper: Google Maps and the clusterer only load in the browser. */
export function MapPanel(props: MapPanelProps) {
  const fallback = <MapSkeleton className={props.className ?? "size-full"} />;
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <MapView {...props} />
      </Suspense>
    </ClientOnly>
  );
}
