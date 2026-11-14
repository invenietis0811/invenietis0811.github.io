/* =========================================================
   共享脚本：深浅色切换 + 中英切换 + 笔记页渲染
   主题存 localStorage 键 bp-theme，语言存 bp-lang
   ========================================================= */
(function () {
  var root = document.documentElement;
  var store = {
    get: function (k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var lang  = store.get('bp-lang', 'zh');
  var theme = store.get('bp-theme', 'light');

  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    store.set('bp-theme', t);
  }

  function applyLang(l) {
    lang = l;
    store.set('bp-lang', l);
    root.lang = (l === 'zh') ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-zh]').forEach(function (el) {
      var v = el.getAttribute(l === 'zh' ? 'data-zh' : 'data-en');
      if (v !== null) el.textContent = v;
    });
    var b = document.body;
    if (b.dataset.titleZh) document.title = (l === 'zh') ? b.dataset.titleZh : b.dataset.titleEn;
    var lb = document.getElementById('langToggle');
    if (lb) {
      lb.textContent = (l === 'zh') ? 'EN' : '中文';
      lb.setAttribute('aria-label', (l === 'zh') ? 'Switch to English' : '切换到中文');
    }
    if (typeof window.renderNote === 'function') window.renderNote();
  }

  /* ---------- 笔记内容：以后挂真实笔记就改这里 ----------
     每个 id 对应 articles.html 里一个卡片的 ?id= 值。
     zh / en 各含 title 和 body（body 是段落数组，一段一条）。 */
  var NOTES = {
    'feature': {
      zh: {
        title: '示例专题：LLM 辅助科学写作笔记',
        body: [
          '（测试内容：这是一篇示例专题笔记，后续替换为真实文章。）',
          '这篇示例用于展示笔记页面的排版：正文使用衬线字体、两倍行距与较窄的栏宽，适合长文阅读。',
          '维护方式：在 site.js 的 NOTES 对象中修改或新增笔记内容；在 articles.html 中复制一个卡片方块、把链接指向新的 id，即可增加一个入口。'
        ]
      },
      en: {
        title: 'Demo Feature: Notes on LLM-Assisted Scientific Writing',
        body: [
          '(Placeholder: this is a demo feature note; replace with your real article.)',
          'This demo shows the note layout: serif body text, generous line height and a narrow measure for long-form reading.',
          'Maintenance: edit the NOTES object in site.js to change or add notes; copy a card in articles.html and point it at a new id to add an entry.'
        ]
      }
    },
    'ns': {
      zh: { title: '小记：广义 NS 方程', body: ['（测试内容，待替换为真实笔记。）', '广义 NS 方程的示例笔记：推导、引理与参考文献都可以放在这里。'] },
      en: { title: 'Note: Generalized NS Equations', body: ['(Placeholder — replace with the real note.)', 'A demo note on generalized NS equations: derivations, lemmas and references can go here.'] }
    },
    'helmholtz': {
      zh: { title: '小记：Helmholtz 分解', body: ['（测试内容，待替换为真实笔记。）', '关于 Helmholtz 分解的示例笔记。'] },
      en: { title: 'Note: Helmholtz Decomposition', body: ['(Placeholder — replace with the real note.)', 'A demo note on the Helmholtz decomposition.'] }
    },
    'linear-map': {
      zh: { title: '碎碎念：线性变换在给定基下的矩阵表示', body: ['（测试内容，待替换为真实笔记。）', '关于线性变换、基与矩阵表示的一些示例笔记。'] },
      en: { title: 'Musings: Matrix Representation of Linear Maps under a Given Basis', body: ['(Placeholder — replace with the real note.)', 'Some demo notes on linear maps, bases and matrix representations.'] }
    },
    'schrodinger': {
      zh: { title: '如何把薛定谔方程“猜”出来', body: ['（测试内容，待替换为真实笔记。）', '关于如何“猜”出薛定谔方程的示例讨论。'] },
      en: { title: 'How to “Guess” the Schrödinger Equation', body: ['(Placeholder — replace with the real note.)', 'A demo discussion on how one might “guess” the Schrödinger equation.'] }
    },
    'calculus1': {
      zh: { title: '微积分题目 1', body: ['（测试内容，待替换为真实笔记。）', '微积分题目与解答的示例占位。'] },
      en: { title: 'Calculus Problem 1', body: ['(Placeholder — replace with the real note.)', 'A demo calculus problem with solution.'] }
    },
    'signals1': {
      zh: { title: '信号与系统随笔 1', body: ['（测试内容，待替换为真实笔记。）', '信号与系统学习随笔的示例占位。'] },
      en: { title: 'Signals & Systems — Jottings 1', body: ['(Placeholder — replace with the real note.)', 'Demo study jottings on signals and systems.'] }
    }
  };

  function renderNote() {
    var host = document.getElementById('noteRoot');
    if (!host) return;
    var id = '';
    try { id = new URLSearchParams(location.search).get('id') || ''; } catch (e) {}
    var n = NOTES[id];
    host.textContent = '';
    if (!n) {
      var h = document.createElement('h1');
      h.textContent = (lang === 'zh') ? '笔记不存在' : 'Note not found';
      var p = document.createElement('p');
      p.className = 'note-missing';
      p.textContent = (lang === 'zh')
        ? '链接中的 id「' + id + '」没有对应的笔记内容。请返回 Article 页面，或稍后由站长补充。'
        : 'No note matches id "' + id + '". Return to the Article page, or check back later.';
      host.appendChild(h);
      host.appendChild(p);
      return;
    }
    var d = n[lang] || n.zh;
    var kicker = document.createElement('p');
    kicker.className = 'note-kicker';
    kicker.textContent = (lang === 'zh') ? '笔记 · NOTE' : 'NOTE';
    var h1 = document.createElement('h1');
    h1.textContent = d.title;
    var meta = document.createElement('p');
    meta.className = 'note-meta';
    meta.textContent = (lang === 'zh') ? '测试内容 · 更新于 2026-11-14' : 'Demo content · updated 2026-11-14';
    host.appendChild(kicker);
    host.appendChild(h1);
    host.appendChild(meta);
    (d.body || []).forEach(function (t) {
      var el = document.createElement('p');
      el.textContent = t;
      host.appendChild(el);
    });
  }
  window.renderNote = renderNote;

  document.addEventListener('DOMContentLoaded', function () {
    var lt = document.getElementById('langToggle');
    var tt = document.getElementById('themeToggle');
    if (lt) lt.addEventListener('click', function () { applyLang(lang === 'zh' ? 'en' : 'zh'); });
    if (tt) tt.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
    applyTheme(theme);
    applyLang(lang);
    if (document.body.dataset.page === 'note') renderNote();
  });
})();
