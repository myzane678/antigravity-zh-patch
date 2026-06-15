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
const FORCE_PATCH_FLAG = path.join(APP_DIR, 'force-patch.flag');

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
    const tempAsarPath = path.join(SCRATCH_DIR, 'temp-app.asar');
    
    try {
        console.log('检测到汉化补丁失效，正在自动重新应用...');
        
        // 1. 备份（如果备份文件不存在，则复制一份，避免覆盖健康备份）
        if (fs.existsSync(ASAR_PATH) && !fs.existsSync(BAK_PATH)) {
            fs.copyFileSync(ASAR_PATH, BAK_PATH);
        }
        
        // 2. 清理之前的临时解压目录与临时 asar 文件
        if (fs.existsSync(TEMP_EXTRACT)) {
            fs.rmSync(TEMP_EXTRACT, { recursive: true, force: true });
        }
        if (fs.existsSync(tempAsarPath)) {
            fs.rmSync(tempAsarPath, { force: true });
        }
        
        // 3. 解压 asar，使用 -y 强制非交互模式
        console.log('正在解压资源包...');
        execSync(`npx -y asar extract "${ASAR_PATH}" "${TEMP_EXTRACT}"`);
        
        // 4. 验证解压是否成功
        const distDir = path.join(TEMP_EXTRACT, 'dist');
        if (!fs.existsSync(distDir)) {
            throw new Error('解压失败，未找到 dist 目录。可能是由于 npx 执行异常或权限不足导致。');
        }
        
        // 5. 复制汉化脚本
        const patchDest = path.join(distDir, 'translate-inject.js');
        fs.copyFileSync(PATCH_SCRIPT_SOURCE, patchDest);
        
        // 6. 修改 utils.js
        const utilsPath = path.join(distDir, 'utils.js');
        if (!fs.existsSync(utilsPath)) {
            throw new Error('未找到核心文件 utils.js，无法注入补丁。');
        }
        
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
        
        // 7. 打包至临时 asar 文件中，使用 -y 避免卡后台
        console.log('正在重新打包资源包至临时文件...');
        execSync(`npx -y asar pack "${TEMP_EXTRACT}" "${tempAsarPath}" --unpack-dir "node_modules/chrome-devtools-mcp"`);
        
        // 8. 严格校验打包后的临时 asar 文件大小（必须大于 1MB，原文件 2.12MB，防止空包损坏软件）
        if (!fs.existsSync(tempAsarPath)) {
            throw new Error('重新打包失败，未生成临时 asar 文件。');
        }
        const tempStats = fs.statSync(tempAsarPath);
        if (tempStats.size < 1024 * 1024) { 
            throw new Error('重新打包文件异常，大小仅为 ' + tempStats.size + ' 字节，拒绝替换原文件。');
        }
        
        // 9. 安全交换文件（原子重命名）
        console.log('安全校验通过，正在替换原资源包...');
        if (fs.existsSync(ASAR_PATH)) {
            try {
                if (fs.existsSync(BAK_PATH)) {
                    fs.unlinkSync(BAK_PATH);
                }
                fs.renameSync(ASAR_PATH, BAK_PATH);
            } catch (backupError) {
                console.warn('备份或删除旧 asar 失败，尝试直接覆盖:', backupError);
            }
        }
        
        fs.renameSync(tempAsarPath, ASAR_PATH);
        
        // 10. 清理解压临时目录
        fs.rmSync(TEMP_EXTRACT, { recursive: true, force: true });
        
        console.log('汉化补丁重新应用成功！');
    } catch (e) {
        console.error('应用汉化补丁时出错（原文件已安全保留，未做任何修改）:', e);
        // 清理临时文件，防止垃圾堆积
        try {
            if (fs.existsSync(tempAsarPath)) fs.unlinkSync(tempAsarPath);
            if (fs.existsSync(TEMP_EXTRACT)) fs.rmSync(TEMP_EXTRACT, { recursive: true, force: true });
        } catch (cleanupError) {}
    }
}

// 主逻辑
if (!isPatched() || fs.existsSync(FORCE_PATCH_FLAG)) {
    applyPatch();
    try {
        fs.unlinkSync(FORCE_PATCH_FLAG);
    } catch (e) {}
}

console.log('正在启动 Antigravity...');
const { spawn } = require('child_process');
const child = spawn(EXE_PATH, [], {
    detached: true,
    stdio: 'ignore'
});
child.unref();
process.exit(0);
