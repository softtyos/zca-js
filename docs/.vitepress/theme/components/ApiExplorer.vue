<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { withBase } from "vitepress";
import apiData from "../api-data.json";

const searchQuery = ref("");
const selectedDomain = ref("all");
const selectedMethod = ref("ALL");
const selectedCategory = ref("all");
const copiedKey = ref("");
const displayLimit = ref(35);
const searchInputRef = ref<HTMLInputElement | null>(null);

const domains = apiData.domains;
const allApis = apiData.apis;

// Domain Category Groups (Dynamic counts from api-data.json)
const countDomains = (doms: string[]) => allApis.filter((a) => doms.includes(a.domain)).length;
const categories = [
    { key: "all", label: "Tất cả Phân hệ", count: apiData.totalApis },
    { key: "messaging", label: "💬 Chat & Nhóm", domains: ["chat", "group"], count: countDomains(["chat", "group"]) },
    {
        key: "social",
        label: "👥 Bạn bè & Hồ sơ",
        domains: ["friend", "profile"],
        count: countDomains(["friend", "profile"]),
    },
    {
        key: "sync_cloud",
        label: "🔄 Đồng bộ, Cloud & Call",
        domains: ["sync", "zcloud", "media", "call"],
        count: countDomains(["sync", "zcloud", "media", "call"]),
    },
    {
        key: "tools_biz",
        label: "💼 Tiện ích & Business",
        domains: ["auth", "sticker", "board", "business"],
        count: countDomains(["auth", "sticker", "board", "business"]),
    },
];

function selectCategory(catKey: string) {
    selectedCategory.value = catKey;
    selectedDomain.value = "all";
    displayLimit.value = 35;
}

function selectDomain(domKey: string) {
    selectedDomain.value = domKey;
    displayLimit.value = 35;
}

const filteredApis = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    return allApis.filter((item) => {
        // Filter by category
        if (selectedCategory.value !== "all") {
            const cat = categories.find((c) => c.key === selectedCategory.value);
            if (cat?.domains && !cat.domains.includes(item.domain)) {
                return false;
            }
        }

        // Filter by domain
        if (selectedDomain.value !== "all" && item.domain !== selectedDomain.value) {
            return false;
        }

        // Filter by HTTP Method
        if (selectedMethod.value !== "ALL" && item.httpMethod !== selectedMethod.value) {
            return false;
        }

        // Filter by search query
        if (!q) return true;
        return (
            item.name.toLowerCase().includes(q) ||
            item.signature.toLowerCase().includes(q) ||
            item.summary.toLowerCase().includes(q) ||
            item.domain.toLowerCase().includes(q) ||
            item.endpoints.some((e: string) => e.toLowerCase().includes(q))
        );
    });
});

const visibleApis = computed(() => {
    return filteredApis.value.slice(0, displayLimit.value);
});

function loadMore() {
    displayLimit.value += 35;
}

function resetFilters() {
    searchQuery.value = "";
    selectedDomain.value = "all";
    selectedMethod.value = "ALL";
    selectedCategory.value = "all";
    displayLimit.value = 35;
}

const activeFiltersCount = computed(() => {
    let count = 0;
    if (searchQuery.value.trim()) count++;
    if (selectedDomain.value !== "all") count++;
    if (selectedMethod.value !== "ALL") count++;
    if (selectedCategory.value !== "all") count++;
    return count;
});

async function copyCall(sig: string, key: string) {
    try {
        await navigator.clipboard.writeText(`await ${sig}`);
        copiedKey.value = key;
        setTimeout(() => {
            if (copiedKey.value === key) copiedKey.value = "";
        }, 1600);
    } catch {}
}

// Keyboard shortcut (Ctrl+K / Cmd+K / /)
function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.value?.focus();
    } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchInputRef.value?.focus();
    }
}

onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
    <div class="zca-explorer">
        <!-- Explorer Header Command Bar -->
        <div class="zca-explorer-panel">
            <!-- Search & Method Filter Row -->
            <div class="zca-search-row">
                <div class="zca-search-box">
                    <span class="zca-search-icon">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </span>
                    <input
                        ref="searchInputRef"
                        v-model="searchQuery"
                        type="text"
                        class="zca-search-input"
                        :placeholder="`Tìm kiếm trong ${apiData.totalApis} API (tên hàm, endpoint, từ khóa...)...`"
                    />
                    <div class="zca-search-right">
                        <button
                            v-if="searchQuery"
                            type="button"
                            class="zca-clear-search-btn"
                            title="Xóa tìm kiếm"
                            @click="searchQuery = ''"
                        >
                            ✕
                        </button>
                        <kbd class="zca-shortcut-badge">⌘K</kbd>
                    </div>
                </div>

                <!-- HTTP Method Filter Segmented Control -->
                <div class="zca-method-group">
                    <button
                        v-for="m in ['ALL', 'GET', 'POST']"
                        :key="m"
                        type="button"
                        class="zca-method-item"
                        :class="{ active: selectedMethod === m, [m.toLowerCase()]: true }"
                        @click="selectedMethod = m"
                    >
                        {{ m }}
                    </button>
                </div>
            </div>

            <!-- Categories Tabs -->
            <div class="zca-category-tabs">
                <button
                    v-for="cat in categories"
                    :key="cat.key"
                    type="button"
                    class="zca-cat-tab"
                    :class="{ active: selectedCategory === cat.key }"
                    @click="selectCategory(cat.key)"
                >
                    <span>{{ cat.label }}</span>
                    <span class="zca-cat-count">{{ cat.count }}</span>
                </button>
            </div>

            <!-- Domain Scrollable Ribbon -->
            <div class="zca-domain-ribbon-wrap">
                <div class="zca-domain-ribbon">
                    <button
                        type="button"
                        class="zca-ribbon-chip"
                        :class="{ active: selectedDomain === 'all' }"
                        @click="selectDomain('all')"
                    >
                        <span>Tất cả Phân hệ</span>
                        <span class="zca-chip-badge">{{ apiData.totalApis }}</span>
                    </button>
                    <button
                        v-for="d in domains"
                        :key="d.key"
                        type="button"
                        class="zca-ribbon-chip"
                        :class="{ active: selectedDomain === d.key }"
                        @click="selectDomain(d.key)"
                    >
                        <span class="zca-chip-icon">{{ d.icon }}</span>
                        <span class="zca-chip-name">{{ d.key }}</span>
                        <span class="zca-chip-badge">{{ d.count }}</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Filter Stats & Quick Reset Bar -->
        <div class="zca-statusbar">
            <div class="zca-statusbar-left">
                <span
                    >Hiển thị <strong>{{ visibleApis.length }}</strong> / <strong>{{ filteredApis.length }}</strong> kết
                    quả (Tổng {{ apiData.totalApis }} APIs)</span
                >
            </div>
            <div v-if="activeFiltersCount > 0" class="zca-statusbar-right">
                <button type="button" class="zca-reset-filters-btn" @click="resetFilters">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                    </svg>
                    Đặt lại bộ lọc ({{ activeFiltersCount }})
                </button>
            </div>
        </div>

        <!-- API List -->
        <div class="zca-api-grid">
            <div v-for="api in visibleApis" :key="`${api.domain}-${api.name}`" class="zca-card">
                <!-- Card Header -->
                <div class="zca-card-head">
                    <div class="zca-card-title-group">
                        <span class="zca-method-badge" :class="api.httpMethod.toLowerCase()">
                            {{ api.httpMethod }}
                        </span>
                        <a :href="withBase(`/api/${api.domain}#${api.name.toLowerCase()}`)" class="zca-card-name">
                            {{ api.name }}
                        </a>
                        <span class="zca-domain-tag">api.{{ api.domain }}</span>
                    </div>

                    <div class="zca-card-actions">
                        <button
                            type="button"
                            class="zca-card-copy-btn"
                            :class="{ copied: copiedKey === `${api.domain}.${api.name}` }"
                            @click="copyCall(api.signature, `${api.domain}.${api.name}`)"
                            :title="`Sao chép lệnh gọi await ${api.signature}`"
                        >
                            <svg
                                v-if="copiedKey !== `${api.domain}.${api.name}`"
                                xmlns="http://www.w3.org/2000/svg"
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                            <span v-if="copiedKey === `${api.domain}.${api.name}`">✓ Đã chép</span>
                            <span v-else>Sao chép</span>
                        </button>
                        <a :href="withBase(`/api/${api.domain}#${api.name.toLowerCase()}`)" class="zca-card-detail-btn">
                            Kiểu dữ liệu →
                        </a>
                    </div>
                </div>

                <!-- Card Summary -->
                <p class="zca-card-desc">{{ api.summary }}</p>

                <!-- Endpoints Chips -->
                <div class="zca-card-endpoints">
                    <span class="zca-ep-label">Điểm cuối (Endpoint):</span>
                    <div class="zca-ep-list">
                        <code v-for="ep in api.endpoints" :key="ep" class="zca-ep-chip">{{ ep }}</code>
                        <span v-if="api.endpoints.length === 0" class="zca-ep-chip local">Hàm tiện ích nội bộ</span>
                    </div>
                </div>

                <!-- Call Signature Terminal Row -->
                <div class="zca-card-sig-box">
                    <span class="zca-sig-prefix">await</span>
                    <code class="zca-sig-code">{{ api.signature }}</code>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredApis.length === 0" class="zca-empty-box">
                <div class="zca-empty-icon">🔍</div>
                <h3 class="zca-empty-title">Không tìm thấy API phù hợp</h3>
                <p class="zca-empty-desc">
                    Không có phương thức nào khớp với từ khóa <strong>"{{ searchQuery }}"</strong> trong phân hệ đã
                    chọn.
                </p>
                <button type="button" class="zca-empty-reset-btn" @click="resetFilters">Xóa bộ lọc và thử lại</button>
            </div>

            <!-- Load More Button -->
            <div v-if="visibleApis.length < filteredApis.length" class="zca-load-more-wrap">
                <button type="button" class="zca-load-more-btn" @click="loadMore">
                    <span>Hiển thị thêm 35 API</span>
                    <span class="zca-load-count">({{ filteredApis.length - visibleApis.length }} còn lại)</span>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.zca-explorer {
    margin: 24px 0 48px;
}

