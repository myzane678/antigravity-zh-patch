# 手动安装说明

本文说明如何手动安装 Antigravity 中文自动翻译补丁。

## 适配版本

当前补丁版本：`v2.0.0`

已确认适配：

```text
Antigravity 2.0.11
```

## 重要提醒

不要照抄作者本机路径。每个人的真实安装位置可能不同。

你需要找到自己机器上的目标目录：

```text
app-extracted/dist
```

只要这个目录里存在 `utils.js`，就可以作为补丁目标目录。

本补丁的最小闭环是：

```text
translate-inject.js  # 翻译脚本本体
utils.js             # 负责把翻译脚本注入页面
```

## 第一步：找到目标 dist 目录

常见位置如下。

Windows：

```text
%USERPROFILE%\.gemini\antigravity\app-extracted\dist
```

例如：

```text
C:\Users\Alice\.gemini\antigravity\app-extracted\dist
```

macOS / Linux：

```text
~/.gemini/antigravity/app-extracted/dist
```

如果你的 Antigravity 不在这些位置，请以自己的实际目录为准。

判断找对目录的标准：

```text
utils.js
```

建议同时能看到：

```text
preload.js
constants.js
```

## 第二步：备份 utils.js

在目标目录中，把：

```text
utils.js
```

复制一份，命名为：

```text
utils.js.bak
```

如果后续需要卸载，可以用这个备份恢复。

## 第三步：复制翻译脚本

把本项目中的：

```text
patches/translate-inject.js
```

复制到你的目标目录：

```text
app-extracted/dist/translate-inject.js
```

复制完成后，目标目录中应该同时存在：

```text
utils.js
translate-inject.js
```

## 第四步：修改 utils.js

打开目标目录中的：

```text
utils.js
```

找到 `createWindow(url)` 函数里的这行：

```js
void win.loadURL(url);
```

在它前面加入下面这段注入逻辑：

```js
// 自动翻译注入 — 页面加载完成后执行翻译脚本
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
```

保存文件。

## 第五步：重启 Antigravity

完全退出 Antigravity，然后重新打开。

如果页面中的英文 UI 或英文回复被翻译为中文，说明补丁已经生效。

## 如何判断是否装成功

可以检查以下几项：

1. 目标目录里同时存在：

```text
utils.js
translate-inject.js
```

2. `utils.js` 中能搜到：

```text
translate-inject.js
executeJavaScript
```

3. 打开 Antigravity 后，常见 UI 文案会显示为中文，例如：

```text
New Conversation -> 新建对话
Settings -> 设置
Permissions -> 权限
Ask anything, @ to mention, / for actions -> 提出任何问题，@提及，/采取行动
```

## 卸载

### 有备份时

关闭 Antigravity。

删除目标目录里的：

```text
utils.js
```

把备份文件：

```text
utils.js.bak
```

改回：

```text
utils.js
```

然后删除：

```text
translate-inject.js
```

重新打开 Antigravity 即可。

### 没有备份时

关闭 Antigravity。

打开目标目录里的：

```text
utils.js
```

删除包含以下内容的注入代码块：

```text
did-finish-load
translate-inject.js
executeJavaScript
```

然后删除：

```text
translate-inject.js
```

保存后重新打开 Antigravity。

## 常见问题

### 找不到 app-extracted/dist 怎么办？

先搜索 `utils.js`。如果某个目录同时包含 `utils.js`、`preload.js`、`constants.js`，大概率就是目标目录。

### 更新后失效怎么办？

Antigravity 更新后可能覆盖 `utils.js`，需要重新安装补丁。

### 翻译不生效怎么办？

请检查：

1. `translate-inject.js` 是否放在 `utils.js` 同一目录
2. `utils.js` 是否已经加入注入逻辑
3. 是否已经完全重启 Antigravity
4. 当前网络是否可以访问 Google Translate 接口

### 会不会保留原英文？

当前版本会直接把符合条件的英文文本节点替换为中文，不保留原英文。

如果后续遇到页面逻辑依赖原英文文本的问题，可以再改成追加翻译、悬浮提示或双语显示。
