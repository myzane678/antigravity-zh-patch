// 自动翻译注入脚本 — 监听页面英文文本，自动调用 Google Translate 翻译为中文
// 排除：模型名称、专有名词、用户自己发的英文、用户要求英文回答的场景
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
    'Install IDE': '安装 IDE'
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

  // ========== 翻译判定 ==========

  // 综合判定：文本是否需要翻译
  function needsTL(text) {
    if (!text || text.length < 2) return false;
    var t = text.trim();

    // 纯数字 / 纯符号 / URL 不译
    if (!/[a-zA-Z]/.test(t)) return false;
    if (/^(https?:\/\/|www\.|file:\/\/)/i.test(t)) return false;

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
      if (userWantsEnglish) return false;         // 用户要英文回答，全跳过
      if (isUserMessage(n)) return false;         // 用户自己发的
      if (isEditable(n)) return false;            // 输入框内
      var mapped = getMappedText(n.textContent);
      if (mapped) return true;
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
        return getMappedText(n.textContent) || needsTL(n.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [];
    while (tw.nextNode()) nodes.push(tw.currentNode);
    return nodes;
  }

  // ========== 启动 ==========

  function start() {
    walk(document.body).forEach(enq);

    new MutationObserver(function(mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        for (var j = 0; j < m.addedNodes.length; j++) {
          var n = m.addedNodes[j];
          if (n.nodeType === 1) {
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