/* Panel Controls */
.zca-explorer-panel {
    background-color: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.04);
}

.dark .zca-explorer-panel {
    background-color: #0d1322;
    border-color: rgba(255, 255, 255, 0.08);
}

.zca-search-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
}

@media (max-width: 680px) {
    .zca-search-row {
        flex-direction: column;
        align-items: stretch;
    }
}

.zca-search-box {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
}

.zca-search-icon {
    position: absolute;
    left: 14px;
    color: var(--vp-c-text-3);
    pointer-events: none;
    display: flex;
    align-items: center;
}

.zca-search-input {
    width: 100%;
    padding: 11px 80px 11px 40px;
    background-color: var(--vp-c-bg-elv);
    border: 1px solid var(--vp-c-divider);
    border-radius: 10px;
    font-size: 0.92rem;
    font-family: var(--vp-font-family-base);
    color: var(--vp-c-text-1);
    outline: none;
    transition: all 0.18s ease;
}

.dark .zca-search-input {
    background-color: #090d16;
    border-color: rgba(255, 255, 255, 0.12);
}

.zca-search-input:focus {
    border-color: var(--vp-c-brand-1);
    box-shadow: 0 0 0 3px rgba(0, 104, 255, 0.16);
}

.zca-search-right {
    position: absolute;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
}

.zca-clear-search-btn {
    border: none;
    background: transparent;
    color: var(--vp-c-text-3);
    font-size: 0.82rem;
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
}

.zca-clear-search-btn:hover {
    color: var(--vp-c-text-1);
    background-color: var(--vp-c-bg-soft);
}

.zca-shortcut-badge {
    padding: 2px 6px;
    border-radius: 5px;
    background-color: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    font-size: 0.72rem;
    font-family: var(--vp-font-family-mono);
    color: var(--vp-c-text-3);
    user-select: none;
}

/* Method Selector */
.zca-method-group {
    display: inline-flex;
    padding: 3px;
    background-color: var(--vp-c-bg-elv);
    border: 1px solid var(--vp-c-divider);
    border-radius: 10px;
    gap: 2px;
}

.dark .zca-method-group {
    background-color: #090d16;
    border-color: rgba(255, 255, 255, 0.1);
}

.zca-method-item {
    padding: 6px 14px;
    border-radius: 7px;
    border: none;
    background: transparent;
    font-family: var(--vp-font-family-mono);
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--vp-c-text-2);
    cursor: pointer;
    transition: all 0.16s ease;
}

