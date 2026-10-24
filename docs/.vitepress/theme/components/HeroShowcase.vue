<script setup lang="ts">
import { ref } from "vue";
import apiData from "../api-data.json";

const activePkg = ref<"npm" | "bun" | "pnpm" | "yarn">("npm");
const installCommands: Record<string, string> = {
    npm: "npm install @softtynet/zca-js",
    bun: "bun add @softtynet/zca-js",
    pnpm: "pnpm add @softtynet/zca-js",
    yarn: "yarn add @softtynet/zca-js",
};

const copiedInstall = ref(false);
const copiedCode = ref(false);

async function copyInstall() {
    try {
        await navigator.clipboard.writeText(installCommands[activePkg.value]);
        copiedInstall.value = true;
        setTimeout(() => (copiedInstall.value = false), 1800);
    } catch {}
}

const sampleCode = `import { Zalo, ThreadType } from "@softtynet/zca-js";

// Khởi tạo SDK & Đăng nhập bằng mã QR hoặc Cookie/IMEI
const zalo = new Zalo({ selfListen: true, logging: true });
const api = await zalo.loginQR();

console.log("Đã kết nối tài khoản UID:", api.getOwnId());

// Lắng nghe sự kiện tin nhắn thời gian thực qua WebSocket
api.listener.on("message", async (msg) => {
    if (msg.data.content === "ping") {
        await api.chat.sendMessage(
            { msg: "pong 🚀 (@softtynet/zca-js v2.3.4)" },
            msg.threadId,
            msg.type
        );
    }
});

// Bắt đầu vòng lặp sự kiện
await api.listener.start();`;

async function copySampleCode() {
    try {
        await navigator.clipboard.writeText(sampleCode);
        copiedCode.value = true;
        setTimeout(() => (copiedCode.value = false), 1800);
    } catch {}
}
</script>

<template>
    <div class="zca-hero-showcase">
        <!-- Quick Install & Package Manager Selector -->
        <div class="zca-install-container">
            <div class="zca-pkg-tabs">
                <button
                    v-for="pkg in (['npm', 'bun', 'pnpm', 'yarn'] as const)"
                    :key="pkg"
                    type="button"
                    class="zca-pkg-tab"
                    :class="{ active: activePkg === pkg }"
                    @click="activePkg = pkg"
                >
                    {{ pkg }}
                </button>
            </div>

            <div class="zca-install-box" @click="copyInstall">
                <span class="zca-prompt-sign">$</span>
                <code class="zca-install-cmd">{{ installCommands[activePkg] }}</code>
                <button type="button" class="zca-install-copy-btn" :title="copiedInstall ? 'Đã sao chép!' : 'Sao chép lệnh cài đặt'">
                    <span v-if="copiedInstall" class="zca-copy-check">✓ Đã sao chép</span>
                    <span v-else class="zca-copy-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                        </svg>
                        Sao chép
                    </span>
                </button>
            </div>
        </div>

        <!-- Terminal Window Showcase (Theme-Adaptive) -->
        <div class="zca-terminal-card">
            <div class="zca-terminal-header">
                <div class="zca-traffic-lights">
                    <span class="zca-dot red"></span>
                    <span class="zca-dot yellow"></span>
                    <span class="zca-dot green"></span>
                </div>
                <div class="zca-terminal-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>
                    </svg>
                    <span>quick-start.ts — Khởi tạo Bot mẫu</span>
                </div>
                <div class="zca-terminal-actions">
                    <span class="zca-lang-pill">TypeScript</span>
                    <button type="button" class="zca-terminal-copy" @click="copySampleCode">
                        {{ copiedCode ? "✓ Đã sao chép" : "Sao chép mã" }}
                    </button>
                </div>
            </div>

            <div class="zca-terminal-body">
                <pre class="zca-code-block"><code><span class="c-kw">import</span> { <span class="c-id">Zalo</span>, <span class="c-id">ThreadType</span> } <span class="c-kw">from</span> <span class="c-str">"@softtynet/zca-js"</span>;

<span class="c-cmt">// Khởi tạo SDK & Đăng nhập bằng mã QR hoặc Cookie/IMEI</span>
<span class="c-kw">const</span> <span class="c-var">zalo</span> = <span class="c-kw">new</span> <span class="c-id">Zalo</span>({ <span class="c-prop">selfListen</span>: <span class="c-bool">true</span>, <span class="c-prop">logging</span>: <span class="c-bool">true</span> });
<span class="c-kw">const</span> <span class="c-var">api</span> = <span class="c-kw">await</span> <span class="c-var">zalo</span>.<span class="c-fn">loginQR</span>();

