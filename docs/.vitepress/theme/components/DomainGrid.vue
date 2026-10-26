<script setup lang="ts">
import { withBase } from "vitepress";
import apiData from "../api-data.json";

const domains = apiData.domains;
</script>

<template>
    <div class="zca-domain-section">
        <div class="zca-domain-header">
            <span class="zca-domain-tagline">✨ KIẾN TRÚC MODULAR TIÊN TIẾN</span>
            <h2 class="zca-domain-title">12 Phân Hệ Chuyên Biệt ({{ apiData.totalApis }} APIs)</h2>
            <p class="zca-domain-subtitle">
                Được thiết kế theo mô hình Domain-Driven Design với Lazy Memoized Getters. Tối ưu bộ nhớ, khởi động tức
                thì và hỗ trợ đầy đủ TypeScript IntelliSense.
            </p>
        </div>

        <div class="zca-domain-grid">
            <a
                v-for="d in domains"
                :key="d.key"
                :href="withBase(`/api/${d.key}`)"
                class="zca-domain-card"
                :class="`domain-${d.key}`"
            >
                <div class="zca-domain-card-top">
                    <div class="zca-domain-icon-box">
                        <span class="zca-domain-icon">{{ d.icon }}</span>
                    </div>
                    <span class="zca-domain-badge">{{ d.badge }}</span>
                    <span class="zca-domain-count">{{ d.count }} APIs</span>
                </div>

                <div class="zca-domain-card-body">
                    <h3 class="zca-domain-name">
                        <span>{{ d.title }}</span>
                        <span class="zca-domain-arrow">→</span>
                    </h3>
                    <p class="zca-domain-desc">{{ d.description }}</p>
                </div>

                <div class="zca-domain-samples">
                    <code v-for="s in d.sampleMethods" :key="s" class="zca-sample-chip">{{ s }}</code>
                </div>
            </a>
        </div>
    </div>
</template>

<style scoped>
.zca-domain-section {
    max-width: 1240px;
    margin: 50px auto 36px;
    padding: 0 24px;
}

.zca-domain-header {
    text-align: center;
    margin-bottom: 36px;
}

.zca-domain-tagline {
    display: inline-block;
    font-family: var(--vp-font-family-mono);
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--vp-c-brand-1);
    background-color: var(--vp-c-brand-soft);
    padding: 3px 12px;
    border-radius: 999px;
    margin-bottom: 12px;
    border: 1px solid rgba(0, 104, 255, 0.2);
}

.zca-domain-title {
    font-size: 1.85rem;
    font-weight: 800;
    letter-spacing: -0.025em;
    margin: 0 0 12px;
    border: none;
    color: var(--vp-c-text-1);
}

.zca-domain-subtitle {
    color: var(--vp-c-text-2);
    font-size: 0.98rem;
    max-width: 720px;
    margin: 0 auto;
    line-height: 1.6;
}

.zca-domain-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
}

@media (max-width: 768px) {
    .zca-domain-grid {
        grid-template-columns: 1fr;
    }
}

.zca-domain-card {
    display: flex;
    flex-direction: column;
    padding: 22px;
    border-radius: 16px;
    background-color: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    text-decoration: none !important;
    color: var(--vp-c-text-1) !important;
    position: relative;
    overflow: hidden;
    transition: all 0.22s ease;
}

.dark .zca-domain-card {
    background-color: #0d1322;
    border-color: rgba(255, 255, 255, 0.08);
}

.zca-domain-card:hover {
    transform: translateY(-4px);
    border-color: var(--vp-c-brand-1);
    box-shadow: 0 16px 36px -12px rgba(0, 104, 255, 0.24);
}

.zca-domain-card-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
}

.zca-domain-icon-box {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--vp-c-brand-soft);
    border: 1px solid rgba(0, 104, 255, 0.2);
}

.zca-domain-icon {
    font-size: 1.25rem;
}

.zca-domain-badge {
    font-family: var(--vp-font-family-mono);
    font-size: 0.78rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    background-color: var(--vp-c-bg-elv);
    color: var(--vp-c-brand-1);
    border: 1px solid var(--vp-c-divider);
}

.zca-domain-count {
    margin-left: auto;
    font-family: var(--vp-font-family-mono);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--vp-c-text-1);
    background-color: var(--vp-c-bg-elv);
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid var(--vp-c-divider);
}

.zca-domain-card-body {
    flex: 1;
}

.zca-domain-name {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 8px;
    color: var(--vp-c-text-1);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.zca-domain-arrow {
    color: var(--vp-c-brand-1);
    opacity: 0;
    transform: translateX(-4px);
    transition: all 0.2s ease;
}

.zca-domain-card:hover .zca-domain-arrow {
    opacity: 1;
    transform: translateX(0);
}

.zca-domain-desc {
    font-size: 0.88rem;
    line-height: 1.55;
    color: var(--vp-c-text-2);
    margin: 0 0 16px;
}

.zca-domain-samples {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px dashed var(--vp-c-divider);
}

.zca-sample-chip {
    font-size: 0.74rem;
    font-family: var(--vp-font-family-mono);
    padding: 2px 8px;
    border-radius: 6px;
    background-color: var(--vp-c-bg-elv);
    color: var(--vp-c-text-2);
    border: 1px solid var(--vp-c-divider);
    transition: all 0.15s ease;
}

.zca-domain-card:hover .zca-sample-chip {
    border-color: rgba(0, 104, 255, 0.25);
    color: var(--vp-c-brand-1);
}
</style>
