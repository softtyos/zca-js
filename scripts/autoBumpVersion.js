import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import semver from "semver";

const rootDir = process.cwd();
const pkgPath = path.join(rootDir, "package.json");
const lockPath = path.join(rootDir, "package-lock.json");
const protocolPath = path.join(rootDir, "src", "constants", "protocol.ts");

function getRemoteMainVersion() {
    try {
        execSync("git fetch origin main --quiet", {
            stdio: "ignore",
            timeout: 5000,
        });
    } catch {
        // Bỏ qua nếu đang offline hoặc không kết nối được remote, dùng cache origin/main hiện có
    }

    for (const ref of ["origin/main:package.json", "main:package.json"]) {
        try {
            const raw = execSync(`git show ${ref}`, {
                encoding: "utf-8",
                stdio: ["ignore", "pipe", "ignore"],
            });
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed.version === "string" && semver.valid(parsed.version)) {
                return parsed.version;
            }
        } catch {
            // Thử ref tiếp theo
        }
    }

    return null;
}

function syncVersionFiles() {
    if (!fs.existsSync(pkgPath)) return;

    const pkgRaw = fs.readFileSync(pkgPath, "utf-8");
    const pkg = JSON.parse(pkgRaw);
    const localVersion = pkg.version;
    const remoteVersion = getRemoteMainVersion();

    let targetVersion = localVersion;

    if (remoteVersion && semver.valid(localVersion) && semver.lte(localVersion, remoteVersion)) {
        const bumped = semver.inc(remoteVersion, "patch");
        if (bumped) {
            targetVersion = bumped;
            console.log(
                `[AutoBump] Version hiện tại (${localVersion}) <= origin/main (${remoteVersion}) -> Tự động nâng lên ${targetVersion}`,
            );
        }
    }

    const stagedFiles = [];

    // 1. Cập nhật package.json nếu cần
    if (pkg.version !== targetVersion) {
        pkg.version = targetVersion;
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + "\n", "utf-8");
        stagedFiles.push("package.json");
    }

    // 2. Đồng bộ package-lock.json
    if (fs.existsSync(lockPath)) {
        const lockRaw = fs.readFileSync(lockPath, "utf-8");
        const updatedLock = lockRaw.replace(
            /^(\{\s*"name":\s*"[^"]+",\s*"version":\s*")"[^"]+"(,\s*"lockfileVersion":\s*\d+,\s*"requires":\s*true,\s*"packages":\s*\{\s*"":\s*\{\s*"name":\s*"[^"]+",\s*"version":\s*")"[^"]+"/,
            `$1${targetVersion}"$2${targetVersion}"`,
        );
        if (updatedLock !== lockRaw) {
            fs.writeFileSync(lockPath, updatedLock, "utf-8");
            stagedFiles.push("package-lock.json");
        }
    }

    // 3. Đồng bộ ZALO_PROTOCOL.SDK_VERSION trong src/constants/protocol.ts
    if (fs.existsSync(protocolPath)) {
        const protocolRaw = fs.readFileSync(protocolPath, "utf-8");
        const updatedProtocol = protocolRaw.replace(
            /SDK_VERSION:\s*"[^"]+"/,
            `SDK_VERSION: "${targetVersion}"`,
        );
        if (updatedProtocol !== protocolRaw) {
            fs.writeFileSync(protocolPath, updatedProtocol, "utf-8");
            stagedFiles.push("src/constants/protocol.ts");
        }
    }

    // 4. Tự động git add các file version đã được đồng bộ vào commit hiện tại
    if (stagedFiles.length > 0) {
        try {
            execSync(`git add ${stagedFiles.join(" ")}`, { stdio: "ignore" });
        } catch {
            // Bỏ qua nếu chạy ngoài ngữ cảnh git
        }
    }
}

syncVersionFiles();
