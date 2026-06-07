// 自动翻译注入脚本 — 监听页面英文文本，自动调用 Google Translate 翻译为中文
// 排除：模型名称、专有名词、用户自己发的英文、用户要求英文回答的场景、引号内技术文本
(function() {
  'use strict';
  var MARKER = '__agy_tl__';

  // ========== 固定 UI 文案映射 ==========

  var UI_TEXT_MAP = {
    'New Conversation': '新建对话',
    'Conversation History': '对话历史',
    'Scheduled Tasks': '计划任务',
    'Projects': '项目',
    'Conversations': '对话',
    'Initializing Coding Session': '正在初始化编码会话',
    'Project Initialization and Setup': '项目初始化和设置',
    'Initial Greeting and Setup': '初始问候和设置',
    'Install IDE': '安装 IDE',
    'Settings': '设置',
    'General': '通用',
    'Account': '账户',
    'Permissions': '权限',
    'Appearance': '外观',
    'Models': '模型',
    'Customizations': '自定义',
    'Browser': '浏览器',
    'App': '应用',
    'Not in Project': '不在项目中',
    'Shortcuts': '快捷键',
    'Provide Feedback': '提供反馈',
    'Agent Settings': '智能体设置',
    'Agent Behavior': '智能体行为',
    'Security Preset': '安全预设',
    'Artifact Review Policy': '制品审阅策略',
    'Local Permissions': '本地权限',
    'File Access Rules': '文件访问规则',
    'Network Access Rules': '网络访问规则',
    'Terminal Commands': '终端命令',
    'Commands Outside Sandbox': '沙盒外命令',
    'MCP Tools': 'MCP 工具',
    'Open': '打开',
    'Default': '默认',
    'Always Ask': '总是询问',
    'Learn more.': '了解更多。',
    'Learn more about': '了解更多：',
    'Agent settings and permissions for conversations outside of projects.': '项目外对话的智能体设置和权限。',
    'Choose a predefined security preset for the agent. This controls terminal auto-execution policy, and file access policy.': '为智能体选择预设安全策略。它会控制终端自动执行策略和文件访问策略。',
    'Specifies Agent\'s behavior when asking for review on artifacts, which are documents it creates to enable a richer conversation experience.': '指定智能体请求审阅制品时的行为。制品是它创建的文档，用于提供更丰富的对话体验。',
    'Inherits from global settings. Local permissions have higher priority.': '继承自全局设置。本地权限具有更高优先级。',
    'Configure allowed and denied paths for file reads and writes.': '配置允许和拒绝文件读写的路径。',
    'Configure allowed and denied URLs for reading.': '配置允许和拒绝读取的 URL。',
    'Configure allowed terminal commands.': '配置允许的终端命令。',
    'Configure allowed commands outside the sandbox.': '配置允许在沙盒外执行的命令。',
    'Chat Settings': '对话设置',
    'Detailed Agent Chat': '详细代理聊天',
    'Show and save intermediate thinking steps': '显示并保存中间思维步骤',
    'Light Theme': '浅色主题',
    'Dark Theme': '深色主题',
    'Light': '浅色',
    'Preset': '预设',
    'Default Light': '默认浅色',
    'Default Dark': '默认深色',
    'Background': '背景',
    'Foreground': '前景',
    'Accent': '强调色',
    'Discovering Fun Websites': '发现有趣网站',
    'English Response Request': '英文回复请求',
    'Ask anything, @ to mention, / for actions': '提出任何问题，@提及，/采取行动'
  };

  function getMappedText(text) {
    var t = text.trim();
    return UI_TEXT_MAP[t] || null;
  }

  // ========== 不需要翻译的黑名单 ==========

  // 模型名称（大小写不敏感匹配）
  var MODEL_NAMES = [
    'Gemini', 'Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Gemini 2.5 Ultra',
    'Gemini Ultra', 'Gemini Pro', 'Gemini Flash', 'Gemini Nano',
    'Gemini 2.0', 'Gemini 1.5', 'Gemini 1.0',
    'Claude', 'Claude Opus', 'Claude Sonnet', 'Claude Haiku',
    'Claude 3', 'Claude 3.5', 'Claude 4', 'Claude Opus 4', 'Claude Opus 4.8',
    'GPT-4', 'GPT-4o', 'GPT-4 Turbo', 'GPT-3.5', 'GPT-5', 'ChatGPT',
    'OpenAI o1', 'OpenAI o3', 'OpenAI o4',
    'DeepSeek', 'DeepSeek V3', 'DeepSeek R1', 'DeepSeek V4',
    'Llama', 'Llama 3', 'Llama 4', 'Meta Llama',
    'Mistral', 'Mixtral', 'Mistral Large',
    'Grok', 'Grok-2', 'Grok-3',
    'Gemma', 'PaLM', 'PaLM 2', 'Bard',
    'Antigravity', 'AGY',
    'Imagen', 'Veo', 'Sora',
    'Deep Research', 'Apps', 'Canvas'
  ];
  // 构建正则：整段文本恰好是模型名称
  var MODEL_RE = new RegExp('^\\s*(' + MODEL_NAMES.map(esc).join('|') + ')\\s*$', 'i');

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function isModelName(text) {
    var t = text.trim();
    if (t.length > 80) return false;
    if (/^(Gemini|Claude|GPT|GPT-OSS|OpenAI|DeepSeek|Llama|Mistral|Grok|Gemma)\b/i.test(t)) return true;
    return MODEL_RE.test(t);
  }

  // 专有名词判定：短文本 + 每个词首字母大写 + 没有常见英文功能词
  function isProperNoun(text) {
    var t = text.trim();
    if (t.length < 3 || t.length > 50) return false;
    if (!/^[A-Z]/.test(t)) return false;          // 必须以大写开头
    var words = t.split(/\s+/);
    if (words.length > 4) return false;            // 太长不是专有名词
    var funcWords = /^(the|a|an|is|are|was|were|be|been|in|on|at|to|for|of|and|or|but|if|it|we|he|she|they|this|that|these|those|my|your|his|her|our|their|me|him|us|them|not|no|yes|can|will|would|could|should|may|might|has|have|had|do|does|did)$/i;
    var allProper = words.every(function(w) {
      return /^[A-Z]/.test(w) && !funcWords.test(w);
    });
    return allProper;
  }

  // ========== 用户消息检测 ==========

  // 从文本节点向上查找所属消息容器，判断是否为用户消息
  function isUserMessage(node) {
    var el = node.nodeType === 3 ? node.parentElement : node;
    while (el && el !== document.body) {
      // 数据属性
      var role = el.getAttribute('data-sender') || el.getAttribute('data-role') || el.getAttribute('data-message-role');
      if (role && /user|human/i.test(role)) return true;
      if (role && /assistant|model|bot|agent/i.test(role)) return false;

      // CSS 类名
      var cls = (el.className || '');
      if (typeof cls === 'string') {
        if (/\buser\b/.test(cls) && !/\bassistant\b/.test(cls)) return true;
        if (/\bassistant\b/.test(cls) || /\bmodel\b/.test(cls) || /\bresponse\b/.test(cls)) return false;
      }

      // aria-label
      var al = (el.getAttribute('aria-label') || '');
      if (/\byou said\b/i.test(al) || /\byour message\b/i.test(al)) return true;

      el = el.parentElement;
    }
    return false;
  }

  function isAssistantMessage(node) {
    var el = node.nodeType === 3 ? node.parentElement : node;
    while (el && el !== document.body) {
      var role = el.getAttribute('data-sender') || el.getAttribute('data-role') || el.getAttribute('data-message-role');
      if (role && /assistant|model|bot|agent/i.test(role)) return true;
      if (role && /user|human/i.test(role)) return false;

      var cls = (el.className || '');
      if (typeof cls === 'string') {
        if (/\bassistant\b/.test(cls) || /\bmodel\b/.test(cls) || /\bresponse\b/.test(cls)) return true;
        if (/\buser\b/.test(cls) && !/\bassistant\b/.test(cls)) return false;
      }

      el = el.parentElement;
    }
    return false;
  }

  // 是否在输入框 / 可编辑区域内
  function isEditable(node) {
    var el = node.nodeType === 3 ? node.parentElement : node;
    while (el && el !== document.body) {
      if (el.isContentEditable) return true;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
      if (el.getAttribute('role') === 'textbox' || el.getAttribute('role') === 'combobox') return true;
      el = el.parentElement;
    }
    return false;
  }

  // 检测用户是否要求了英文回答（扫描页面上用户发送的最新几条消息）
  var userWantsEnglish = false;
  function checkUserWantsEnglish() {
    // 关键词：要求用英文回答
    var patterns = [
      /in\s+english/i, /用英文/, /用英语/, /说英文/, /说英语/,
      /speak\s+english/i, /respond\s+in\s+english/i,
      /english\s+please/i, /英文回答/, /英语回答/,
      /write\s+in\s+english/i, /output\s+in\s+english/i
    ];
    // 遍历页面上可能是用户消息的文本
    var allText = document.body.innerText || '';
    // 取页面后 2000 字符作为最近的对话内容
    var recent = allText.slice(-2000);
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].test(recent)) {
        userWantsEnglish = true;
        return;
      }
    }
    userWantsEnglish = false;
  }

  function hasNoTranslate(node) {
    var el = node.nodeType === 3 ? node.parentElement : node;
    while (el && el !== document.body) {
      var flag = el.getAttribute && el.getAttribute('translate');
      if (flag && flag.toLowerCase() === 'no') return true;
      if (flag && flag.toLowerCase() === 'yes') return false;
      el = el.parentElement;
    }
    return false;
  }

  // 检测文本中是否包含不应翻译的引号内容
  // 包括反引号、双引号、单引号包裹的技术性文本
  function containsProtectedQuotedContent(text) {
    if (!text) return false;

    // 反引号包裹的内容：`code` — 标记为代码/技术内容，不译
    if (/`[^`]+`/.test(text)) return true;

    // 双引号/单引号包裹的内容 — 判断是否为技术性内容
    var quotedPattern = /(["'])([^"'\n]+)\1/g;
    var match;
    while ((match = quotedPattern.exec(text)) !== null) {
      var quoted = match[2].trim();
      if (!quoted || quoted.length < 2) continue;

      // 文件名（带扩展名）
      if (/\.[a-zA-Z]{1,6}$/.test(quoted)) return true;

      // 命令行（以常见 CLI 命令开头）
      if (/^(npm|npx|pnpm|yarn|git|node|python|pip|curl|docker|kubectl|ssh|scp|gh|claude|asar|powershell|pwsh|cmd|brew|apt|choco|wget|make|gcc|g\+\+|cargo|rustc|go|java|javac)\b/i.test(quoted)) return true;

      // 路径（绝对路径或相对路径）
      if (/^([a-zA-Z]:[\\/]|[~\/]|\.\.?\/|\/)/.test(quoted)) return true;
      if (/^[\w.-]+[\\/][\w.-]+/.test(quoted)) return true;

      // URL 或域名
      if (/^(https?:\/\/|www\.|ftp:\/\/)/i.test(quoted)) return true;

      // IP 地址（含端口）
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(quoted)) return true;

      // 代码片段（含括号、等号等特殊字符）
      if (/[(){}=<>\[\];&|]/.test(quoted)) return true;

      // 驼峰命名标识符（camelCase）
      if (/^[a-z]+[A-Z][a-zA-Z0-9]*$/.test(quoted)) return true;

      // 下划线命名标识符（snake_case）
      if (/^[a-z0-9]+(_[a-z0-9]+)+$/.test(quoted)) return true;

      // 带命令行 flag 的参数（--xxx 或 -x 格式）
      if (/\s--?[a-zA-Z]/.test(quoted)) return true;

      // 技术性特殊字符开头（@、#、$）
      if (/^[@#$]/.test(quoted)) return true;

      // 全大写缩写（技术术语）
      if (/^[A-Z]{2,}$/.test(quoted) && quoted.length <= 10) return true;
    }

    return false;
  }

  function isNonTranslatableText(text) {
    if (!text) return false;
    var t = text.trim();
    if (!t) return false;

    // 包含反引号/引号中的技术内容，不译
    if (containsProtectedQuotedContent(t)) return true;

    // 邮箱、URL、域名、IP、localhost 不译
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(t)) return true;
    if (/\b(?:https?:\/\/|file:\/\/|mailto:|www\.)\S+/i.test(t)) return true;
    if (/\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?\b/i.test(t)) return true;
    if (/\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|io|ai|dev|app|cn|co|me|edu|gov|cloud|local|localhost)\b/i.test(t)) return true;

    // 文件路径、仓库路径、文件名不译
    if (/^[a-zA-Z]:[\\/]/.test(t)) return true;
    if (/(^|\s)(?:~\/|\.\.?\/|\/)[^\s]+/.test(t)) return true;
    if (/^[\w.-]+\/[\w.-]+$/.test(t)) return true;
    if (/\b[\w.-]+\.(?:json|js|ts|tsx|jsx|md|txt|yaml|yml|asar|exe|dll|png|jpg|jpeg|svg|css|html|py|sh|bat|cmd|ps1|lock|log|env)\b/i.test(t)) return true;

    // 命令行片段不译
    if (/^(?:npm|npx|pnpm|yarn|git|node|python|pip|curl|powershell|pwsh|cmd|docker|kubectl|ssh|scp|claude|asar)\b/i.test(t)) return true;

    // 用户名、标签、代码标识符、短 token 不译
    if (/^[@#][\w.-]+$/.test(t)) return true;
    if (/^[a-z]+[A-Z][A-Za-z0-9]*$/.test(t)) return true;
    if (/^[A-Z0-9_]{2,}$/.test(t)) return true;
    if (/^[A-Za-z0-9]+[-_][A-Za-z0-9_-]+$/.test(t)) return true;
    if (!/\s/.test(t) && /[\\/@:_$]/.test(t)) return true;

    return false;
  }

  // ========== 翻译判定 ==========

  // 综合判定：文本是否需要翻译
  function needsTL(text) {
    if (!text || text.length < 2) return false;
    var t = text.trim();

    // 纯数字 / 纯符号 / 标识类文本不译
    if (!/[a-zA-Z]/.test(t)) return false;
    if (isNonTranslatableText(t)) return false;

    // 模型名称不译
    if (isModelName(t)) return false;

    // 专有名词不译
    if (isProperNoun(t)) return false;

    // 代码片段不译（含特殊字符较多）
    var codeChars = (t.match(/[{}();=<>[\]`$|&@#]/g) || []).length;
    if (codeChars > t.length * 0.15) return false;

    // 英文占比大于中文
    var latin = 0, cjk = 0;
    for (var i = 0; i < t.length; i++) {
      if (/[a-zA-Z]/.test(t[i])) latin++;
      if (/[一-鿿]/.test(t[i])) cjk++;
    }
    return latin >= 2 && latin > cjk;
  }

  // ========== 翻译引擎 ==========

  function translate(text) {
    try {
      var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=' + encodeURIComponent(text);
      return fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(json) {
          return (json[0] || []).map(function(x) { return x[0]; }).join('') || null;
        });
    } catch(e) {
      return Promise.resolve(null);
    }
  }

  // ========== 批处理队列 ==========

  var queue = [];
  var timer = null;

  function flush() {
    var items = queue.slice();
    queue = [];

    checkUserWantsEnglish();

    var valid = items.filter(function(n) {
      if (!n.parentNode) return false;           // 已从 DOM 移除
      if (n[MARKER]) return false;               // 已翻译过
      var mapped = getMappedText(n.textContent);
      if (mapped) return true;
      if (userWantsEnglish && isAssistantMessage(n)) return false; // 用户要英文回答，只跳过助手回复自动翻译
      if (isUserMessage(n)) return false;         // 用户自己发的
      if (isEditable(n)) return false;            // 输入框内
      if (hasNoTranslate(n)) return false;        // translate=no 不译
      if (isNonTranslatableText(n.textContent)) return false; // 邮箱、域名、路径等不译
      if (isModelName(n.textContent.trim())) return false;  // 模型名
      if (isProperNoun(n.textContent.trim())) return false; // 专有名词
      return needsTL(n.textContent);
    });

    if (!valid.length) return;

    function processBatch(idx) {
      if (idx >= valid.length) return;
      var batch = valid.slice(idx, idx + 8);
      Promise.all(batch.map(function(n) {
        var mapped = getMappedText(n.textContent);
        if (mapped) return Promise.resolve(mapped);
        return translate(n.textContent.trim());
      })).then(function(results) {
        for (var j = 0; j < batch.length; j++) {
          var node = batch[j];
          var tl = results[j];
          if (tl && tl !== node.textContent.trim() && node.parentNode) {
            node.textContent = tl;
            node[MARKER] = true;
          }
        }
        processBatch(idx + 8);
      });
    }
    processBatch(0);
  }

  function enq(node) {
    if (node[MARKER]) return;
    queue.push(node);
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, 600);
  }

  // ========== 文本节点遍历 ==========

  function walk(root) {
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n) {
        if (n[MARKER]) return NodeFilter.FILTER_REJECT;
        if (hasNoTranslate(n)) return NodeFilter.FILTER_REJECT;
        return getMappedText(n.textContent) || needsTL(n.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [];
    while (tw.nextNode()) nodes.push(tw.currentNode);
    return nodes;
  }

  function translateAttrs(root) {
    if (!root || root.nodeType !== 1) return;
    var attrs = ['placeholder', 'title', 'aria-label'];
    var nodes = [root];
    if (root.querySelectorAll) {
      Array.prototype.push.apply(nodes, root.querySelectorAll('[placeholder], [title], [aria-label]'));
    }
    for (var i = 0; i < nodes.length; i++) {
      for (var j = 0; j < attrs.length; j++) {
        var attr = attrs[j];
        if (hasNoTranslate(nodes[i])) continue;
        var value = nodes[i].getAttribute && nodes[i].getAttribute(attr);
        if (isNonTranslatableText(value)) continue;
        var mapped = value && getMappedText(value);
        if (mapped) nodes[i].setAttribute(attr, mapped);
      }
    }
  }

  // ========== 启动 ==========

  function start() {
    translateAttrs(document.body);
    walk(document.body).forEach(enq);

    new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        for (var j = 0; j < m.addedNodes.length; j++) {
          var n = m.addedNodes[j];
          if (n.nodeType === 1) {
            translateAttrs(n);
            walk(n).forEach(enq);
          } else if (n.nodeType === 3) {
            enq(n);
          }
        }
        if (m.type === 'characterData' && m.target.nodeType === 3) {
          enq(m.target);
        }
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  if (document.body) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start);
  }
})();
