# Antigravity 中文界面补丁

这是一个用于 Antigravity 本地客户端的中文界面补丁。

它会在页面加载完成后注入脚本，把常见英文界面文案翻译为中文，优先解决界面可用性问题，而不是替代通用正文翻译器。

> 当前版本定位：**优先翻译 UI，不翻译用户与 AI 对话正文。**

## 当前版本

- 补丁版本：`v3.0.1`
- 已确认适配：Antigravity `2.0.11`
- 核心文件：
  - `patches/translate-inject.js`
  - 目标应用中的 `dist/utils.js` 注入逻辑

## 功能

- 翻译固定英文 UI 文案
- 翻译页面中新增的固定 UI 文本节点
- 翻译 `placeholder`、`title`、`aria-label` 中的固定 UI 文案
- 跳过 `translate="no"` 标记区域
- 不翻译用户消息正文
- 不翻译 AI 回复正文
- 使用本地 UI 文案映射，不依赖在线翻译接口

## v3.0.1 更新重点

- 产品定位收缩为“中文界面补丁”，优先翻译 UI，不翻译对话正文
- 移除正文自动翻译与在线翻译请求逻辑，降低误翻译风险
- 继续强化 `app-extracted/dist` 与 `resources/app.asar` 两种安装形态说明
- 增加更明确的安装成功自检清单
- 新增独立排障文档 `docs/troubleshooting.md`
- 按类别整理 `UI_TEXT_MAP`，降低后续维护成本

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
- [docs/troubleshooting.md](docs/troubleshooting.md)

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

## 安装成功自检清单

安装完成后，请至少检查以下几项：

1. 目标 `dist` 目录里同时存在：

```text
utils.js
translate-inject.js
```

2. `utils.js` 中能搜到：

```text
translate-inject.js
executeJavaScript
did-finish-load
```

3. 如果你走的是 `app.asar` 路线，确认修改后的内容已经**重新打包覆盖回**：

```text
resources/app.asar
```

4. 已经**完全退出并重新打开** Antigravity，而不是只关闭窗口。

5. 重启后，以下固定 UI 文案能看到中文，例如：

```text
New Conversation -> 新建对话
Settings -> 设置
Permissions -> 权限
Ask anything, @ to mention, / for actions -> 提出任何问题，@提及，/采取行动
```

如果以上检查都没问题但仍不生效，请继续看：

- [docs/troubleshooting.md](docs/troubleshooting.md)

## 更新后如何快速重装补丁

Antigravity 更新后，补丁可能因为以下文件被覆盖而失效：

- `utils.js`
- `resources/app.asar`

这时建议按最小流程重新操作：

1. 先判断当前版本更可能吃 `app-extracted/dist` 还是 `resources/app.asar`
2. 重新放置 `translate-inject.js`
3. 重新确认 `utils.js` 中仍有注入逻辑
4. 如果你走的是 `app.asar` 路线，重新打包覆盖回 `resources/app.asar`
5. 完全退出并重启 Antigravity

如果你不确定当前版本吃哪套资源，请先看：

- [docs/troubleshooting.md](docs/troubleshooting.md)

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

- [docs/manual-install.md#卸载--回滚](docs/manual-install.md#卸载--回滚)

## 风险说明

这是一个本地补丁工具，会修改你本机已安装应用的资源文件。

使用前请注意：

- 安装前务必备份原文件（`utils.js` 或 `app.asar`）
- Antigravity 更新后补丁可能失效
- 自动翻译仅针对固定 UI 文案，不保证覆盖所有界面文本
- 不保证适配所有版本或所有安装形态

## 版本记录

见 [CHANGELOG.md](CHANGELOG.md)。

## License

MIT License
