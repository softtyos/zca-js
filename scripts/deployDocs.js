import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "docs", ".vitepress", "dist");
const docsRepoUrl = process.env.DOCS_REPO_URL || "https://github.com/softtyos/zca-js-docs.git";

function run(cmd, cwd = rootDir, env = process.env) {
    console.log(`> ${cmd}`);
    execSync(cmd, { cwd, env, stdio: "inherit" });
}

function deployDocs() {
    // 1. Generate markdown docs & build VitePress with /zca-js-docs/ base
    run("node scripts/generateDocs.js", rootDir);
    run("npx vitepress build docs", rootDir, {
        ...process.env,
        VITEPRESS_BASE: "/zca-js-docs/",
    });

    // 2. Create .nojekyll so GitHub Pages serves VitePress _assets properly
    fs.writeFileSync(path.join(distDir, ".nojekyll"), "", "utf-8");

    // 3. Initialize temporary git repo in distDir and push to gh-pages branch of softtyos/zca-js-docs
    const gitDir = path.join(distDir, ".git");
    if (fs.existsSync(gitDir)) {
        fs.rmSync(gitDir, { recursive: true, force: true });
    }

    run("git init -b gh-pages", distDir);
    run("git add -A", distDir);
    run('git commit -m "docs: deploy VitePress documentation"', distDir);
    run(`git push -f ${docsRepoUrl} gh-pages:gh-pages`, distDir);

    console.log("\n✅ Đã xuất bản thành công tài liệu lên https://softtyos.github.io/zca-js-docs/");
}

deployDocs();
