import { compare } from "semver";
import { isBun, logger } from "./utils.js";
import { ZALO_DOMAINS, ZALO_PROTOCOL } from "./constants/index.js";
import type { ContextBase } from "./context.js";

const VERSION = ZALO_PROTOCOL.SDK_VERSION;
const NPM_REGISTRY = ZALO_DOMAINS.NPM_REGISTRY;

export async function checkUpdate(ctx: ContextBase) {
    if (!ctx.options.checkUpdate) return;

    const _options = {
        ...(isBun
            ? {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  proxy: ctx.options.agent?.proxy?.href,
              }
            : { agent: ctx.options.agent }),
    };
    const response = await ctx.options.polyfill(NPM_REGISTRY, _options as RequestInit).catch(() => null);
    if (!response || !response.ok) return;

    const data = await response.json().catch(() => null);
    if (!data) return;

    const latestVersion = data["dist-tags"]?.latest;
    if (!latestVersion) return;

    if (compare(VERSION, latestVersion) === -1) {
        logger(ctx).info(`A new version of @softtynet/zca-js is available: ${latestVersion}`);
    } else {
        logger(ctx).info("@softtynet/zca-js is up to date");
    }
}
