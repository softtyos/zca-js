import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import ApiExplorer from "./components/ApiExplorer.vue";
import DomainGrid from "./components/DomainGrid.vue";
import "./custom.css";

export default {
    extends: DefaultTheme,
    enhanceApp({ app }) {
        app.component("ApiExplorer", ApiExplorer);
        app.component("DomainGrid", DomainGrid);
    },
} satisfies Theme;
