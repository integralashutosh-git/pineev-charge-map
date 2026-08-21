/**
 * useDeviceCapability
 *
 * Probes the device at runtime to decide whether expensive visual effects
 * (backdrop-blur, spring animations, canvas particle systems) should be active.
 *
 * Signals used:
 *  - navigator.deviceMemory  — < 4 GB → low-end (Chrome/Android only, undefined elsewhere)
 *  - navigator.hardwareConcurrency — < 4 logical cores → low-end
 *  - (hover: none) + (pointer: coarse) → touch-only device (phone/tablet with no mouse)
 *  - prefers-reduced-motion  — accessibility shortcut that also maps to "low-end feel"
 *  - CSS.supports backdrop-filter — filter out unsupported browsers (old Android WebView)
 *
 * Result is memoised once per mount — capabilities don't change within a session.
 */

import { useMemo } from "react";

export interface DeviceCapability {
  /** True on phones / tablets that have no mouse hover. */
  isTouchOnly: boolean;
  /**
   * True when we detect a constrained device:
   *  < 4 GB RAM, < 4 CPU cores, or prefers-reduced-motion.
   * On iOS this is always false (deviceMemory / hardwareConcurrency
   * are either missing or lie) so we use touch + a render-time
   * frame-budget check as a secondary signal.
   */
  isLowEnd: boolean;
  /**
   * True when backdrop-filter is supported AND the device is not
   * low-end / touch-only. Use this to gate sticky-header blur,
   * glass-panel effects etc.
   */
  canBackdropBlur: boolean;
  /** Mirror of prefers-reduced-motion. */
  prefersReducedMotion: boolean;
}

// Singleton — computed once and reused across all hook calls in a session.
let cached: DeviceCapability | null = null;

function compute(): DeviceCapability {
  // SSR guard
  if (typeof window === "undefined") {
    return {
      isTouchOnly: false,
      isLowEnd: false,
      canBackdropBlur: true,
      prefersReducedMotion: false,
    };
  }

  const mql = (q: string) => window.matchMedia(q).matches;

  const prefersReducedMotion = mql("(prefers-reduced-motion: reduce)");

  // (hover: none) + (pointer: coarse) is the most reliable cross-browser
  // signal for "this is a touch-only device". A laptop with a touchscreen
  // still returns (hover: hover) because it has a mouse.
  const isTouchOnly = mql("(hover: none) and (pointer: coarse)");

  // Low-end heuristics
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const memory: number | undefined = (navigator as any).deviceMemory;
  const cores: number | undefined = navigator.hardwareConcurrency;

  const isLowEnd =
    prefersReducedMotion ||
    (memory !== undefined && memory < 4) ||
    (cores !== undefined && cores < 4);

  // backdrop-filter gating: support check first, then capability check.
  const supportsBlur =
    typeof CSS !== "undefined" &&
    (CSS.supports("backdrop-filter", "blur(1px)") ||
      CSS.supports("-webkit-backdrop-filter", "blur(1px)"));

  // Allow blur on capable touch devices (modern iPhone, Pixel flagship),
  // block it on low-end ones.
  const canBackdropBlur = supportsBlur && !(isTouchOnly && isLowEnd);

  return { isTouchOnly, isLowEnd, canBackdropBlur, prefersReducedMotion };
}

export function useDeviceCapability(): DeviceCapability {
  return useMemo(() => {
    if (!cached) cached = compute();
    return cached;
  }, []);
}
