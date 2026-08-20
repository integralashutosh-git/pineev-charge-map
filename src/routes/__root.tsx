import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme";
import { ReactLenis } from 'lenis/react';

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 touch-target"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 touch-target"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent touch-target"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PineEV — Find it. Reserve it. Charge it." },
      {
        name: "description",
        content:
          "PineEV connects EV drivers with verified hotels, cafés, dhabas and offices to reserve parking and charging in seconds.",
      },
      { name: "theme-color", content: "#2E3192" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PineEV" },
      { property: "og:title", content: "PineEV — Find it. Reserve it. Charge it." },
      {
        property: "og:description",
        content:
          "Reserve verified EV parking and charging at trusted commercial properties on a live map.",
      },
      { property: "og:image", content: "https://pineev.in/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@PineEV" },
      { name: "twitter:title", content: "PineEV — Find it. Reserve it. Charge it." },
      {
        name: "twitter:description",
        content:
          "Reserve verified EV parking and charging at trusted commercial properties on a live map.",
      },
      { name: "twitter:image", content: "https://pineev.in/og-image.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  // Respect user's motion preferences — kills smooth scroll for reduced-motion
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <ReactLenis
      root
      options={{
        // Core feel — 0.1 is the industry sweet-spot: smooth enough to feel luxurious,
        // responsive enough to not feel laggy on low-end devices.
        lerp: 0.1,

        // How long (in seconds) the scroll momentum lasts. Longer = silkier feel.
        duration: 1.2,

        // Use CSS easing instead of linear for more natural deceleration.
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),

        // Intercept and smooth wheel events.
        smoothWheel: true,

        // Sync with native touch/trackpad inertia on mobile/MacOS so it
        // doesn't fight the OS scrolling, giving a near-native feel.
        syncTouch: true,

        // Multipliers control how far one scroll event moves the page.
        // 1.0 is 1:1 with native — keeps it predictable.
        wheelMultiplier: 1,
        touchMultiplier: 1,

        // Kill smooth scroll if user prefers reduced motion (accessibility).
        ...(prefersReducedMotion && {
          lerp: 1,
          duration: 0,
          smoothWheel: false,
          syncTouch: false,
        }),
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </ThemeProvider>
      </QueryClientProvider>
    </ReactLenis>
  );
}
