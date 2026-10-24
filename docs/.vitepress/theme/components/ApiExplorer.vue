<script setup lang="ts">
import { computed, ref } from "vue";
import { withBase } from "vitepress";
import apiData from "../api-data.json";

const searchQuery = ref("");
const selectedDomain = ref("all");
const selectedMethod = ref("ALL");
const copiedKey = ref("");

const domains = apiData.domains;
const allApis = apiData.apis;

const filteredApis = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    return allApis.filter((item) => {
        if (selectedDomain.value !== "all" && item.domain !== selectedDomain.value) {
            return false;
        }
        if (selectedMethod.value !== "ALL" && item.httpMethod !== selectedMethod.value) {
            return false;
        }
        if (!q) return true;
        return (
            item.name.toLowerCase().includes(q) ||
            item.signature.toLowerCase().includes(q) ||
            item.summary.toLowerCase().includes(q) ||
            item.endpoints.some((e: string) => e.toLowerCase().includes(q))
        );
    });
});

async function copyCall(sig: string, key: string) {
    try {
        await navigator.clipboard.writeText(`await ${sig}`);
        copiedKey.value = key;
        setTimeout(() => {
            if (copiedKey.value === key) copiedKey.value = "";
        }, 1600);
    } catch {
        // Fallback ignore
    }
}
</script>

<template>
    <div class="zca-explorer">
        <!-- Search & Filter Bar -->
        <div class="zca-explorer-controls">
            <div class="zca-search-row">
                <div class="zca-search-input-wrap">
                    <span class="zca-search-icon">🔍</span>
                    <input
                        v-model="searchQuery"
                        type="text"
                        class="zca-search-input"
                        placeholder="Tìm nhanh trong 224 API theo tên hàm (vd: getGroupMessageStatus), endpoint (/api/group/...) hoặc mô tả..."
                    />
                    <button v-if="searchQuery" class="zca-clear-btn" @click="searchQuery = ''">✕</button>
                </div>

                <div class="zca-method-filter">
                    <button
                        v-for="m in ['ALL', 'GET', 'POST']"
                        :key="m"
                        class="zca-method-btn"
                        :class="{ active: selectedMethod === m }"
                        @click="selectedMethod = m"
                    >
                        {{ m }}
                    </button>
                </div>
            </div>

            <!-- Domain Filter Pills -->
            <div class="zca-domain-pills">
                <button
                    class="zca-pill"
                    :class="{ active: selectedDomain === 'all' }"
                    @click="selectedDomain = 'all'"
                >
                    Tất cả ({{ apiData.totalApis }})
                </button>
                <button
                    v-for="d in domains"
                    :key="d.key"
                    class="zca-pill"
                    :class="{ active: selectedDomain === d.key }"
                    @click="selectedDomain = d.key"
                >
                    <span>{{ d.icon }}</span>
                    <span>{{ d.key }}</span>
                    <span class="zca-pill-count">{{ d.count }}</span>
                </button>
            </div>
        </div>

        <!-- Result Count -->
        <div class="zca-result-bar">
            <span>Hiển thị <strong>{{ filteredApis.length }}</strong> / {{ apiData.totalApis }} API nguyên bản</span>
        </div>

        <!-- API List Cards -->
        <div class="zca-api-list">
            <div v-for="api in filteredApis" :key="`${api.domain}-${api.name}`" class="zca-api-card">
                <div class="zca-api-card-header">
                    <a :href="withBase(`/api/${api.domain}#${api.name.toLowerCase()}`)" class="zca-api-title">
                        {{ api.name }}
                    </a>
                    <span class="zca-api-domain-tag">api.{{ api.domain }}</span>
                    <span class="zca-badge-method" :class="api.httpMethod.toLowerCase()">
                        {{ api.httpMethod }}
                    </span>
                    <code v-for="ep in api.endpoints" :key="ep" class="zca-endpoint-pill">{{ ep }}</code>
                </div>

                <p class="zca-api-summary">{{ api.summary }}</p>

                <div class="zca-api-footer">
                    <code class="zca-api-sig">{{ api.signature }}</code>
                    <div class="zca-api-actions">
                        <button
                            class="zca-copy-btn"
                            @click="copyCall(api.signature, `${api.domain}.${api.name}`)"
                        >
                            {{ copiedKey === `${api.domain}.${api.name}` ? "✓ Đã chép" : "📋 Copy" }}
                        </button>
                        <a
                            :href="withBase(`/api/${api.domain}#${api.name.toLowerCase()}`)"
                            class="zca-detail-link"
                        >
                            Chi tiết & Types →
                        </a>
                    </div>
                </div>
            </div>

            <div v-if="filteredApis.length === 0" class="zca-empty-state">
                Không tìm thấy API nào khớp với từ khóa <strong>"{{ searchQuery }}"</strong>.
            </div>
        </div>
    </div>
