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
    'File': '文件',
    'View': '视图',
    'Window': '窗口',
    'Zoom In': '放大',
    'Zoom Out': '缩小',
    'Reset Zoom': '重置缩放',
    'Toggle Developer Tools': '切换开发者工具',
    'Create Project': '创建项目',
    'Command Palette': '命令面板',
    'Minimize': '最小化',
    'Maximize': '最大化',
    'Close': '关闭',
    'Upgrade': '升级',
    'Sign Out': '退出登录',
    'Refresh': '刷新',
    'No MCP Servers': '没有 MCP 服务器',
    'Add MCP +': '添加 MCP +',
    'Build With Google Plugins': '使用 Google 插件构建',
    'Request Review': '请求审阅',
    'Edit': '编辑',
    'Open System Preferences': '打开系统偏好设置',

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
    'Enable Telemetry': '启用遥测',
    'Marketing Emails': '营销邮件',
    'Token Usage': '令牌用量',
    'Installed MCP Servers': '已安装的 MCP 服务器',
    'Skills': '技能',
    'Browser Settings': '浏览器设置',
    'Browser Javascript Execution Policy': '浏览器 JavaScript 执行策略',
    'Actuation Permissions': '执行权限',
    'Browser Actuation Rules': '浏览器执行规则',
    'App Settings': '应用设置',
    'Prevent Sleep': '阻止休眠',
    'Keep In Menu Bar': '保留在菜单栏',
    'Notifications': '通知',
    'Notification Settings': '通知设置',
    'Model Credits': '模型额度',
    'Enable AI Credit Overages': '启用 AI 额度超额使用',

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
    'Configure default behaviors, skills, and MCP servers.': '配置默认行为、技能和 MCP 服务器。',
    'Configure the browser subagent. It requires Google Chrome to be installed. The browser subagent can be invoked by typing /browser in the conversation input box.': '配置浏览器子代理。它需要先安装 Google Chrome。可在对话输入框中输入 /browser 来调用浏览器子代理。',
    'Controls whether the agent can run custom JavaScript to automate complex browser actions.': '控制智能体是否可以运行自定义 JavaScript 来自动执行复杂的浏览器操作。',
    'Configure allowed and denied URLs for browser actuation.': '配置允许和拒绝用于浏览器执行的 URL。',
    'Manage application settings.': '管理应用设置。',
    'Prevent the computer from sleeping while the app is running.': '在应用运行期间阻止计算机进入休眠。',
    'The app will be accessible from the menu bar and will keep running in the background when all windows are closed.': '应用将可从菜单栏访问，并会在所有窗口关闭后继续在后台运行。',
    'To modify notification settings, open your operating system\'s system preferences.': '要修改通知设置，请打开您操作系统的系统偏好设置。',
    'Configure AI models and view your quota.': '配置 AI 模型并查看您的额度。',
    'When toggled on, Antigravity will use your AI credits to fulfill model requests once you\'re out of model quota. Antigravity will always use your model quota first before using AI credits.': '启用后，当您的模型额度用尽时，Antigravity 将使用您的 AI 额度来完成模型请求。在使用 AI 额度之前，Antigravity 始终会优先使用您的模型额度。',
    'View your available model quota and AI credits. Model quota refreshes periodically based on your plan. Enable AI Credit Overages to continue using models when your quota is exhausted.': '查看您可用的模型额度和 AI 额度。模型额度会根据您的套餐定期刷新。启用 AI 额度超额使用后，在模型额度耗尽时仍可继续使用模型。',
    'Manage your plan, credentials, and general preferences.': '管理您的套餐、凭据和常规偏好设置。',
    'When toggled on, Antigravity collects usage data to help Google enhance performance and features.': '启用后，Antigravity 会收集使用数据，以帮助 Google 改进性能和功能。',
    'Receive product updates, tips, and promotions from Google Antigravity via email.': '通过电子邮件接收来自 Google Antigravity 的产品更新、技巧和推广信息。',
    'You can upgrade to a Google AI Ultra plan to receive the highest rate limits.': '您可以升级到 Google AI Ultra 套餐，以获得最高的速率限制。',
    'The breakdown below shows token usage from customizations like skills, rules, and MCP. If the budget is exceeded, large customizations will be truncated automatically.': '下方明细显示技能、规则和 MCP 等自定义项的令牌用量。如果超出预算，较大的自定义项将被自动截断。',
    'You currently don\'t have any MCP Servers installed. Add an MCP server above': '您当前尚未安装任何 MCP 服务器。请在上方添加一个 MCP 服务器。',
    'By using this app, you agree to its': '使用此应用即表示您同意其',
    'Terms of Service': '服务条款',
    'Show 2 breakdowns': '显示 2 个明细',
    'Agent settings and permissions for conversations outside of projects.': '项目外对话的智能体设置和权限。',
    'Choose a predefined security preset for the agent. This controls terminal auto-execution policy, and file access policy.': '为智能体选择预设安全策略。它会控制终端自动执行策略和文件访问策略。',
    'Specifies Agent\'s behavior when asking for review on artifacts, which are documents it creates to enable a richer conversation experience.': '指定智能体请求审阅制品时的行为。制品是它创建的文档，用于提供更丰富的对话体验。',
    'Inherits from global settings. Local permissions have higher priority.': '继承自全局设置。本地权限具有更高优先级。',
    'Configure allowed and denied paths for file reads and writes.': '配置允许和拒绝文件读写的路径。',
    'Configure allowed and denied URLs for reading.': '配置允许和拒绝读取的 URL。',
    'Configure allowed terminal commands.': '配置允许的终端命令。',
    'Configure allowed commands outside the sandbox.': '配置允许在沙盒外执行的命令。',

    // 输入区相关
    'Ask anything, @ to mention, / for actions': '提出任何问题，@提及，/采取行动',
    'to navigate': '导航',
    'to select': '选择',
    'to close': '关闭'
  };

  function getMappedText(text) {
    if (!text) return null;
    var t = text.trim();
    return UI_TEXT_MAP[t] || getRuleBasedText(t) || null;
  }

  function getRuleBasedText(text) {
    var match = text.match(/^(\d+(?:\.\d+)?)% of the customization budget is available\.$/);
    if (match) {
      return match[1] + '% 的自定义预算可用。';
    }

    match = text.match(/^Your Plan: (.+)$/);
    if (match) {
      return '您的套餐：' + match[1];
    }

    return null;
  }

  function getTranslationSync(text) {
    if (!text) return null;
    var t = text.trim();
    // 1. 尝试匹配静态字典
    var mapped = getMappedText(t);
    if (mapped) return mapped;
    // 2. 尝试从 LocalStorage 读取缓存
    try {
      var cached = localStorage.getItem('ag_zh_' + t);
      if (cached) return cached;
    } catch (e) {}
    return null;
  }

  function shouldTranslateOnline(text) {
    if (!text) return false;
    var t = text.trim();
    if (t.length <= 1) return false;

    // 过滤首字母为小写的项 (通常为变量名、项目名、文件名、方法名等)
    if (/^[a-z]/.test(t)) return false;

    // 过滤全小写且带 - 或 _ 的项目/目录 slug 结构 (如 01-elegant-darwin)
    if ((t.indexOf('-') !== -1 || t.indexOf('_') !== -1) && t.toLowerCase() === t) return false;

    // 过滤纯数字或百分比
    if (/^\d+%?$/.test(t)) return false;

    // 过滤 URL、IP 和系统路径
    if (/^(https?:\/\/|www\.)/i.test(t)) return false;
    if (/^[a-zA-Z]:\\/i.test(t) || t.indexOf('/') !== -1 || t.indexOf('\\') !== -1) return false;

    // 过滤单字文件名 (如 index.js)
    if (/\.[a-zA-Z0-9]+$/.test(t) && t.indexOf(' ') === -1) return false;

    // 过滤常见代码结构字符
    if (t.indexOf('{') !== -1 || t.indexOf('}') !== -1 || t.indexOf('=>') !== -1 || t.indexOf('(') !== -1 || t.indexOf(')') !== -1) return false;

    // 过滤单单词的 snake_case, camelCase 或大写缩写
    if (t.indexOf(' ') === -1) {
      if (t.indexOf('_') !== -1) return false;
      if (t.indexOf('-') !== -1 && !/^[a-zA-Z-]+$/.test(t)) return false;
      if (/[a-z][A-Z]/.test(t)) return false;
      if (/^[A-Z0-9]+$/.test(t)) return false;
    }

    // 必须包含英文字母
    if (!/[a-zA-Z]/.test(t)) return false;

    // 不能包含中文
    if (/[\u4e00-\u9fa5]/.test(t)) return false;

    return true;
  }

  var inFlightPromises = {};

  function translateOnline(text) {
    if (!text) return Promise.resolve(null);
    var t = text.trim();
    if (inFlightPromises[t]) return inFlightPromises[t];

    var promise = new Promise(function(resolve) {
      // 1. 尝试谷歌翻译
      var googleUrl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=' + encodeURIComponent(t);
      fetch(googleUrl)
        .then(function(res) {
          if (!res.ok) throw new Error('Google HTTP ' + res.status);
          return res.json();
        })
        .then(function(json) {
          var translated = json && json[0] && json[0][0] && json[0][0][0];
          if (translated && translated.trim() !== t) {
            var result = translated.trim();
            try {
              localStorage.setItem('ag_zh_' + t, result);
            } catch (e) {}
            resolve(result);
          } else {
            throw new Error('Google empty result');
          }
        })
        .catch(function(googleErr) {
          console.warn('Google translation failed, trying MyMemory fallback...', googleErr);
          // 2. 谷歌翻译失败，尝试国内直连备用接口 (MyMemory API)
          var myMemoryUrl = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(t) + '&langpair=en|zh-CN';
          fetch(myMemoryUrl)
            .then(function(res) {
              if (!res.ok) throw new Error('MyMemory HTTP ' + res.status);
              return res.json();
            })
            .then(function(json) {
              var translated = json && json.responseData && json.responseData.translatedText;
              if (translated && translated.trim() !== t && !translated.includes('MYMEMORY WARNING')) {
                var result = translated.trim();
                try {
                  localStorage.setItem('ag_zh_' + t, result);
                } catch (e) {}
                resolve(result);
              } else {
                resolve(null);
              }
            })
            .catch(function(myMemoryErr) {
              console.error('All translation fallbacks failed for "' + t + '":', myMemoryErr);
              resolve(null);
            });
        });
    });

    inFlightPromises[t] = promise;
    return promise;
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

  function isInsideSettings(node) {
    var el = node.nodeType === 3 ? node.parentElement : node;
    while (el && el !== document.body) {
      // 1. 标签检查
      var tag = el.tagName ? el.tagName.toUpperCase() : '';
      if (tag === 'DIALOG') return true;

      // 2. role 属性检查
      var role = el.getAttribute ? el.getAttribute('role') : '';
      if (role === 'dialog' || role === 'menu') return true;

      // 3. 类名与 ID 包含关键字匹配
      var className = el.className;
      if (className) {
        var clsStr = '';
        if (typeof className === 'string') {
          clsStr = className;
        } else if (typeof className.baseVal === 'string') {
          clsStr = className.baseVal;
        }
        clsStr = clsStr.toLowerCase();
        if (clsStr.indexOf('settings') !== -1 || 
            clsStr.indexOf('modal') !== -1 || 
            clsStr.indexOf('dialog') !== -1 || 
            clsStr.indexOf('popup') !== -1 || 
            clsStr.indexOf('overlay') !== -1 ||
            clsStr.indexOf('preferences') !== -1) {
          return true;
        }
      }

      var id = el.id;
      if (typeof id === 'string') {
        var idLower = id.toLowerCase();
        if (idLower.indexOf('settings') !== -1 || 
            idLower.indexOf('modal') !== -1 || 
            idLower.indexOf('dialog') !== -1 || 
            idLower.indexOf('popup') !== -1 || 
            idLower.indexOf('overlay') !== -1 ||
            idLower.indexOf('preferences') !== -1) {
          return true;
        }
      }

      el = el.parentElement;
    }
    return false;
  }

  function walk(root) {
    var tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n) {
        if (hasNoTranslate(n)) return NodeFilter.FILTER_REJECT;
        var text = n.textContent;
        // 静态字典或本地缓存匹配任意地方；在线翻译仅限于设置/弹窗内
        return (getTranslationSync(text) || (shouldTranslateOnline(text) && isInsideSettings(n)))
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
    var text = node.textContent;
    // 1. 同步翻译（静态字典 + 本地缓存）
    var mapped = getTranslationSync(text);
    if (mapped) {
      node.textContent = mapped;
      return;
    }
    // 2. 异步翻译补漏（限制在设置/弹窗内）
    var t = text.trim();
    if (shouldTranslateOnline(t) && isInsideSettings(node)) {
      translateOnline(t).then(function(translated) {
        if (translated && node.parentNode && node.textContent === text) {
          node.textContent = translated;
        }
      });
    }
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
        if (!value) continue;
        var trimmed = value.trim();
        // 1. 同步翻译
        var syncMapped = getTranslationSync(trimmed);
        if (syncMapped) {
          nodes[i].setAttribute(attr, syncMapped);
        } else if (shouldTranslateOnline(trimmed) && isInsideSettings(nodes[i])) {
          // 2. 异步翻译（限制在设置/弹窗内）
          (function(el, a, val, tr) {
            translateOnline(tr).then(function(translated) {
              if (translated && el.isConnected && el.getAttribute(a) === val) {
                el.setAttribute(a, translated);
              }
            });
          })(nodes[i], attr, value, trimmed);
        }
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

  function collectUniqueRoots(roots) {
    var unique = [];
    for (var i = 0; i < roots.length; i++) {
      var root = roots[i];
      if (!root || !root.isConnected) continue;

      var covered = false;
      for (var j = 0; j < unique.length; j++) {
        var current = unique[j];
        if (current === root) {
          covered = true;
          break;
        }
        if (current.nodeType === 1 && current.contains && current.contains(root)) {
          covered = true;
          break;
        }
        if (root.nodeType === 1 && root.contains && root.contains(current)) {
          unique.splice(j, 1);
          j--;
        }
      }

      if (!covered) unique.push(root);
    }
    return unique;
  }

  function start() {
    var pendingRoots = [];
    var flushScheduled = false;

    function flushPendingRoots() {
      flushScheduled = false;
      if (!pendingRoots.length) return;

      var roots = collectUniqueRoots(pendingRoots);
      pendingRoots = [];

      for (var i = 0; i < roots.length; i++) {
        translateTree(roots[i]);
      }
    }

    function scheduleTranslate(root) {
      if (!root) return;
      pendingRoots.push(root);
      if (flushScheduled) return;
      flushScheduled = true;
      requestAnimationFrame(flushPendingRoots);
    }

    translateTree(document.body);

    new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        for (var j = 0; j < m.addedNodes.length; j++) {
          scheduleTranslate(m.addedNodes[j]);
        }
        if (m.type === 'characterData' && m.target.nodeType === 3) {
          scheduleTranslate(m.target);
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
