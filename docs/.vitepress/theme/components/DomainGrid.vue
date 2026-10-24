<script setup lang="ts">
import { withBase } from "vitepress";
import apiData from "../api-data.json";

const domains = apiData.domains;
</script>

<template>
    <div class="zca-domain-section">
        <div class="zca-domain-header">
            <h2 class="zca-domain-title">Khám phá 12 Phân hệ SDK ({{ apiData.totalApis }} API Nguyên bản)</h2>
            <p class="zca-domain-subtitle">
                Mọi phương thức đều được tổ chức theo kiến trúc Domain-Driven hiện đại với Lazy Memoized Getters và hỗ trợ đầy đủ TypeScript IntelliSense.
            </p>
        </div>

        <div class="zca-domain-grid">
            <a
                v-for="d in domains"
                :key="d.key"
                :href="withBase(`/api/${d.key}`)"
                class="zca-domain-card"
            >
                <div class="zca-domain-card-top">
                    <span class="zca-domain-icon">{{ d.icon }}</span>
                    <span class="zca-domain-badge">{{ d.badge }}</span>
                    <span class="zca-domain-count">{{ d.count }} APIs</span>
                </div>
                <h3 class="zca-domain-name">{{ d.title }}</h3>
                <p class="zca-domain-desc">{{ d.description }}</p>
                <div class="zca-domain-samples">
                    <code v-for="s in d.sampleMethods" :key="s" class="zca-sample-chip">{{ s }}</code>
                </div>
            </a>
        </div>
    </div>
</template>

<style scoped>
.zca-domain-section {
    max-width: 1200px;
    margin: 40px auto 24px;
    padding: 0 24px;
}

.zca-domain-header {
    text-align: center;
    margin-bottom: 32px;
}

.zca-domain-title {
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 10px;
    border: none;
}

.zca-domain-subtitle {
    color: var(--vp-c-text-2);
    font-size: 1rem;
    max-width: 680px;
    margin: 0 auto;
}

.zca-domain-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 18px;
}

.zca-domain-card {
    display: flex;
    flex-direction: column;
    padding: 20px;
    border-radius: 16px;
    background: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    text-decoration: none !important;
    color: inherit !important;
    transition:
        transform 0.2s ease,
        border-color 0.2s ease,
        box-shadow 0.2s ease;
}

.zca-domain-card:hover {
    transform: translateY(-4px);
    border-color: var(--vp-c-brand-1);
    box-shadow: 0 14px 32px -10px rgba(0, 104, 255, 0.22);
}

.zca-domain-card-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
}

.zca-domain-icon {
    font-size: 1.35rem;
}

.zca-domain-badge {
    font-family: var(--vp-font-family-mono);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--vp-c-brand-soft);
    color: var(--vp-c-brand-1);
}

.zca-domain-count {
    margin-left: auto;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--vp-c-text-2);
    background: var(--vp-c-bg-elv);
    padding: 2px 9px;
    border-radius: 999px;
    border: 1px solid var(--vp-c-divider);
}

.zca-domain-name {
    font-size: 1.08rem;
    font-weight: 700;
    margin: 0 0 8px;
    color: var(--vp-c-text-1);
}

.zca-domain-desc {
    font-size: 0.88rem;
    line-height: 1.55;
    color: var(--vp-c-text-2);
    margin: 0 0 14px;
    flex: 1;
}

.zca-domain-samples {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: auto;
}

.zca-sample-chip {
    font-size: 0.73rem;
    padding: 2px 7px;
    border-radius: 5px;
    background: var(--vp-c-bg-elv);
    color: var(--vp-c-text-2);
    border: 1px solid var(--vp-c-divider);
}
</style>
