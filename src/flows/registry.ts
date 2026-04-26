import type { ExpoInitFlow } from './types';

/**
 * Built-in flows that ship with the open-source build.
 *
 * Add entries here for any one-shot recipes that should be available to
 * everyone (e.g. a curated "auth + api + state" starter). Pro flows are
 * intentionally not listed here — they're loaded at runtime when the host
 * environment is configured to expose them.
 */
export const OSS_FLOWS: ExpoInitFlow[] = [];