<span class="c-id">console</span>.<span class="c-fn">log</span>(<span class="c-str">"Đã kết nối tài khoản UID:"</span>, <span class="c-var">api</span>.<span class="c-fn">getOwnId</span>());

<span class="c-cmt">// Lắng nghe sự kiện tin nhắn thời gian thực qua WebSocket</span>
<span class="c-var">api</span>.<span class="c-prop">listener</span>.<span class="c-fn">on</span>(<span class="c-str">"message"</span>, <span class="c-kw">async</span> (<span class="c-param">msg</span>) =&gt; {
    <span class="c-kw">if</span> (<span class="c-param">msg</span>.<span class="c-prop">data</span>.<span class="c-prop">content</span> === <span class="c-str">"ping"</span>) {
        <span class="c-kw">await</span> <span class="c-var">api</span>.<span class="c-prop">chat</span>.<span class="c-fn">sendMessage</span>(
            { <span class="c-prop">msg</span>: <span class="c-str">"pong 🚀 (@softtynet/zca-js v2.3.4)"</span> },
            <span class="c-param">msg</span>.<span class="c-prop">threadId</span>,
            <span class="c-param">msg</span>.<span class="c-prop">type</span>
        );
    }
});

<span class="c-cmt">// Bắt đầu vòng lặp sự kiện</span>
<span class="c-kw">await</span> <span class="c-var">api</span>.<span class="c-prop">listener</span>.<span class="c-fn">start</span>();</code></pre>
            </div>
        </div>

        <!-- Metrics Banner (Unified Design Tokens) -->
        <div class="zca-metrics-grid">
            <div class="zca-metric-item">
                <div class="zca-metric-val">{{ apiData.totalApis }}</div>
                <div class="zca-metric-lbl">API Nguyên bản</div>
                <div class="zca-metric-sub">Phủ trọn vẹn Zalo PC 26.7.10</div>
            </div>
            <div class="zca-metric-item">
                <div class="zca-metric-val">12</div>
                <div class="zca-metric-lbl">Phân hệ Chuyên biệt</div>
                <div class="zca-metric-sub">Domain-Driven & Lazy Memoized</div>
            </div>
            <div class="zca-metric-item">
                <div class="zca-metric-val">ZDB 4.0</div>
                <div class="zca-metric-lbl">Đồng bộ Tin nhắn Mobile</div>
                <div class="zca-metric-sub">RSA-2048 & AES-256 Multi-chunk</div>
            </div>
            <div class="zca-metric-item">
                <div class="zca-metric-val">64-bit</div>
                <div class="zca-metric-lbl">Bảo toàn Số nguyên 64-bit</div>
                <div class="zca-metric-sub">Bảo toàn UID 19 chữ số tuyệt đối</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.zca-hero-showcase {
    max-width: 1040px;
    margin: 24px auto 40px;
    padding: 0 20px;
}

/* Install Container */
.zca-install-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 26px;
}

.zca-pkg-tabs {
    display: inline-flex;
    align-items: center;
    padding: 3px;
    background-color: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    border-radius: 10px;
    gap: 2px;
}

.zca-pkg-tab {
    padding: 4px 14px;
    font-size: 0.78rem;
    font-weight: 700;
    font-family: var(--vp-font-family-mono);
    border: none;
    border-radius: 7px;
    background: transparent;
    color: var(--vp-c-text-2);
    cursor: pointer;
    transition: all 0.16s ease;
}

.zca-pkg-tab:hover:not(.active) {
    color: var(--vp-c-text-1);
}

.zca-pkg-tab.active {
    background-color: var(--vp-c-bg-elv);
    color: var(--vp-c-brand-1);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.dark .zca-pkg-tab.active {
    background-color: #1e293b;
    color: #38bdf8;
}

.zca-install-box {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 10px 18px;
    background-color: var(--vp-c-bg-elv);
    border: 1px solid var(--vp-c-divider);
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 4px 16px -4px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
}

.dark .zca-install-box {
    background-color: #0d1322;
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.4);
}

.zca-install-box:hover {
    border-color: var(--vp-c-brand-1);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px -4px rgba(0, 104, 255, 0.18);
}

