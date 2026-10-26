import DefaultTheme from "vitepress/theme";
import { useData, useRoute, type Theme } from "vitepress";
import { nextTick, onMounted, watch } from "vue";
import ApiExplorer from "./components/ApiExplorer.vue";
import DomainGrid from "./components/DomainGrid.vue";
import HeroShowcase from "./components/HeroShowcase.vue";
import "./custom.css";

async function renderMermaidDiagrams(isDark: boolean) {
    if (typeof window === "undefined") return;
    await nextTick();

    const blocks = document.querySelectorAll<HTMLElement>(".vp-doc div.language-mermaid");
    if (blocks.length === 0) return;

    const mermaidModule = await import("mermaid");
    const mermaid = mermaidModule.default;

    mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? "dark" : "default",
        securityLevel: "loose",
        fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        flowchart: {
            htmlLabels: true,
            curve: "basis",
            padding: 16,
        },
    });

    let idx = 0;
    for (const block of Array.from(blocks)) {
        let rawCode = block.dataset.mermaidCode;
        if (!rawCode) {
            const codeEl = block.querySelector("pre code");
            rawCode = codeEl?.textContent?.trim() || "";
            if (!rawCode) continue;
            block.dataset.mermaidCode = rawCode;
        }

        try {
            const id = `zca-mermaid-${Date.now()}-${idx++}`;
            const { svg } = await mermaid.render(id, rawCode);

            let diagramContainer = block.querySelector<HTMLElement>(".zca-mermaid-diagram");
            if (!diagramContainer) {
                diagramContainer = document.createElement("div");
                diagramContainer.className = "zca-mermaid-diagram";
                block.appendChild(diagramContainer);
            }
            diagramContainer.innerHTML = svg;
            block.classList.add("zca-mermaid-rendered");
        } catch (err) {
            console.error("[Mermaid Render Error]", err);
        }
    }
}

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component("ApiExplorer", ApiExplorer);
        app.component("DomainGrid", DomainGrid);
        app.component("HeroShowcase", HeroShowcase);
    },
    setup() {
        const route = useRoute();
        const { isDark } = useData();

        onMounted(() => {
            void renderMermaidDiagrams(isDark.value);
        });

        watch(
            () => route.path,
            () => {
                setTimeout(() => void renderMermaidDiagrams(isDark.value), 60);
            },
        );

        watch(
            () => isDark.value,
            (dark) => {
                void renderMermaidDiagrams(dark);
            },
        );
    },
} satisfies Theme;
