/**
 * 心理教育コンテンツ - こころのクリニック桜が丘
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'education_progress';
  const $ = (sel) => document.querySelector(sel);

  // --- 記事データ ---
  const articles = [
    {
      id: 'what-is-mindfulness',
      title: 'マインドフルネスとは',
      readTime: '5分',
      content: `
        <h2>マインドフルネスとは</h2>
        <p>マインドフルネスとは、「今この瞬間」に意識を向け、評価や判断を加えずに、ありのままの体験を観察する心の状態のことです。</p>
        <p>私たちの心は、過去の後悔や未来の不安に囚われがちです。マインドフルネスの実践を通じて、今この瞬間に意識を戻すことで、心の安定を取り戻すことができます。</p>

        <h2>マインドフルネスの効果</h2>
        <p>科学的研究により、マインドフルネスの実践には以下のような効果が確認されています：</p>
        <ul style="list-style: disc; padding-left: var(--space-5); display: flex; flex-direction: column; gap: var(--space-2);">
          <li>ストレスの軽減</li>
          <li>不安感の改善</li>
          <li>集中力の向上</li>
          <li>感情の安定</li>
          <li>睡眠の質の改善</li>
          <li>慢性的な痛みの緩和</li>
        </ul>

        <h2>はじめの一歩</h2>
        <p>マインドフルネスを始めるために特別な準備は必要ありません。静かな場所で、まずは1分間、自分の呼吸に意識を向けてみましょう。</p>
        <p>呼吸が浅くなっていることに気づいたら、ゆっくりと深い呼吸に切り替えます。息を吸うとき、お腹が膨らむのを感じてください。息を吐くとき、体の緊張がほどけていくのを感じてください。</p>
        <p>心がさまよったことに気づいたら、それを責めずに、ただ優しく呼吸に意識を戻しましょう。これがマインドフルネスの基本です。</p>
      `
    },
    {
      id: 'breathing-techniques',
      title: '呼吸法ガイド',
      readTime: '7分',
      content: `
        <h2>呼吸法ガイド</h2>
        <p>呼吸は、自律神経に直接働きかけることができる数少ない方法の一つです。意識的に呼吸を整えることで、心と体を落ち着かせることができます。</p>

        <h2>4-7-8呼吸法</h2>
        <p>リラクゼーション効果の高い呼吸法です。不安を感じたときや、眠れない夜に試してみてください。</p>
        <ol style="list-style: decimal; padding-left: var(--space-5); display: flex; flex-direction: column; gap: var(--space-2);">
          <li>口から完全に息を吐き切ります</li>
          <li>鼻から<strong>4秒</strong>かけて息を吸います</li>
          <li><strong>7秒</strong>間、息を止めます</li>
          <li>口から<strong>8秒</strong>かけてゆっくり息を吐きます</li>
          <li>これを4回繰り返します</li>
        </ol>

        <div id="breathingWidget" class="breathing-widget">
          <div class="breathing-circle" id="breathingCircle">
            <span id="breathingText">開始</span>
          </div>
          <p class="breathing-instruction" id="breathingInstruction">タップして呼吸法を体験</p>
          <button class="btn btn--outline mt-4" id="breathingBtn">呼吸法を始める</button>
        </div>

        <h2>腹式呼吸</h2>
        <p>日常的に実践できる基本の呼吸法です。お腹に手を当てて、呼吸とともにお腹が膨らんだりへこんだりするのを感じましょう。</p>
        <ol style="list-style: decimal; padding-left: var(--space-5); display: flex; flex-direction: column; gap: var(--space-2);">
          <li>楽な姿勢で座り、片手をお腹に置きます</li>
          <li>鼻からゆっくり息を吸い、お腹が膨らむのを感じます</li>
          <li>口からゆっくり息を吐き、お腹がへこむのを感じます</li>
          <li>5〜10回繰り返します</li>
        </ol>
        <p>毎日5分間の腹式呼吸を続けることで、自律神経のバランスが整い、リラックスしやすい体質へと変化していきます。</p>
      `
    },
    {
      id: 'body-scan',
      title: 'ボディスキャン瞑想',
      readTime: '6分',
      content: `
        <h2>ボディスキャン瞑想</h2>
        <p>ボディスキャンは、体の各部位に順番に意識を向けていく瞑想法です。体の感覚に注意を払うことで、無意識の緊張に気づき、リラックスを深めることができます。</p>

        <h2>やり方</h2>
        <ol style="list-style: decimal; padding-left: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3);">
          <li>
            <strong>準備</strong><br>
            仰向けに寝るか、楽な姿勢で座ります。目を閉じて、数回深呼吸をしましょう。
          </li>
          <li>
            <strong>足先から始める</strong><br>
            左足のつま先に意識を向けます。温かさ、冷たさ、圧迫感、何か感じるものはありますか？判断せずに、ただ観察します。
          </li>
          <li>
            <strong>上へ移動する</strong><br>
            足首→ふくらはぎ→膝→太もも→腰→お腹→胸→背中→手→腕→肩→首→顔→頭頂部と、ゆっくり意識を上に移していきます。
          </li>
          <li>
            <strong>全体を感じる</strong><br>
            最後に、体全体を一つのまとまりとして感じます。体全体が呼吸とともにゆったりと上下するのを感じましょう。
          </li>
        </ol>

        <h2>ポイント</h2>
        <ul style="list-style: disc; padding-left: var(--space-5); display: flex; flex-direction: column; gap: var(--space-2);">
          <li>何も感じなくても大丈夫です。「何も感じない」ということに気づくことも、立派なマインドフルネスです。</li>
          <li>痛みや不快感があっても、それを「悪いもの」と判断せず、ただ「ある」ことを認めましょう。</li>
          <li>初めは10分程度から始め、慣れてきたら20〜30分に延ばしていきましょう。</li>
        </ul>
      `
    },
    {
      id: 'everyday-mindfulness',
      title: '日常のマインドフルネス',
      readTime: '5分',
      content: `
        <h2>日常のマインドフルネス</h2>
        <p>マインドフルネスは、瞑想の時間だけでなく、日常生活のあらゆる場面で実践できます。「ながら」で行うことで、特別な時間を設けなくても心を整えることができます。</p>

        <h2>食事のマインドフルネス</h2>
        <p>一口ごとに、食べ物の色、香り、食感、味わいに意識を向けてみましょう。テレビやスマートフォンを見ながらではなく、食事そのものに集中します。</p>
        <ul style="list-style: disc; padding-left: var(--space-5); display: flex; flex-direction: column; gap: var(--space-2);">
          <li>食べ物をよく観察する</li>
          <li>香りを楽しむ</li>
          <li>ゆっくり噛んで、味わいの変化に気づく</li>
          <li>飲み込む感覚を感じる</li>
        </ul>

        <h2>歩くマインドフルネス</h2>
        <p>通勤や散歩のとき、足の裏が地面に触れる感覚に意識を向けてみましょう。</p>
        <ul style="list-style: disc; padding-left: var(--space-5); display: flex; flex-direction: column; gap: var(--space-2);">
          <li>かかとが地面につく感覚</li>
          <li>足裏全体で体重を支える感覚</li>
          <li>つま先で地面を蹴る感覚</li>
          <li>風や太陽の光を肌に感じる</li>
        </ul>

        <h2>待ち時間のマインドフルネス</h2>
        <p>電車の待ち時間やレジの列など、イライラしがちな場面こそマインドフルネスのチャンスです。スマートフォンに手を伸ばす代わりに、3回だけ深呼吸をしてみましょう。</p>
      `
    },
    {
      id: 'self-compassion',
      title: 'セルフコンパッション',
      readTime: '6分',
      content: `
        <h2>セルフコンパッション</h2>
        <p>セルフコンパッション（自己への思いやり）とは、辛いときに自分自身に優しく接することです。私たちは他人に対しては自然に思いやりを持てるのに、自分に対しては厳しくなりがちです。</p>

        <h2>3つの要素</h2>
        <ol style="list-style: decimal; padding-left: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3);">
          <li>
            <strong>自分への優しさ</strong><br>
            失敗したとき、自分を責めるのではなく、親友に声をかけるように自分にも優しい言葉をかけましょう。「大丈夫、誰でも失敗することはある」
          </li>
          <li>
            <strong>共通の人間性</strong><br>
            苦しみは自分だけのものではありません。同じような悩みを抱えている人は、世界中にたくさんいます。「私だけではない」と思うことで、孤独感が和らぎます。
          </li>
          <li>
            <strong>マインドフルネス</strong><br>
            辛い感情を無視するのでもなく、過度に同一化するのでもなく、「今、自分は辛いと感じている」とありのままに認めます。
          </li>
        </ol>

        <h2>セルフコンパッションの実践</h2>
        <p>辛いことがあったとき、以下のフレーズを自分に語りかけてみましょう：</p>
        <div class="card" style="background: var(--color-primary-50); border-color: var(--color-primary-200); margin: var(--space-4) 0;">
          <p style="color: var(--color-neutral-700); line-height: var(--line-height-loose); font-style: italic;">
            「今、私は辛い思いをしている。」<br>
            「苦しみは、生きていれば誰にでもあること。」<br>
            「私が自分に優しくいられますように。」
          </p>
        </div>
        <p>最初は違和感があるかもしれません。しかし、繰り返し実践することで、自分への態度が少しずつ変わっていきます。自分を責める時間を、自分を労わる時間に変えていきましょう。</p>
      `
    },
    {
      id: 'stress-and-body',
      title: 'ストレスと体の関係',
      readTime: '5分',
      content: `
        <h2>ストレスと体の関係</h2>
        <p>ストレスは心だけでなく、体にも大きな影響を与えます。ストレスを感じると、私たちの体は「闘争か逃走か（fight or flight）」反応を起こします。</p>

        <h2>ストレス反応で起こること</h2>
        <ul style="list-style: disc; padding-left: var(--space-5); display: flex; flex-direction: column; gap: var(--space-2);">
          <li>心拍数の増加</li>
          <li>呼吸が浅く速くなる</li>
          <li>筋肉の緊張（特に肩・首・顎）</li>
          <li>消化機能の低下</li>
          <li>免疫機能の変化</li>
        </ul>
        <p>短期的なストレスは正常な反応ですが、慢性的なストレスは体の不調（頭痛、胃の不快感、不眠など）につながることがあります。</p>

        <h2>体からストレスに気づく</h2>
        <p>マインドフルネスの実践を通じて、体のサインに気づけるようになります。</p>
        <ul style="list-style: disc; padding-left: var(--space-5); display: flex; flex-direction: column; gap: var(--space-2);">
          <li>肩に力が入っていませんか？</li>
          <li>歯を食いしばっていませんか？</li>
          <li>呼吸が浅くなっていませんか？</li>
          <li>お腹に不快感はありませんか？</li>
        </ul>
        <p>気づいたら、その部分に意識を向けて、ゆっくり深呼吸をしましょう。息を吐くときに、緊張が体から流れ出ていくイメージを持つと効果的です。</p>

        <h2>マインドフルネスでストレスケア</h2>
        <p>毎日5分間のマインドフルネス瞑想を続けることで、ストレスへの耐性が高まり、回復力（レジリエンス）が向上することが研究で示されています。大切なのは、完璧を目指すことではなく、「続けること」です。</p>
      `
    }
  ];

  // --- 記事一覧描画 ---
  function renderArticleList() {
    const progress = SakuraStorage.get(STORAGE_KEY) || {};
    const container = $('#articleCards');

    container.innerHTML = articles.map((article, i) => {
      const isRead = progress[article.id]?.read;
      return `
        <a href="#" class="card card--action education-card ${isRead ? 'read' : ''}" data-article="${article.id}">
          <div class="education-card-number">
            ${isRead
              ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
              : (i + 1)}
          </div>
          <div style="flex: 1; min-width: 0;">
            <div class="card-title" style="font-size: var(--text-base);">${article.title}</div>
            <div class="education-card-meta">読了時間 ${article.readTime}</div>
          </div>
          <span class="card-arrow" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </span>
        </a>
      `;
    }).join('');

    // クリックイベント
    container.querySelectorAll('.education-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.preventDefault();
        showArticle(card.dataset.article);
      });
    });
  }

  // --- 記事表示 ---
  function showArticle(articleId) {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;

    const articleList = $('#articleList');
    const articleView = $('#articleView');
    const readingProgress = $('#readingProgress');

    articleList.hidden = true;
    articleView.hidden = false;
    readingProgress.hidden = false;

    articleView.innerHTML = article.content;

    // ナビゲーション更新
    $('#navTitle').textContent = article.title;
    $('#backLink').href = '#';
    $('#backText').textContent = '一覧へ';
    $('#backLink').onclick = (e) => {
      e.preventDefault();
      hideArticle();
    };

    // 呼吸法ウィジェットの初期化
    if (articleId === 'breathing-techniques') {
      initBreathingWidget();
    }

    // スクロールイベントで進捗更新
    window.scrollTo(0, 0);
    window.addEventListener('scroll', handleArticleScroll);

    // 読了記録
    const progress = SakuraStorage.get(STORAGE_KEY) || {};
    if (!progress[articleId]) {
      progress[articleId] = { read: false, lastPosition: 0, readAt: null };
    }
    SakuraStorage.set(STORAGE_KEY, progress);

    currentArticleId = articleId;
  }

  let currentArticleId = null;

  function hideArticle() {
    const articleList = $('#articleList');
    const articleView = $('#articleView');
    const readingProgress = $('#readingProgress');

    articleList.hidden = false;
    articleView.hidden = true;
    readingProgress.hidden = true;

    $('#navTitle').textContent = '心理教育';
    $('#backLink').href = 'index.html';
    $('#backText').textContent = '戻る';
    $('#backLink').onclick = null;

    window.removeEventListener('scroll', handleArticleScroll);

    // 読了判定
    if (currentArticleId) {
      const progress = SakuraStorage.get(STORAGE_KEY) || {};
      const scrollPercent = getScrollPercent();
      if (scrollPercent > 0.8) {
        progress[currentArticleId] = {
          read: true,
          lastPosition: 1.0,
          readAt: new Date().toISOString().split('T')[0]
        };
      } else if (progress[currentArticleId]) {
        progress[currentArticleId].lastPosition = scrollPercent;
      }
      SakuraStorage.set(STORAGE_KEY, progress);
    }

    currentArticleId = null;
    renderArticleList();
  }

  function handleArticleScroll() {
    const percent = getScrollPercent();
    $('#readingProgressBar').style.width = `${Math.min(percent * 100, 100)}%`;
  }

  function getScrollPercent() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? scrollTop / docHeight : 0;
  }

  // --- 呼吸法ウィジェット ---
  function initBreathingWidget() {
    const btn = document.getElementById('breathingBtn');
    const circle = document.getElementById('breathingCircle');
    const text = document.getElementById('breathingText');
    const instruction = document.getElementById('breathingInstruction');

    if (!btn) return;

    let breathingActive = false;
    let breathingTimer = null;

    btn.addEventListener('click', () => {
      if (breathingActive) {
        stopBreathing();
        return;
      }

      breathingActive = true;
      btn.textContent = '止める';

      const phases = [
        { name: '吸う', duration: 4000, className: 'inhale' },
        { name: '止める', duration: 7000, className: 'inhale' },
        { name: '吐く', duration: 8000, className: 'exhale' },
      ];

      let cycle = 0;
      let phaseIdx = 0;

      function nextPhase() {
        if (!breathingActive) return;

        const phase = phases[phaseIdx];
        text.textContent = phase.name;
        instruction.textContent = `${phase.name}... ${phase.duration / 1000}秒`;

        circle.classList.remove('inhale', 'exhale');
        circle.classList.add(phase.className);

        phaseIdx++;
        if (phaseIdx >= phases.length) {
          phaseIdx = 0;
          cycle++;
          if (cycle >= 4) {
            stopBreathing();
            text.textContent = '完了';
            instruction.textContent = 'お疲れさまでした。4サイクル完了です。';
            return;
          }
        }

        breathingTimer = setTimeout(nextPhase, phase.duration);
      }

      nextPhase();
    });

    function stopBreathing() {
      breathingActive = false;
      clearTimeout(breathingTimer);
      circle.classList.remove('inhale', 'exhale');
      text.textContent = '開始';
      instruction.textContent = 'タップして呼吸法を体験';
      btn.textContent = '呼吸法を始める';
    }
  }

  // --- 初期化 ---
  renderArticleList();
})();