</template>

<style scoped>
.zca-explorer {
    margin: 20px 0 36px;
}

.zca-explorer-controls {
    padding: 18px;
    border-radius: 16px;
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    margin-bottom: 16px;
}

.zca-search-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 14px;
}

.zca-search-input-wrap {
    flex: 1;
    min-width: 260px;
    position: relative;
    display: flex;
    align-items: center;
}

.zca-search-icon {
    position: absolute;
    left: 14px;
    font-size: 0.95rem;
    pointer-events: none;
}

.zca-search-input {
    width: 100%;
    padding: 10px 38px 10px 40px;
    border-radius: 10px;
    border: 1px solid var(--vp-c-divider);
    background: var(--vp-c-bg-elv);
    color: var(--vp-c-text-1);
    font-size: 0.92rem;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.zca-search-input:focus {
    border-color: var(--vp-c-brand-1);
    box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.zca-clear-btn {
    position: absolute;
    right: 10px;
    padding: 2px 8px;
    font-size: 0.85rem;
    color: var(--vp-c-text-2);
    cursor: pointer;
}

.zca-method-filter {
    display: inline-flex;
    border-radius: 10px;
    padding: 3px;
    background: var(--vp-c-bg-elv);
    border: 1px solid var(--vp-c-divider);
}

.zca-method-btn {
    padding: 6px 14px;
    border-radius: 7px;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--vp-c-text-2);
    cursor: pointer;
    transition: all 0.15s ease;
}

.zca-method-btn.active {
    background: var(--vp-c-brand-1);
    color: #fff;
}

.zca-domain-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.zca-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 600;
    background: var(--vp-c-bg-elv);
    color: var(--vp-c-text-2);
    border: 1px solid var(--vp-c-divider);
    cursor: pointer;
    transition: all 0.16s ease;
}

.zca-pill:hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-text-1);
}

.zca-pill.active {
    background: var(--vp-c-brand-1);
    color: #fff;
    border-color: var(--vp-c-brand-1);
}

.zca-pill-count {
    font-size: 0.72rem;
    opacity: 0.85;
    padding: 1px 6px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.15);
}

.zca-result-bar {
    font-size: 0.86rem;
    color: var(--vp-c-text-2);
    margin-bottom: 12px;
    padding: 0 4px;
}

.zca-api-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.zca-api-card {
    padding: 16px 18px;
    border-radius: 14px;
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    transition: border-color 0.18s ease, transform 0.18s ease;
}

.zca-api-card:hover {
    border-color: var(--vp-c-brand-1);
}

.zca-api-card-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.zca-api-title {
    font-size: 1.05rem;
    font-weight: 700;
    font-family: var(--vp-font-family-mono);
    color: var(--vp-c-brand-1) !important;
    text-decoration: none !important;
}

.zca-api-domain-tag {
    font-family: var(--vp-font-family-mono);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--vp-c-brand-soft);
    color: var(--vp-c-brand-1);
}

.zca-api-summary {
    margin: 6px 0 12px !important;
    font-size: 0.9rem;
    color: var(--vp-c-text-2);
    line-height: 1.5;
}

.zca-api-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding-top: 10px;
    border-top: 1px dashed var(--vp-c-divider);
}

.zca-api-sig {
    font-size: 0.8rem;
    color: var(--vp-c-text-1);
    background: var(--vp-c-bg-elv);
    padding: 4px 10px;
    border-radius: 6px;
    overflow-x: auto;
    max-width: 100%;
}

.zca-api-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
}

.zca-copy-btn {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    background: var(--vp-c-bg-elv);
    border: 1px solid var(--vp-c-divider);
    color: var(--vp-c-text-2);
    cursor: pointer;
    transition: all 0.15s ease;
}

.zca-copy-btn:hover {
    border-color: var(--vp-c-brand-1);
    color: var(--vp-c-brand-1);
}

.zca-detail-link {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--vp-c-brand-1) !important;
    text-decoration: none !important;
}

.zca-empty-state {
    padding: 36px;
    text-align: center;
    border-radius: 14px;
    background: var(--vp-c-bg-soft);
    color: var(--vp-c-text-2);
}
</style>
