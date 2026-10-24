import { compare } from "semver";
import { isBun, logger } from "./utils.js";
import { ZALO_DOMAINS, ZALO_PROTOCOL } from "./constants/index.js";
import type { ContextBase } from "./context.js";

const VERSION = ZALO_PROTOCOL.SDK_VERSION;
const NPM_REGISTRY = ZALO_DOMAINS.NPM_REGISTRY;

export async function checkUpdate(ctx: ContextBase) {
    if (!ctx.options.checkUpdate) return;

    const isAgentUndiciDispatcher = Boolean(
        ctx.options.agent && typeof (ctx.options.agent as { dispatch?: unknown }).dispatch === "function",
    );
    const resolvedDispatcher =
        ctx.options.dispatcher ?? (isAgentUndiciDispatcher ? ctx.options.agent : undefined);
    const resolvedAgent =
        ctx.options.agent && !isAgentUndiciDispatcher ? ctx.options.agent : undefined;

    const _options = {
        ...(isBun
            ? {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  proxy: ctx.options.agent?.proxy?.href,
              }
            : {
                  ...(resolvedAgent ? { agent: resolvedAgent } : {}),
                  ...(resolvedDispatcher ? { dispatcher: resolvedDispatcher } : {}),
              }),
        ...(typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
            ? { signal: AbortSignal.timeout(3000) }
            : {}),
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
