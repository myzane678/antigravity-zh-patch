# Antigravity 中文自动翻译补丁

这是一个用于 Antigravity 本地客户端的中文自动翻译补丁。

它会在页面加载完成后注入翻译脚本，将部分英文界面文案和英文回复自动翻译为中文。

## 当前版本

- 补丁版本：`v3.0.0`
- 已确认适配：Antigravity `2.0.11`
- 核心文件：
  - `patches/translate-inject.js`
  - 目标应用中的 `dist/utils.js` 注入逻辑

## 功能

- 自动翻译英文 UI 文案
- 自动翻译页面中新增的英文文本
- 翻译 `placeholder`、`title`、`aria-label` 中的固定 UI 文案
- 跳过用户自己输入的消息
- 跳过输入框、可编辑区域
- 跳过 `translate="no"` 标记区域
- 跳过模型名称、专有名词、URL、文件路径、命令行片段和疑似代码片段
- 跳过反引号、双引号、单引号中包裹的技术文本（文件名、命令、路径、代码标识符等）
- 当用户明确要求英文回答时，只暂停助手回复的自动翻译
- 对常见固定 UI 文案使用本地映射，减少翻译请求

## v3.0.0 更新重点

- 新增 `containsProtectedQuotedContent()` 函数，识别引号中的技术文本
- 反引号 `` `code` `` 包裹的内容自动跳过翻译
- 双引号/单引号中的技术内容（文件名、命令行、路径、URL、代码片段、标识符等）跳过翻译
- 12 条检测规则覆盖：文件名、CLI 命令、路径、URL、IP、代码片段、camelCase/snake_case 标识符、命令行 flag、技术缩写等

## 本项目不包含什么

本项目不包含 Antigravity 原应用代码、资源文件或二进制文件。

本项目只提供：

- 翻译注入脚本
- 手动安装说明
- 本地补丁使用说明

请不要把自己的 `app-extracted`、`dist`、安装包、二进制文件或原应用资源提交到本仓库。

## 安装方式

当前版本提供手动安装方式。

详细步骤见：

- [docs/manual-install.md](docs/manual-install.md)

## 先看这个：5 条避坑清单

1. **不要只看“目录像不像说明”，要看改完是否真的生效。**
2. **不要把 `Antigravity.exe` 所在目录当成补丁文件落点。** 真正要改的是程序实际加载的资源。
3. **不要只复制 `translate-inject.js` 不改 `utils.js`。** 脚本本体和注入入口缺一不可。
4. **不要只解包不回包。** 如果你的版本实际吃 `app.asar`，改完临时解包目录还不够，必须重新打包回去。
5. **不要只关窗口就算重启。** 一定要彻底退出 Antigravity 进程后再重新打开。

## 路径说明

不要照抄作者本机路径。

文档中的路径只用于帮助你开始排查，**不是保证所有机器都生效的固定答案**。

你需要找到自己机器上 **真正被程序加载** 的资源位置。常见情况有两种：

### 情况 A：运行时解包目录
目标目录通常叫：

```text
app-extracted/dist
```

判断标准之一是里面存在：

```text
utils.js
```

常见路径：

```text
Windows: %USERPROFILE%\.gemini\antigravity\app-extracted\dist
macOS/Linux: ~/.gemini/antigravity/app-extracted/dist
```

### 情况 B：安装目录里的 `resources/app.asar`
有些安装形态下，程序实际加载的是安装目录中的：

```text
resources/app.asar
```

这时需要：

1. 先解包 `app.asar`
2. 在解包后的 `dist/` 中放入 `translate-inject.js`
3. 修改同目录 `utils.js` 加入注入逻辑
4. 再重新打包覆盖回 `app.asar`

### 如何判断哪种情况适合你
不要只凭“看起来像目标目录”就直接修改。

正确原则是：

- 先找包含 `utils.js` 的候选目录
- 再确认程序实际是不是吃这套资源
- **最终以“改完并重启后是否生效”为准**

如果你改了 `app-extracted/dist` 不生效，就应该继续排查 `resources/app.asar`。

## 本机实测补充

至少有一种安装形态下，虽然下面这个路径存在：

```text
%USERPROFILE%\.gemini\antigravity\app-extracted\dist
```

但它**不是主生效路径**。

实测有效的是：

```text
C:\Users\<你的用户名>\AppData\Local\Programs\antigravity\resources\app.asar
```

也就是说：

- `Antigravity.exe` 是启动入口
- `resources/app.asar` 可能才是真正需要修改的主资源包

所以如果你按常见 `.gemini/.../app-extracted/dist` 路径安装后不生效，不要立刻怀疑脚本本身有问题，先排查当前版本是否实际吃 `app.asar`。

## 卸载

如果安装前备份了原文件，恢复备份即可。

详细卸载步骤见：

- [docs/manual-install.md#卸载](docs/manual-install.md#卸载)

## 风险说明

这是一个本地补丁工具，会修改你本机已安装应用的资源文件。

使用前请注意：

- 安装前务必备份原文件（`utils.js` 或 `app.asar`）
- Antigravity 更新后补丁可能失效
- 翻译使用 Google Translate 的非正式接口，可能不稳定
- 自动翻译可能影响页面布局或复制文本内容
- 不保证适配所有版本或所有安装形态

## 版本记录

见 [CHANGELOG.md](CHANGELOG.md)。

## License

MIT License
