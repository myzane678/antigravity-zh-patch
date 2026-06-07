// Antigravity 中文界面补丁 — 优先翻译固定 UI 文案，不翻译用户与 AI 对话正文
(function() {
  'use strict';

  // ========== 固定 UI 文案映射 ==========

  var UI_TEXT_MAP = {
    // 导航与通用入口
    'New Conversation': '新建对话',
    'Conversation History': '对话历史',
    'Scheduled Tasks': '计划任务',
    'Projects': '项目',
    'Conversations': '对话',
    'Install IDE': '安装 IDE',
    'Settings': '设置',
    'Provide Feedback': '提供反馈',
    'Open': '打开',
    'Default': '默认',
    'Preset': '预设',

    // 状态与初始化
    'Initializing Coding Session': '正在初始化编码会话',
    'Project Initialization and Setup': '项目初始化和设置',
    'Initial Greeting and Setup': '初始问候和设置',
    'Not in Project': '不在项目中',
    'Discovering Fun Websites': '发现有趣网站',
    'English Response Request': '英文回复请求',

    // 设置分类
    'General': '通用',
    'Account': '账户',
    'Permissions': '权限',
    'Appearance': '外观',
    'Models': '模型',
    'Customizations': '自定义',
    'Browser': '浏览器',
    'App': '应用',
    'Shortcuts': '快捷键',
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
    'Chat Settings': '对话设置',
    'Detailed Agent Chat': '详细代理聊天',
    'Show and save intermediate thinking steps': '显示并保存中间思维步骤',

    // 主题与外观
    'Light Theme': '浅色主题',
    'Dark Theme': '深色主题',
    'Light': '浅色',
    'Default Light': '默认浅色',
    'Default Dark': '默认深色',
    'Background': '背景',
    'Foreground': '前景',
    'Accent': '强调色',

    // 说明与帮助
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

    // 输入区相关
    'Ask anything, @ to mention, / for actions': '提出任何问题，@提及，/采取行动'
  };

  function getMappedText(text) {
    if (!text) return null;
    var t = text.trim();
    return UI_TEXT_MAP[t] || null;
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

  function walk(root) {
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n) {
        if (hasNoTranslate(n)) return NodeFilter.FILTER_REJECT;
        return getMappedText(n.textContent)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [];
    while (tw.nextNode()) nodes.push(tw.currentNode);
    return nodes;
  }

  function translateTextNode(node) {
    if (!node || !node.parentNode) return;
    var mapped = getMappedText(node.textContent);
    if (!mapped) return;
    node.textContent = mapped;
  }

  function translateAttrs(root) {
    if (!root || root.nodeType !== 1) return;
    var attrs = ['placeholder', 'title', 'aria-label'];
    var nodes = [root];
    if (root.querySelectorAll) {
      Array.prototype.push.apply(nodes, root.querySelectorAll('[placeholder], [title], [aria-label]'));
    }
    for (var i = 0; i < nodes.length; i++) {
      if (hasNoTranslate(nodes[i])) continue;
      for (var j = 0; j < attrs.length; j++) {
        var attr = attrs[j];
        var value = nodes[i].getAttribute && nodes[i].getAttribute(attr);
        var mapped = value && getMappedText(value);
        if (mapped) nodes[i].setAttribute(attr, mapped);
      }
    }
  }

  function translateTree(root) {
    if (!root) return;
    if (root.nodeType === 1) {
      translateAttrs(root);
      walk(root).forEach(translateTextNode);
      return;
    }
    if (root.nodeType === 3) {
      if (hasNoTranslate(root)) return;
      translateTextNode(root);
    }
  }

  function start() {
    translateTree(document.body);

    new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        for (var j = 0; j < m.addedNodes.length; j++) {
          translateTree(m.addedNodes[j]);
        }
        if (m.type === 'characterData' && m.target.nodeType === 3) {
          translateTree(m.target);
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
