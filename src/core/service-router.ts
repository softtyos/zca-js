import type { ZPWServiceMap } from "../context.js";

/**
 * Lấy danh sách toàn bộ các endpoint của một service từ `zpwServiceMap` (hoặc fallback về domain mặc định).
 * Hỗ trợ cơ chế Multi-Endpoint Failover khi endpoint đầu tiên gặp sự cố mạng hoặc bảo trì.
 */
export function getServiceEndpoints<K extends keyof ZPWServiceMap>(
    zpwServiceMap: Partial<ZPWServiceMap> | undefined,
    serviceKey: K,
    fallbackDomain: string,
): string[] {
    const list = zpwServiceMap?.[serviceKey];
    if (Array.isArray(list) && list.length > 0) {
        return list;
    }
    return [fallbackDomain];
}

/**
 * Lấy endpoint chính (primary) của một service từ `zpwServiceMap` (hoặc fallback về domain mặc định).
 */
export function getServiceEndpoint<K extends keyof ZPWServiceMap>(
    zpwServiceMap: Partial<ZPWServiceMap> | undefined,
    serviceKey: K,
    fallbackDomain: string,
): string {
    return getServiceEndpoints(zpwServiceMap, serviceKey, fallbackDomain)[0];
}