.zca-method-item:hover:not(.active) {
    color: var(--vp-c-text-1);
}

.zca-method-item.active {
    background-color: var(--vp-c-brand-1);
    color: #ffffff;
    box-shadow: 0 2px 6px rgba(0, 104, 255, 0.35);
}

.zca-method-item.active.get {
    background-color: #10b981;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.35);
}

/* Category Tabs */
.zca-category-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--vp-c-divider);
}

.zca-cat-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 8px;
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid transparent;
    background: transparent;
    color: var(--vp-c-text-2);
    cursor: pointer;
    transition: all 0.15s ease;
}

.zca-cat-tab:hover:not(.active) {
    background-color: var(--vp-c-bg-elv);
    color: var(--vp-c-text-1);
}

.zca-cat-tab.active {
    background-color: var(--vp-c-bg-elv);
    border-color: var(--vp-c-divider);
    color: var(--vp-c-brand-1);
    font-weight: 700;
}

.dark .zca-cat-tab.active {
    background-color: #131c31;
    border-color: rgba(56, 189, 248, 0.3);
    color: #38bdf8;
}

.zca-cat-count {
    font-size: 0.7rem;
    font-family: var(--vp-font-family-mono);
    padding: 1px 6px;
    border-radius: 999px;
    background-color: var(--vp-c-bg-soft);
    color: var(--vp-c-text-3);
}

/* Domain Ribbon */
.zca-domain-ribbon-wrap {
    overflow-x: auto;
    scrollbar-width: thin;
    padding-bottom: 4px;
}

.zca-domain-ribbon {
    display: flex;
    gap: 6px;
    min-width: max-content;
}

.zca-ribbon-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 600;
    border: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg-elv);
    color: var(--vp-c-text-2);
    cursor: pointer;
    transition: all 0.15s ease;
}

.dark .zca-ribbon-chip {
    background-color: #090d16;
    border-color: rgba(255, 255, 255, 0.08);
}

.zca-ribbon-chip:hover:not(.active) {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
}

.zca-ribbon-chip.active {
    background-color: var(--vp-c-brand-1);
    border-color: var(--vp-c-brand-1);
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 104, 255, 0.3);
}

.zca-chip-icon {
    font-size: 0.88rem;
}

.zca-chip-name {
    font-family: var(--vp-font-family-mono);
    font-size: 0.76rem;
}

.zca-chip-badge {
    font-size: 0.68rem;
    font-family: var(--vp-font-family-mono);
    padding: 1px 5px;
    border-radius: 999px;
    background-color: rgba(0, 0, 0, 0.06);
}

.dark .zca-chip-badge {
    background-color: rgba(255, 255, 255, 0.1);
}

.zca-ribbon-chip.active .zca-chip-badge {
    background-color: rgba(255, 255, 255, 0.25);
    color: #ffffff;
}

/* Status Bar */
.zca-statusbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;
    margin-bottom: 14px;
    font-size: 0.84rem;
    color: var(--vp-c-text-2);
}

.zca-reset-filters-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 8px;
    border-radius: 6px;
    border: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg-soft);
    color: var(--vp-c-brand-1);
    font-size: 0.76rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
}

.zca-reset-filters-btn:hover {
    border-color: var(--vp-c-brand-1);
    background-color: var(--vp-c-brand-soft);
}

/* API Grid / Cards */
.zca-api-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.zca-card {
    padding: 16px 18px;
    border-radius: 14px;
    background-color: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    transition:
        border-color 0.18s ease,
        transform 0.18s ease,
        box-shadow 0.18s ease;
}

.dark .zca-card {
    background-color: #0d1322;
    border-color: rgba(255, 255, 255, 0.07);
}

.zca-card:hover {
    border-color: var(--vp-c-brand-1);
    transform: translateY(-2px);
    box-shadow: 0 10px 24px -8px rgba(0, 104, 255, 0.16);
}

.zca-card-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 8px;
}

