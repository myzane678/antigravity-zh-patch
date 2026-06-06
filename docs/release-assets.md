# GitHub Release 附件说明

本文说明发布 GitHub Release 时建议上传的附件内容。

## 建议附件名称

```text
antigravity-zh-patch-v2.0.0.zip
```

## 建议附件内容

```text
antigravity-zh-patch-v2.0.0/
├─ patches/
│  └─ translate-inject.js
├─ docs/
│  └─ manual-install.md
├─ README.md
├─ CHANGELOG.md
└─ LICENSE
```

## 不要放入附件的内容

请不要在 Release 附件中包含以下内容：

```text
app.asar
app.asar.unpacked/
app-extracted/
dist/
Antigravity 安装包
language_server.exe
任何官方二进制文件
```

原因：本项目只发布中文自动翻译补丁，不分发 Antigravity 原应用代码、安装包、资源文件或二进制文件。

## Release 附件说明文案

创建 Release 时，可以在下载说明中使用以下文案：

```markdown
## 下载说明

请下载：

- `antigravity-zh-patch-v2.0.0.zip`

压缩包内包含：

- `patches/translate-inject.js`：自动翻译脚本
- `docs/manual-install.md`：手动安装说明
- `README.md`：项目说明
- `CHANGELOG.md`：版本更新记录
- `LICENSE`：开源许可证

本发布包不包含 Antigravity 原应用文件、安装包、`app.asar`、解包后的 `dist` 目录或任何官方二进制文件。

## 使用方式

1. 解压 `antigravity-zh-patch-v2.0.0.zip`
2. 按照 `docs/manual-install.md` 操作
3. 将 `patches/translate-inject.js` 复制到 Antigravity 解包后的 `dist` 目录
4. 修改目标应用中的 `utils.js`，加入自动翻译脚本注入逻辑
5. 完全退出并重启 Antigravity

## 适配版本

已确认适配：

- Antigravity `2.0.11`

其他版本可能可用，但未保证兼容。

## 注意事项

- 安装前务必备份目标应用中的 `utils.js`
- Antigravity 更新后可能覆盖补丁，需要重新安装
- 翻译使用 Google Translate 的非正式接口，网络不可用时动态翻译可能失效
- 自动翻译会直接替换页面中的英文文本，不保留原文
```

## Release 正文建议

创建 `v2.0.0` Release 时，可以使用以下正文：

```markdown
# Antigravity 中文自动翻译补丁 v2.0.0

本版本适配 Antigravity `2.0.11`。

## 更新内容

- 更新自动翻译脚本
- 扩充固定 UI 文案映射
- 支持 `placeholder`、`title`、`aria-label` 固定文案翻译
- 支持 `translate="no"` 跳过翻译
- 增强 URL、域名、IP、路径、文件名、命令行片段等不可翻译文本识别
- 优化用户要求英文回答时的逻辑：只跳过助手回复自动翻译，不全局关闭 UI 翻译
- 更新 README 和手动安装说明
- 新增 CHANGELOG

## 下载

请下载附件：

- `antigravity-zh-patch-v2.0.0.zip`

## 安装

解压后阅读：

```text
docs/manual-install.md
```

核心文件是：

```text
patches/translate-inject.js
```

安装时需要把它复制到 Antigravity 解包后的：

```text
app-extracted/dist/translate-inject.js
```

并在目标应用的 `utils.js` 中加入注入逻辑。

## 重要说明

本项目不包含 Antigravity 原应用代码、安装包、二进制文件或解包后的 `dist` 目录。

请使用者自行在本机合法安装的 Antigravity 客户端上进行本地补丁操作。

## 风险提示

- 安装前请备份 `utils.js`
- Antigravity 更新后补丁可能失效
- Google Translate 非正式接口可能不稳定
- 自动翻译可能影响部分页面文本展示或复制行为
```
