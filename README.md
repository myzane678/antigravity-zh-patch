# Antigravity 中文自动翻译补丁

这是一个用于 Antigravity 本地客户端的中文自动翻译补丁。

它会在页面加载完成后注入翻译脚本，将部分英文界面文案和英文回复自动翻译为中文。

## 当前版本

- 补丁版本：`v2.0.0`
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
- 当用户明确要求英文回答时，只暂停助手回复的自动翻译
- 对常见固定 UI 文案使用本地映射，减少翻译请求

## v2.0.0 更新重点

- 适配 Antigravity `2.0.11`
- 扩充固定 UI 文案映射
- 增加 `Project Initialization and Setup`、`Initial Greeting and Setup` 等常见文案
- 增强不可翻译内容识别，包括邮箱、域名、IP、路径、文件名、命令行片段等
- 支持固定文案属性翻译：`placeholder`、`title`、`aria-label`
- 支持 `translate="no"` 跳过翻译
- 优化“用户要求英文回答”逻辑：只跳过助手回复，不影响普通 UI 文案映射

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

[docs/manual-install.md](docs/manual-install.md)

## 路径说明

不要照抄作者本机路径。

你需要找到自己机器上的 Antigravity 解包目录，目标目录通常叫：

```text
app-extracted/dist
```

判断找对目录的标准是里面存在：

```text
utils.js
```

常见路径：

```text
Windows: %USERPROFILE%\.gemini\antigravity\app-extracted\dist
macOS/Linux: ~/.gemini/antigravity/app-extracted/dist
```

如果你的安装位置不同，以你自己的实际目录为准。

## 卸载

如果安装前备份了 `utils.js`，将备份文件恢复即可。

同时删除目标目录里的：

```text
translate-inject.js
```

详细卸载步骤见：

[docs/manual-install.md](docs/manual-install.md#卸载)

## 风险说明

这是一个本地补丁工具，会修改你本机已安装应用的解包文件。

使用前请注意：

- 安装前务必备份 `utils.js`
- Antigravity 更新后补丁可能失效
- 翻译使用 Google Translate 的非正式接口，可能不稳定
- 自动翻译可能影响页面布局或复制文本内容
- 不保证适配所有版本

## 版本记录

见 [CHANGELOG.md](CHANGELOG.md)。

## License

MIT License