.zca-card-title-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.zca-method-badge {
    font-family: var(--vp-font-family-mono);
    font-size: 0.7rem;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 5px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.zca-method-badge.post {
    background-color: rgba(0, 104, 255, 0.14);
    color: #0052cc;
    border: 1px solid rgba(0, 104, 255, 0.35);
}

.dark .zca-method-badge.post {
    background-color: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    border-color: rgba(56, 189, 248, 0.35);
}

.zca-method-badge.get {
    background-color: rgba(16, 185, 129, 0.14);
    color: #047857;
    border: 1px solid rgba(16, 185, 129, 0.35);
}

.dark .zca-method-badge.get {
    background-color: rgba(52, 211, 153, 0.15);
    color: #34d399;
    border-color: rgba(52, 211, 153, 0.35);
}

.zca-card-name {
    font-family: var(--vp-font-family-mono);
    font-size: 1.02rem;
    font-weight: 700;
    color: var(--vp-c-brand-1) !important;
    text-decoration: none !important;
}

.zca-domain-tag {
    font-family: var(--vp-font-family-mono);
    font-size: 0.72rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 5px;
    background-color: var(--vp-c-brand-soft);
    color: var(--vp-c-brand-1);
    border: 1px solid rgba(0, 104, 255, 0.2);
}

.zca-card-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
}

.zca-card-copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.74rem;
    font-weight: 600;
    border: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg-elv);
    color: var(--vp-c-text-2);
    cursor: pointer;
    transition: all 0.15s ease;
}

.zca-card-copy-btn:hover {
    color: var(--vp-c-brand-1);
    border-color: var(--vp-c-brand-1);
}

.zca-card-copy-btn.copied {
    color: #10b981;
    border-color: #10b981;
    font-weight: 700;
}

.zca-card-detail-btn {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--vp-c-brand-1) !important;
    text-decoration: none !important;
    padding: 4px 8px;
}

.zca-card-detail-btn:hover {
    text-decoration: underline !important;
}

.zca-card-desc {
    margin: 4px 0 10px !important;
    font-size: 0.88rem;
    line-height: 1.55;
    color: var(--vp-c-text-1);
}

/* Endpoints */
.zca-card-endpoints {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-bottom: 10px;
    flex-wrap: wrap;
}

.zca-ep-label {
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--vp-c-text-3);
    text-transform: uppercase;
}

.zca-ep-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.zca-ep-chip {
    font-family: var(--vp-font-family-mono);
    font-size: 0.74rem;
    padding: 2px 7px;
    border-radius: 5px;
    background-color: var(--vp-c-bg-elv);
    color: var(--vp-c-text-2);
    border: 1px solid var(--vp-c-divider);
}

.zca-ep-chip.local {
    font-style: italic;
    color: var(--vp-c-text-3);
}

/* Signature Box */
.zca-card-sig-box {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    background-color: var(--vp-c-bg-elv);
    border: 1px solid var(--vp-c-divider);
    overflow-x: auto;
}

.dark .zca-card-sig-box {
    background-color: #070c18;
    border-color: rgba(255, 255, 255, 0.07);
}

.zca-sig-prefix {
    font-family: var(--vp-font-family-mono);
    font-size: 0.75rem;
    font-weight: 700;
    color: #f43f5e;
}

.zca-sig-code {
    font-family: var(--vp-font-family-mono);
    font-size: 0.78rem;
    color: var(--vp-c-text-1);
    white-space: nowrap;
}

/* Empty State */
.zca-empty-box {
    text-align: center;
    padding: 44px 20px;
    background-color: var(--vp-c-bg-soft);
    border: 1px dashed var(--vp-c-divider);
    border-radius: 16px;
    margin-top: 12px;
}

.zca-empty-icon {
    font-size: 2.2rem;
    margin-bottom: 8px;
}

.zca-empty-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--vp-c-text-1);
    margin: 0 0 6px;
}

.zca-empty-desc {
    color: var(--vp-c-text-2);
    font-size: 0.9rem;
    margin: 0 0 16px;
}

.zca-empty-reset-btn {
    padding: 8px 18px;
    border-radius: 8px;
    background-color: var(--vp-c-brand-1);
    color: #ffffff;
    border: none;
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
}

/* Load More */
.zca-load-more-wrap {
    text-align: center;
    margin-top: 18px;
}

.zca-load-more-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: 10px;
    border: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg-soft);
    color: var(--vp-c-text-1);
    font-size: 0.88rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
}

.zca-load-more-btn:hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 104, 255, 0.15);
}

.zca-load-count {
    color: var(--vp-c-text-3);
    font-size: 0.8rem;
}
</style>