.zca-prompt-sign {
    color: var(--vp-c-text-3);
    font-family: var(--vp-font-family-mono);
    font-weight: 700;
    user-select: none;
}

.zca-install-cmd {
    font-family: var(--vp-font-family-mono);
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--vp-c-text-1);
}

.zca-install-copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 9px;
    border-radius: 6px;
    border: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg-soft);
    color: var(--vp-c-text-2);
    font-size: 0.76rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
}

.zca-install-copy-btn:hover {
    color: var(--vp-c-brand-1);
    border-color: var(--vp-c-brand-1);
}

.zca-copy-check {
    color: #10b981;
    font-weight: 700;
}

.zca-copy-icon {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

/* Terminal Card (Consistent Theme-Adaptive Design) */
.zca-terminal-card {
    border-radius: 16px;
    background-color: #0b1120;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 16px 40px -12px rgba(0, 0, 0, 0.45);
    overflow: hidden;
    margin-bottom: 28px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

/* Light Mode Terminal Refinement: Keeps terminal aesthetics while harmonizing with light theme */
html:not(.dark) .zca-terminal-card {
    background-color: #0f172a;
    border: 1px solid #cbd5e1;
    box-shadow: 0 16px 36px -12px rgba(15, 23, 42, 0.18);
}

.zca-terminal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 11px 16px;
    background-color: #070c18;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

html:not(.dark) .zca-terminal-header {
    background-color: #090f1d;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.zca-traffic-lights {
    display: flex;
    align-items: center;
    gap: 7px;
}

.zca-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
}

.zca-dot.red { background-color: #ff5f56; }
.zca-dot.yellow { background-color: #ffbd2e; }
.zca-dot.green { background-color: #27c93f; }

.zca-terminal-title {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #94a3b8;
    font-family: var(--vp-font-family-mono);
    font-size: 0.78rem;
    font-weight: 500;
}

.zca-terminal-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.zca-lang-pill {
    font-family: var(--vp-font-family-mono);
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 5px;
    background-color: rgba(56, 189, 248, 0.16);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.3);
}

.zca-terminal-copy {
    padding: 3px 9px;
    font-size: 0.72rem;
    font-weight: 600;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    background-color: rgba(255, 255, 255, 0.06);
    color: #e2e8f0;
    cursor: pointer;
    transition: all 0.15s ease;
}

.zca-terminal-copy:hover {
    background-color: rgba(255, 255, 255, 0.14);
    color: #ffffff;
}

.zca-terminal-body {
    padding: 18px 20px;
    overflow-x: auto;
}

.zca-code-block {
    margin: 0;
    font-family: var(--vp-font-family-mono);
    font-size: 0.85rem;
    line-height: 1.7;
    color: #e2e8f0;
}

/* Syntax Highlighting Tokens */
.c-kw { color: #f43f5e; font-weight: 600; }
.c-id { color: #38bdf8; font-weight: 600; }
.c-var { color: #f8fafc; }
.c-prop { color: #a5b4fc; }
.c-fn { color: #67e8f9; }
.c-param { color: #fdba74; }
.c-str { color: #34d399; }
.c-bool { color: #fb923c; font-weight: 600; }
.c-cmt { color: #64748b; font-style: italic; }

/* Metrics Grid */
.zca-metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
}

@media (max-width: 820px) {
    .zca-metrics-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 520px) {
    .zca-metrics-grid {
        grid-template-columns: 1fr;
    }
}

.zca-metric-item {
    padding: 18px 16px;
    border-radius: 14px;
    background-color: var(--vp-c-bg-soft);
    border: 1px solid var(--vp-c-divider);
    text-align: center;
    transition: all 0.2s ease;
}

.dark .zca-metric-item {
    background-color: #0d1322;
    border-color: rgba(255, 255, 255, 0.08);
}

.zca-metric-item:hover {
    transform: translateY(-2px);
    border-color: var(--vp-c-brand-1);
    box-shadow: 0 8px 20px -6px rgba(0, 104, 255, 0.16);
}

.zca-metric-val {
    font-size: 1.55rem;
    font-weight: 800;
    font-family: var(--vp-font-family-mono);
    color: var(--vp-c-brand-1);
    letter-spacing: -0.02em;
    line-height: 1.2;
}

.zca-metric-lbl {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--vp-c-text-1);
    margin-top: 4px;
}

.zca-metric-sub {
    font-size: 0.76rem;
    color: var(--vp-c-text-3);
    margin-top: 3px;
}
</style>
