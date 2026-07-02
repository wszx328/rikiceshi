// game.js - 游戏主控
const Game = {
    currentScreen: null,
    state: {
        answers: [],
        scores: { 烈度:0, 质感:0, 气味:0, 回味:0, 保质期:0 },
        locks: [],
        currentQuestion: 0,
        phase: 'opening',
        puzzle4Triggered: false,
        puzzle6Solved: false,
        escCount: 0,
        escTimer: null
    },

    init() {
        this.bindOpeningEvents();
        this.showScreen('screen-opening');
        PuzzleSystem.init();
    },

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) {
            target.classList.add('active');
            this.currentScreen = screenId;
        }
    },

    hideScreen(screenId) {
        const target = document.getElementById(screenId);
        if (target) target.classList.remove('active');
    },

    cleanupAllMetaElements() {
        document.querySelectorAll('.meta-corner-comment').forEach(el => el.remove());
        document.querySelectorAll('.strikethrough-message').forEach(el => el.remove());
        const metaOverlay = document.getElementById('metaOverlay');
        if (metaOverlay) { metaOverlay.classList.remove('active'); metaOverlay.innerHTML = ''; }
        const warmOverlay = document.getElementById('warmBgOverlay');
        if (warmOverlay) warmOverlay.classList.remove('active');
        const dreamOverlay = document.getElementById('dreamRedOverlay');
        if (dreamOverlay) dreamOverlay.remove();
        const puzzleArea = document.getElementById('puzzle3Area');
        if (puzzleArea) puzzleArea.remove();
        const slotArea = document.querySelector('.puzzle-area');
        if (slotArea) slotArea.remove();
        const consoleEl = document.getElementById('miniConsole');
        if (consoleEl) consoleEl.remove();
        const escHint = document.getElementById('escHint');
        if (escHint) escHint.remove();
        const sidePuzzle = document.getElementById('sidePuzzle');
        if (sidePuzzle) sidePuzzle.remove();
        const hiddenNote = document.getElementById('puzzle5Note');
        if (hiddenNote) hiddenNote.remove();
        const barrageOverlay = document.getElementById('barrageOverlay');
        if (barrageOverlay) barrageOverlay.remove();
        const barrageStyle = document.getElementById('barrageStyle');
        if (barrageStyle) barrageStyle.remove();
        const puzzle6Char = document.getElementById('puzzle6Char');
        if (puzzle6Char) puzzle6Char.remove();
    },

    // ========== 开场事件（不变） ==========
    bindOpeningEvents() {
        const btnStart = document.getElementById('btnStart');
        const btnSure = document.getElementById('btnSure');
        const btnNotSure = document.getElementById('btnNotSure');
        const btnOkay = document.getElementById('btnOkay');
        const blackoutText1 = document.getElementById('blackoutText1');
        const blackoutText2 = document.getElementById('blackoutText2');
        const blackoutBtns = document.getElementById('blackoutBtns');
        const blackoutSubtext = document.getElementById('blackoutSubtext');
        const rikiExtra = document.getElementById('rikiExtra');

        btnStart.addEventListener('click', () => {
            this.phase = 'blackout';
            this.hideScreen('screen-opening');
            const blackout = document.getElementById('screenBlackout');
            blackout.classList.add('active');
            blackoutText1.style.opacity = '0'; blackoutText1.style.animation = 'none';
            blackoutText2.style.opacity = '0'; blackoutText2.style.animation = 'none';
            blackoutBtns.style.opacity = '0'; blackoutBtns.style.animation = 'none';
            blackoutSubtext.classList.remove('visible'); blackoutSubtext.textContent = '';
            void blackoutText1.offsetWidth;
            blackoutText1.style.animation = 'fadeInText 0.8s ease forwards';
            setTimeout(() => { blackoutText2.style.animation = 'fadeInText 0.8s ease forwards'; }, 2500);
            setTimeout(() => { blackoutBtns.style.animation = 'fadeInText 0.6s ease forwards'; }, 4500);
        });

        btnSure.addEventListener('click', () => { this.proceedToRikiIntro(); });

        btnNotSure.addEventListener('click', () => {
            blackoutText2.textContent = '那你为什么点进来了。';
            blackoutText2.style.animation = 'none';
            void blackoutText2.offsetWidth;
            blackoutText2.style.animation = 'fadeInText 0.5s ease forwards';
            blackoutBtns.style.opacity = '0';
            blackoutBtns.style.transition = 'opacity 0.3s ease';
            setTimeout(() => { this.proceedToRikiIntro(); }, 3000);
        });

        btnOkay.addEventListener('click', () => {
            rikiExtra.textContent = '谢谢配合。';
            rikiExtra.classList.add('visible');
            setTimeout(() => {
                const smallNote = document.createElement('p');
                smallNote.textContent = '虽然你不配合我也没什么办法。';
                smallNote.style.cssText = 'font-size:11px; color:#5a5a6a; margin-top:6px; opacity:0; transition:opacity 0.6s; font-style:italic;';
                rikiExtra.appendChild(smallNote);
                requestAnimationFrame(() => { smallNote.style.opacity = '1'; });
            }, 1500);
            setTimeout(() => {
                this.hideScreen('screenRikiIntro');
                this.phase = 'quiz';
                this.showQuestion(1);
            }, 2500);
        });
    },

    proceedToRikiIntro() {
        const blackout = document.getElementById('screenBlackout');
        blackout.classList.remove('active');
        const rikiScreen = document.getElementById('screenRikiIntro');
        rikiScreen.classList.add('active');
        this.phase = 'rikiIntro';
        const rikiLines = rikiScreen.querySelectorAll('.riki-line');
        rikiLines.forEach(line => { line.style.animation = 'none'; line.style.opacity = '0'; });
        const btnOkay = document.getElementById('btnOkay');
        btnOkay.style.animation = 'none'; btnOkay.style.opacity = '0';
        const rikiExtra = document.getElementById('rikiExtra');
        rikiExtra.classList.remove('visible'); rikiExtra.textContent = '';
        rikiExtra.querySelectorAll('p').forEach(p => p.remove());
        void rikiLines[0].offsetWidth;
        rikiLines.forEach((line, i) => {
            line.style.animation = `rikiFadeIn 0.6s ease forwards`;
            line.style.animationDelay = `${0.3 + i * 0.7}s`;
        });
        btnOkay.style.animation = `rikiFadeIn 0.5s ease forwards`;
        btnOkay.style.animationDelay = `${0.3 + rikiLines.length * 0.7}s`;
    },

    // ========== 答题流程 ==========
    showQuestion(n) {
        this.cleanupAllMetaElements();
        const question = QUESTIONS[n - 1];
        if (!question) { this.calculateResult(); return; }
        this.state.currentQuestion = n;
        this.showScreen('screenQuiz');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        progressFill.style.width = `${(n / GAME_CONFIG.totalQuestions) * 100}%`;
        progressText.textContent = `${n} / ${GAME_CONFIG.totalQuestions}`;
        const rikiNote = document.getElementById('rikiNote');
        const questionText = document.getElementById('questionText');
        const optionsList = document.getElementById('optionsList');
        optionsList.style.display = '';
        if (question.rikiNote) { rikiNote.textContent = question.rikiNote; rikiNote.style.display = 'block'; }
        else { rikiNote.textContent = ''; rikiNote.style.display = 'none'; }
        questionText.classList.remove('question-handwrite', 'strikethrough-text');
        optionsList.innerHTML = '';
        optionsList.classList.remove('locked');

        if (n === 4) {
            Puzzles.puzzle1_init(this);
        }

        if (n === 10) {
            questionText.textContent = question.text;
            optionsList.style.display = 'none';
            Puzzles.puzzle4_init(this);
            setTimeout(() => {
                questionText.textContent = '';
                questionText.classList.add('question-handwrite');
                const fullText = question.metaData.question;
                let index = 0;
                const typeInterval = setInterval(() => {
                    questionText.textContent += fullText[index];
                    index++;
                    if (index >= fullText.length) {
                        clearInterval(typeInterval);
                        optionsList.style.display = '';
                        this.renderOptions(question, optionsList);
                    }
                }, 120);
            }, 3000);
        } else if (n === 12) {
            questionText.textContent = question.text;
            this.renderOptions(question, optionsList);
            this.startQuestion12Sequence();
        } else {
            questionText.textContent = question.text;
            this.renderOptions(question, optionsList);
            if (n === 6) Puzzles.puzzle2_init(this);
            if (n === 7) Puzzles.puzzle3_init(this);
        }
    },

    renderOptions(question, optionsList) {
        const letters = ['A','B','C','D','E'];
        question.options.forEach((opt, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            if (question.id === 6 && index === 4 && !PuzzleSystem.isUnlocked('puzzle2')) {
                const gibberish = Array(12).fill(0).map(() =>
                    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`'[
                        Math.floor(Math.random() * 70)
                    ]).join('');
                btn.innerHTML = `
                    <span class="option-letter">${letters[index]}</span>
                    <span class="option-text-wrapper">
                        <span class="option-text draggable-text" style="position:relative; left:2px;">${opt.text}</span>
                        <span class="scratch-text">${gibberish}</span>
                    </span>
                `;
            } else {
                btn.innerHTML = `<span class="option-letter">${letters[index]}</span><span class="option-text">${opt.text}</span>`;
            }
            btn.addEventListener('click', () => { this.selectOption(question.id, index, letters[index]); });
            optionsList.appendChild(btn);
        });
    },

    selectOption(questionId, optionIndex, letter) {
        const question = QUESTIONS[questionId - 1];
        const optionsList = document.getElementById('optionsList');
        if (optionsList.classList.contains('locked')) return;
        optionsList.classList.add('locked');
        const buttons = optionsList.querySelectorAll('.option-btn');
        buttons.forEach((btn, i) => { if (i === optionIndex) btn.classList.add('selected'); });
        this.state.answers[questionId] = optionIndex;
        const chosen = question.options[optionIndex];
        if (!chosen.noScore && question.metaType !== 'happinessQuestion') {
            if (chosen.special === 'refuse') {
                DIMENSIONS.forEach(dim => { this.state.scores[dim] += 1; });
            } else {
                DIMENSIONS.forEach((dim, i) => { this.state.scores[dim] += chosen.scores[i]; });
            }
        }
        if (chosen.lock) this.state.locks.push(chosen.lock);
        if (question.metaType && question.id !== 12) this.triggerMeta(questionId, letter, optionIndex);
        if (questionId === 4) Puzzles.puzzle1_destroy(this);
        if (!question.metaType) {
            setTimeout(() => { this.nextQuestion(); }, 1500);
        }
    },

    nextQuestion() {
        const nextQ = this.state.currentQuestion + 1;
        if (nextQ > GAME_CONFIG.totalQuestions) {
            this.calculateResult();
        } else {
            this.showQuestion(nextQ);
        }
    },

    triggerMeta(questionId, letter, optionIndex) {
        const question = QUESTIONS[questionId - 1];
        switch (question.metaType) {
            case 'rikiComment': MetaEffects.showRikiComment(question, letter, optionIndex); break;
            case 'dreamDoor': MetaEffects.showDreamDoor(question, letter, optionIndex); break;
            case 'happinessQuestion': MetaEffects.showHappinessQuestion(question, letter, optionIndex); break;
            case 'strikethrough': MetaEffects.showStrikethrough(question, letter, optionIndex); break;
        }
    },

    startQuestion12Sequence() {
        const question = QUESTIONS[11];
        const questionText = document.getElementById('questionText');
        const optionsList = document.getElementById('optionsList');
        const originalText = question.text;
        const originalOptions = Array.from(optionsList.querySelectorAll('.option-text')).map(el => el.textContent);
        optionsList.classList.add('locked');

        setTimeout(() => {
            questionText.textContent = '你现在正在做这份██试，你觉得……';
            const optionTexts = optionsList.querySelectorAll('.option-text');
            const glitched = ['挺有趣的，有些题目让我想了很久。','有点无聊，但答完了。','有些题让我不太██服，但我还是答了。','我说不清楚，但我想把██做完。','我一直在想，这份测试的██的到底是什么。'];
            optionTexts.forEach((el, i) => el.textContent = glitched[i]);
        }, 1000);

        setTimeout(() => {
            questionText.textContent = originalText;
            const optionTexts = optionsList.querySelectorAll('.option-text');
            optionTexts.forEach((el, i) => el.textContent = originalOptions[i]);
        }, 2500);

        setTimeout(() => {
            questionText.style.display = 'none';
            optionsList.style.display = 'none';
            const rikiNote = document.getElementById('rikiNote');
            if (rikiNote) rikiNote.style.display = 'none';
            Puzzles.puzzle6_start(this, question);
        }, 3500);
    },

    clearToFinalQuestion(question) {
        const questionText = document.getElementById('questionText');
        const optionsList = document.getElementById('optionsList');
        questionText.textContent = '';
        optionsList.innerHTML = '';
        document.getElementById('rikiNote').style.display = 'none';
        setTimeout(() => {
            const finalQ = question.metaData.finalQuestion;
            questionText.textContent = finalQ;
            questionText.classList.add('question-handwrite');
            this.renderFinalQuestion12(question);
        }, 400);
    },

    renderFinalQuestion12(question) {
        const optionsList = document.getElementById('optionsList');
        optionsList.innerHTML = '';
        optionsList.classList.remove('locked');
        const finalOptions = question.metaData.finalOptions;
        const letters = ['A','B','C','D','E'];
        finalOptions.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span class="option-text">${opt.text}</span>`;
            btn.addEventListener('click', () => { this.finalAnswerSelected(i, opt); });
            optionsList.appendChild(btn);
        });
    },

    finalAnswerSelected(optionIndex, optionData) {
        const optionsList = document.getElementById('optionsList');
        if (optionsList.classList.contains('locked')) return;
        optionsList.classList.add('locked');
        const buttons = optionsList.querySelectorAll('.option-btn');
        buttons.forEach((btn, i) => { if (i === optionIndex) btn.classList.add('selected'); });
        this.state.answers[12] = optionIndex;
        DIMENSIONS.forEach((dim, i) => { this.state.scores[dim] += optionData.scores[i]; });
        this.showScreen('screenCalculating');
        setTimeout(() => { this.calculateResult(); }, 2500);
    },

    calculateResult() {
        const result = ResultsEngine.calculate(this.state.scores);
        this.showScreen('screenResult');
        ResultsEngine.render(result);
        ResultsEngine.bindRestart();
    },

    // ---------- 辅助方法（供 puzzles.js 调用） ----------
    goToQuestion(n) {
        this.cleanupAllMetaElements();
        const question = QUESTIONS[n - 1];
        if (!question) return;
        this.state.currentQuestion = n;
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        progressFill.style.width = `${(n / GAME_CONFIG.totalQuestions) * 100}%`;
        progressText.textContent = `${n} / ${GAME_CONFIG.totalQuestions}`;
        const rikiNote = document.getElementById('rikiNote');
        const questionText = document.getElementById('questionText');
        const optionsList = document.getElementById('optionsList');
        optionsList.style.display = '';
        rikiNote.textContent = question.rikiNote || '';
        rikiNote.style.display = question.rikiNote ? 'block' : 'none';
        questionText.classList.remove('question-handwrite', 'strikethrough-text');
        questionText.textContent = question.text;
        optionsList.innerHTML = '';
        optionsList.classList.add('locked');
        const letters = ['A','B','C','D','E'];
        question.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<span class="option-letter">${letters[idx]}</span><span class="option-text">${opt.text}</span>`;
            if (this.state.answers[n] === idx) btn.classList.add('selected');
            optionsList.appendChild(btn);
        });
    },

    injectHiddenOption() {
        const optionsList = document.getElementById('optionsList');
        if (!optionsList || document.getElementById('hiddenOptionF')) return;
        const btn = document.createElement('button');
        btn.className = 'option-btn hidden-option';
        btn.id = 'hiddenOptionF';
        btn.innerHTML = `<span class="option-letter">F</span><span class="option-text">我听见门后有声音。</span>`;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            PuzzleSystem.unlock('puzzle1');
            this.showBlackoutText('第2题原来加过F选项，后来删了。大福昨天也在门口听到了动静，不过后来发现只是哈纳又在半夜翻冰箱。');
            btn.remove();
            setTimeout(() => {
                Puzzles.puzzle1_destroy(this);
                this.showQuestion(4);
            }, 5000);
        });
        optionsList.appendChild(btn);
    },

    openMiniConsole() {
        if (document.getElementById('miniConsole')) return;
        const consoleDiv = document.createElement('div');
        consoleDiv.id = 'miniConsole';
        consoleDiv.className = 'mini-console';
        consoleDiv.innerHTML = `
            <div class="console-output" id="consoleOutput">> 输入 help 查看指令</div>
            <input class="console-input" id="consoleInput" placeholder="输入指令..." autocomplete="off">
        `;
        document.body.appendChild(consoleDiv);
        const input = document.getElementById('consoleInput');
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim().toLowerCase();
                const output = document.getElementById('consoleOutput');
                let response = '';
                if (cmd === 'help') {
                    response = '可用指令: diary, dog, exit';
                } else if (cmd === 'diary') {
                    response = '测试做了十天了，测出最多的是鱼香肉丝。很合理，大多数人都是这样。今天酒店很安静，适合摸鱼。';
                    PuzzleSystem.unlock('puzzle4');
                } else if (cmd === 'dog') {
                    response = '（三张模糊的小狗照片一闪而过）';
                } else if (cmd === 'exit') {
                    consoleDiv.remove();
                    return;
                } else {
                    response = '未知指令，输入 help 查看。';
                }
                output.innerHTML += `\n> ${cmd}\n${response}`;
                output.scrollTop = output.scrollHeight;
                input.value = '';
            }
        });
    },

    showBlackoutText(text, duration = 5000) {
        const blackout = document.getElementById('screenBlackout');
        const content = blackout.querySelector('.blackout-content');
        const originalChildren = Array.from(content.children);
        originalChildren.forEach(child => child.style.display = 'none');
        const tempText = document.createElement('p');
        tempText.style.cssText = 'color:white; font-size:18px; letter-spacing:2px; text-align:center;';
        tempText.textContent = text;
        content.appendChild(tempText);
        blackout.classList.add('active');
        setTimeout(() => {
            if (tempText.parentNode) tempText.remove();
            originalChildren.forEach(child => child.style.display = '');
            blackout.classList.remove('active');
        }, duration);
    }
};

// 谜题状态管理（仅内存）
const PuzzleSystem = {
    puzzles: { puzzle1: false, puzzle2: false, puzzle3: false, puzzle4: false, puzzle5: false, puzzle6: false },
    init() {},
    unlock(puzzleId) { if (!this.puzzles[puzzleId]) this.puzzles[puzzleId] = true; },
    isUnlocked(puzzleId) { return !!this.puzzles[puzzleId]; },
    getUnlockedCount() { return Object.values(this.puzzles).filter(v => v).length; },
    reset() { Object.keys(this.puzzles).forEach(k => this.puzzles[k] = false); }
};

document.addEventListener('DOMContentLoaded', () => Game.init());