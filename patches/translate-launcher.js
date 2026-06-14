const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APP_DIR = path.join(process.env.LOCALAPPDATA, 'Programs/antigravity');
const ASAR_PATH = path.join(APP_DIR, 'resources/app.asar');
const BAK_PATH = path.join(APP_DIR, 'resources/app.asar.bak');
const EXE_PATH = path.join(APP_DIR, 'Antigravity.exe');
const SCRATCH_DIR = path.join(process.env.USERPROFILE, '.gemini/antigravity/scratch');
const PATCH_SCRIPT_SOURCE = path.join(APP_DIR, 'translate-inject-backup.js');
const TEMP_EXTRACT = path.join(SCRATCH_DIR, 'launcher-temp');

function isPatched() {
    if (!fs.existsSync(ASAR_PATH)) return true;
    try {
        const content = fs.readFileSync(ASAR_PATH);
        return content.includes(Buffer.from('translate-inject.js'));
    } catch (e) {
        console.error('Failed to read app.asar:', e);
        return true; // Avoid infinite patch loop if read fails
    }
}

function applyPatch() {
    try {
        console.log('检测到汉化补丁失效，正在自动重新应用...');
        
        // 1. 备份
        if (fs.existsSync(ASAR_PATH)) {
            fs.copyFileSync(ASAR_PATH, BAK_PATH);
        }
        
        // 2. 清理之前的临时目录（如果存在）
        if (fs.existsSync(TEMP_EXTRACT)) {
            fs.rmSync(TEMP_EXTRACT, { recursive: true, force: true });
        }
        
        // 3. 解压 asar
        console.log('正在解压资源包...');
        execSync(`npx asar extract "${ASAR_PATH}" "${TEMP_EXTRACT}"`, { stdio: 'ignore' });
        
        // 4. 复制汉化脚本
        const patchDest = path.join(TEMP_EXTRACT, 'dist/translate-inject.js');
        fs.copyFileSync(PATCH_SCRIPT_SOURCE, patchDest);
        
        // 5. 修改 utils.js
        const utilsPath = path.join(TEMP_EXTRACT, 'dist/utils.js');
        if (fs.existsSync(utilsPath)) {
            let utilsContent = fs.readFileSync(utilsPath, 'utf-8');
            const targetStr = 'void win.loadURL(url);\r\n    return win;\r\n}';
            const targetStrLF = 'void win.loadURL(url);\n    return win;\n}';
            
            const injectStr = `// 自动翻译注入 — 页面加载完成后执行翻译脚本
    win.webContents.on('did-finish-load', () => {
        const injectPath = path_1.default.join(__dirname, 'translate-inject.js');
        try {
            const script = fs.readFileSync(injectPath, 'utf-8');
            void win.webContents.executeJavaScript(script);
        }
        catch (e) {
            console.error('Failed to inject translate script:', e);
        }
    });
    void win.loadURL(url);
    return win;
}`;
            if (utilsContent.includes(targetStr)) {
                utilsContent = utilsContent.replace(targetStr, injectStr);
            } else if (utilsContent.includes(targetStrLF)) {
                utilsContent = utilsContent.replace(targetStrLF, injectStr);
            } else {
                // Fallback replace
                utilsContent = utilsContent.replace('void win.loadURL(url);', `win.webContents.on('did-finish-load', () => {
        const injectPath = path_1.default.join(__dirname, 'translate-inject.js');
        try {
            const script = fs.readFileSync(injectPath, 'utf-8');
            void win.webContents.executeJavaScript(script);
        }
        catch (e) {
            console.error('Failed to inject translate script:', e);
        }
    });
    void win.loadURL(url);`);
            }
            fs.writeFileSync(utilsPath, utilsContent, 'utf-8');
        }
        
        // 6. 打包回 app.asar (指定不打包 chrome-devtools-mcp 到 app.asar)
        console.log('正在重新打包资源包...');
        execSync(`npx asar pack "${TEMP_EXTRACT}" "${ASAR_PATH}" --unpack-dir "node_modules/chrome-devtools-mcp"`, { stdio: 'ignore' });
        
        // 7. 清理临时目录
        fs.rmSync(TEMP_EXTRACT, { recursive: true, force: true });
        
        console.log('汉化补丁重新应用成功！');
    } catch (e) {
        console.error('应用汉化补丁时出错:', e);
    }
}

// 主逻辑
if (!isPatched()) {
    applyPatch();
}

console.log('正在启动 Antigravity...');
const { spawn } = require('child_process');
const child = spawn(EXE_PATH, [], {
    detached: true,
    stdio: 'ignore'
});
child.unref();
process.exit(0);
