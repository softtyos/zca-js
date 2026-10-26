import fs from "fs";
import path from "path";

const apisDir = path.join(process.cwd(), "src", "apis");
const outputFile = path.join(process.cwd(), "src", "apis.ts");
const pkgFile = path.join(process.cwd(), "package.json");
const protocolFile = path.join(process.cwd(), "src", "constants", "protocol.ts");

function syncSdkVersion() {
    if (!fs.existsSync(pkgFile) || !fs.existsSync(protocolFile)) return;
    const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf-8"));
    const protocolContent = fs.readFileSync(protocolFile, "utf-8");
    const updated = protocolContent.replace(/SDK_VERSION:\s*"[^"]+"/, `SDK_VERSION: "${pkg.version}"`);
    if (updated !== protocolContent) {
        fs.writeFileSync(protocolFile, updated, "utf-8");
        console.log(`Synced ZALO_PROTOCOL.SDK_VERSION to ${pkg.version}`);
    }
}

function getAllApiFiles(dir) {
    const ignoreFiles = ["listen.ts", "login.ts", "loginQR.ts", "custom.ts"];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const results = [];

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const domain = entry.name;
            const domainPath = path.join(dir, domain);
            const domainFiles = fs
                .readdirSync(domainPath)
                .filter((file) => file.endsWith(".ts") && !ignoreFiles.includes(file))
                .sort();
            for (const file of domainFiles) {
                const nonExtension = file.slice(0, -3);
                results.push({
                    name: nonExtension,
                    domain,
                    relativePath: `${domain}/${nonExtension}`,
                    factoryName: `${nonExtension}Factory`,
                });
            }
        } else if (entry.isFile() && entry.name.endsWith(".ts") && !ignoreFiles.includes(entry.name)) {
            const nonExtension = entry.name.slice(0, -3);
            results.push({
                name: nonExtension,
                domain: null,
                relativePath: nonExtension,
                factoryName: `${nonExtension}Factory`,
            });
        }
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
}

function generateAPIsFile() {
    const allApiFiles = getAllApiFiles(apisDir);

    const importLines = allApiFiles.map((file) => {
        return `import { ${file.factoryName} } from "./apis/${file.relativePath}.js";`;
    });

    const domainsMap = new Map();
    for (const file of allApiFiles) {
        if (!file.domain) continue;
        if (!domainsMap.has(file.domain)) {
            domainsMap.set(file.domain, []);
        }
        domainsMap.get(file.domain).push(file);
    }

    const sortedDomains = Array.from(domainsMap.keys()).sort();

    const domainTypeLines = sortedDomains.map((domain) => {
        const files = domainsMap.get(domain);
        const typeFields = files.map((f) => `    readonly ${f.name}: ReturnType<typeof ${f.factoryName}>;`).join("\n");
        const pascalDomain = domain.charAt(0).toUpperCase() + domain.slice(1);
        return `export type ${pascalDomain}DomainAPI = {\n${typeFields}\n};`;
    });

    const lazyMethodGetters = allApiFiles.map((file) => {
        return (
            `    public get ${file.name}(): ReturnType<typeof ${file.factoryName}> {\n` +
            `        return (this._cache.${file.name} ??= ${file.factoryName}(this.ctx, this)) as ReturnType<typeof ${file.factoryName}>;\n` +
            `    }`
        );
    });

    const domainNamespaceGetters = sortedDomains.map((domain) => {
        const files = domainsMap.get(domain);
        const pascalDomain = domain.charAt(0).toUpperCase() + domain.slice(1);
        const getters = files.map((f) => `                get ${f.name}() { return api.${f.name}; },`).join("\n");
        return (
            `    public get ${domain}(): ${pascalDomain}DomainAPI {\n` +
            `        if (!this._domains.${domain}) {\n` +
            `            const createNamespace = (api: API): ${pascalDomain}DomainAPI => ({\n` +
            `${getters}\n` +
            `            });\n` +
            `            this._domains.${domain} = createNamespace(this);\n` +
            `        }\n` +
            `        return this._domains.${domain} as ${pascalDomain}DomainAPI;\n` +
            `    }`
        );
    });

    const emptyNewLine = "\n";

    const content =
        "" +
        'import { Listener } from "./apis/listen.js";\n' +
        emptyNewLine +
        importLines.join("\n") +
        emptyNewLine +
        'import { customFactory } from "./apis/custom.js";\n' +
        'import type { ZPWServiceMap, ContextSession } from "./context.js";\n' +
        emptyNewLine +
        domainTypeLines.join("\n\n") +
        emptyNewLine +
        emptyNewLine +
        "export class API {\n" +
        "    private readonly ctx: ContextSession;\n" +
        "    private readonly _cache: Record<string, unknown> = Object.create(null);\n" +
        "    private readonly _domains: Record<string, unknown> = Object.create(null);\n" +
        emptyNewLine +
        "    public zpwServiceMap: ZPWServiceMap;\n" +
        "    public listener: Listener;\n" +
        "    public custom: ReturnType<typeof customFactory>;\n" +
        emptyNewLine +
        "    constructor(ctx: ContextSession, zpwServiceMap: ZPWServiceMap, wsUrls: string[]) {\n" +
        "        this.ctx = ctx;\n" +
        "        this.zpwServiceMap = zpwServiceMap;\n" +
        "        this.listener = new Listener(ctx, wsUrls);\n" +
        "        this.custom = customFactory(ctx, this);\n" +
        "    }\n" +
        emptyNewLine +
        "    // =========================================================================\n" +
        "    // Domain-Driven Namespaces (12 Domains)\n" +
        "    // =========================================================================\n" +
        emptyNewLine +
        domainNamespaceGetters.join("\n\n") +
        emptyNewLine +
        emptyNewLine +
        "    // =========================================================================\n" +
        "    // Flat API Methods (100% Backward Compatible, Lazy Memoized)\n" +
        "    // =========================================================================\n" +
        emptyNewLine +
        lazyMethodGetters.join("\n\n") +
        emptyNewLine +
        "}\n";

    fs.writeFileSync(outputFile, content, "utf-8");
    console.log(
        `\nAPIs file generated at ${outputFile} (${allApiFiles.length} APIs across ${sortedDomains.length} domains)\n`,
    );
}

syncSdkVersion();
generateAPIsFile();
