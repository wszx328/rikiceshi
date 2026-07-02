// puzzles.js - 六个谜题的具体实现
const Puzzles = {

    // ---------- 谜题1：可回溯进度条 ----------
    puzzle1_init(game) {
        const progressBar = document.querySelector('.progress-bar');
        if (!progressBar) return;
        const origBg = progressBar.style.background;
        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
            progressBar.style.background = blinkCount % 2 === 0 ? '#c77d5a' : origBg;
            blinkCount++;
            if (blinkCount >= 6) {
                clearInterval(blinkInterval);
                progressBar.style.background = origBg;
            }
        }, 200);

        if (PuzzleSystem.isUnlocked('puzzle1')) return;

        let isDragging = false, startX = 0, currentQ = game.state.currentQuestion;
        const maxQ = currentQ;
        const onMouseDown = (e) => {
            if (game.state.answers[4] !== undefined) return;
            isDragging = true;
            startX = e.clientX || e.touches[0].clientX;
            progressBar.style.cursor = 'grabbing';
            e.preventDefault();
        };
        const onMouseMove = (e) => {
            if (!isDragging) return;
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const deltaX = startX - clientX;
            const threshold = 40;
            if (deltaX > threshold && currentQ > 1) {
                currentQ--;
                game.goToQuestion(currentQ);
                startX = clientX;
                if (currentQ === 2 && !PuzzleSystem.isUnlocked('puzzle1')) {
                    game.injectHiddenOption();
                }
            } else if (deltaX < -threshold && currentQ < maxQ) {
                currentQ++;
                game.goToQuestion(currentQ);
                startX = clientX;
            }
        };
        const onMouseUp = () => { isDragging = false; progressBar.style.cursor = ''; };
        progressBar.addEventListener('mousedown', onMouseDown);
        progressBar.addEventListener('mousemove', onMouseMove);
        progressBar.addEventListener('mouseup', onMouseUp);
        progressBar.addEventListener('mouseleave', onMouseUp);
        progressBar.addEventListener('touchstart', onMouseDown, { passive: false });
        progressBar.addEventListener('touchmove', onMouseMove, { passive: false });
        progressBar.addEventListener('touchend', onMouseUp);
    },

    puzzle1_destroy(game) {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const newBar = progressBar.cloneNode(true);
            progressBar.parentNode.replaceChild(newBar, progressBar);
        }
    },

    // ---------- 谜题2：可挪开的选项文字 ----------
    puzzle2_init(game) {
        if (PuzzleSystem.isUnlocked('puzzle2')) return;
        const targetText = document.querySelector('.draggable-text');
        if (!targetText) return;
        let startX = 0, startLeft = 0, dragging = false, moved = false;
        const onStart = (e) => {
            e.stopPropagation();
            startX = e.clientX || e.touches[0].clientX;
            startLeft = parseInt(targetText.style.left) || 0;
            dragging = true; moved = false;
            targetText.style.cursor = 'grabbing';
            targetText.style.transition = 'none';
        };
        const onMove = (e) => {
            if (!dragging) return;
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const deltaX = clientX - startX;
            if (Math.abs(deltaX) > 3) moved = true;
            if (moved) {
                let newLeft = startLeft + deltaX;
                targetText.style.left = newLeft + 'px';
                if (newLeft > 80) {
                    dragging = false;
                    targetText.style.cursor = 'default';
                    PuzzleSystem.unlock('puzzle2');
                    game.showBlackoutText('白色最像酒店走廊的灯。11楼的灯永远是坏的，1102号房的门也永远是锁着的。不是我锁的。');
                    targetText.style.left = '0px';
                    targetText.classList.remove('draggable-text');
                    targetText.style.cursor = '';
                    const scratch = targetText.parentNode.querySelector('.scratch-text');
                    if (scratch) scratch.remove();
                }
            }
        };
        const onEnd = () => {
            if (!dragging) return;
            dragging = false;
            targetText.style.cursor = 'grab';
            if (!moved) {
                const btn = targetText.closest('.option-btn');
                if (btn) btn.click();
            } else if (!PuzzleSystem.isUnlocked('puzzle2')) {
                targetText.style.left = startLeft + 'px';
            }
        };
        targetText.addEventListener('mousedown', onStart);
        targetText.addEventListener('touchstart', onStart, { passive: false });
        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchend', onEnd);
    },

    // ---------- 谜题3：可重组句子 ----------
    puzzle3_init(game) {
        if (PuzzleSystem.isUnlocked('puzzle3')) return;
        if (document.getElementById('sidePuzzle')) return;

        const questionText = document.getElementById('questionText');
        const originalText = questionText.textContent;
        const targetChars = '门缝里透着另一个梦'.split('');
        const allChars = originalText.split('').filter(ch => /[\u4e00-\u9fff]/.test(ch));
        const charSet = [...new Set([...targetChars, ...allChars])];
        const initialChars = charSet.sort(() => Math.random() - 0.5);

        const container = document.createElement('div');
        container.id = 'sidePuzzle';
        container.style.cssText = 'position:fixed; right:10px; top:50%; transform:translateY(-50%); z-index:200; max-width:190px; background:transparent;';

        const charArea = document.createElement('div');
        charArea.className = 'puzzle-char-pool';
        charArea.style.cssText = 'display:flex; flex-wrap:wrap; gap:5px; justify-content:center; margin-bottom:10px;';

        const renderChars = (chars) => {
            charArea.innerHTML = '';
            chars.forEach(ch => {
                const span = document.createElement('span');
                span.className = 'draggable-char';
                span.textContent = ch;
                span.draggable = true;
                span.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', ch);
                    span.style.opacity = '0.4';
                });
                span.addEventListener('dragend', () => span.style.opacity = '1');
                span.addEventListener('touchstart', (e) => { e.preventDefault(); span._touchStart = true; });
                span.addEventListener('touchmove', (e) => { e.preventDefault(); span._touchStart = false; });
                span.addEventListener('touchend', (e) => {
                    if (span._touchStart) {
                        const emptySlots = container.querySelectorAll('.puzzle-slot:not(.filled)');
                        if (emptySlots.length > 0) {
                            emptySlots[0].textContent = ch;
                            emptySlots[0].classList.add('filled');
                            span.remove();
                            checkAnswer();
                        }
                    }
                });
                charArea.appendChild(span);
            });
        };
        renderChars(initialChars);
        container.appendChild(charArea);

        const slotArea = document.createElement('div');
        slotArea.className = 'puzzle-area-horizontal';
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'puzzle-slot';
            slot.textContent = '';
            slot.addEventListener('dragover', (e) => e.preventDefault());
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                const data = e.dataTransfer.getData('text/plain');
                if (data && !slot.classList.contains('filled')) {
                    slot.textContent = data;
                    slot.classList.add('filled');
                    const charElems = container.querySelectorAll('.draggable-char');
                    for (let el of charElems) {
                        if (el.textContent === data) { el.remove(); break; }
                    }
                    checkAnswer();
                }
            });
            slotArea.appendChild(slot);
        }
        container.appendChild(slotArea);

        const resetBtn = document.createElement('button');
        resetBtn.textContent = '重置';
        resetBtn.style.cssText = 'margin-top:8px; padding:4px 12px; font-size:13px; background:var(--accent-soft); color:var(--accent-dark); border:1px solid var(--accent); border-radius:6px; cursor:pointer;';
        resetBtn.addEventListener('click', () => {
            const slots = container.querySelectorAll('.puzzle-slot');
            slots.forEach(s => { s.textContent = ''; s.classList.remove('filled'); });
            renderChars(initialChars);
        });
        container.appendChild(resetBtn);

        document.body.appendChild(container);

        function checkAnswer() {
            const slots = container.querySelectorAll('.puzzle-slot');
            const answer = Array.from(slots).map(s => s.textContent).join('');
            if (answer === '门缝里透着另一个梦') {
                PuzzleSystem.unlock('puzzle3');
                game.showBlackoutText('门缝里透出来的从来不是光，是另一个梦。143 号房的客人到最后都以为，门后站着的是能救他的人。');
                container.remove();
            }
        }
    },

    // ---------- 谜题4：隐藏命令控制台 ----------
    puzzle4_init(game) {
        if (PuzzleSystem.isUnlocked('puzzle4')) return;
        game.state.escCount = 0;
        const hint = document.createElement('div');
        hint.id = 'escHint';
        hint.textContent = 'Esc3';
        hint.style.cssText = 'position:fixed; top:20px; left:20px; font-size:24px; color:rgba(172,130,220,0.7); z-index:400; font-family:monospace;';
        document.body.appendChild(hint);

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                game.state.escCount++;
                if (game.state.escTimer) clearTimeout(game.state.escTimer);
                game.state.escTimer = setTimeout(() => { game.state.escCount = 0; }, 1000);
                if (game.state.escCount >= 3) {
                    game.state.escCount = 0;
                    if (game.state.escTimer) clearTimeout(game.state.escTimer);
                    game.openMiniConsole();
                }
            }
        };
        document.addEventListener('keydown', onKeyDown);
        game._escHandler = onKeyDown;
    },

    // ---------- 谜题5：可擦除的划线 ----------
    puzzle5_erase(game) {
        const questionText = document.getElementById('questionText');
        if (!questionText || !questionText.classList.contains('strikethrough-text')) return;

        let eraseCount = 0;
        const requiredErase = 3;
        let lastX = 0;
        let erased = false;

        const onMouseMove = (e) => {
            if (erased) return;
            const rect = questionText.getBoundingClientRect();
            const x = e.clientX;
            if (x >= rect.left && x <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                const dx = x - lastX;
                if (Math.abs(dx) > 10) {
                    eraseCount++;
                    lastX = x;
                    const opacity = 1 - (eraseCount / requiredErase);
                    questionText.style.textDecorationColor = `rgba(192,57,43,${Math.max(0, opacity)})`;
                    if (eraseCount >= requiredErase && !erased) {
                        erased = true;
                        questionText.classList.remove('strikethrough-text');
                        questionText.style.textDecoration = 'none';
                        questionText.textContent = '你愿意为一件事付出一辈子的代价吗？';
                        const note = document.createElement('div');
                        note.id = 'puzzle5Note';
                        note.style.cssText = 'font-size:14px; color:var(--accent); margin-top:8px; font-style:italic;';
                        note.textContent = '备注：下个月有个姓梁的客人包场，他好像愿意。不知道值不值。';
                        questionText.parentNode.appendChild(note);
                        PuzzleSystem.unlock('puzzle5');
                        setTimeout(() => {
                            game.nextQuestion();
                        }, 5000);
                    }
                }
            }
        };
        document.addEventListener('mousemove', onMouseMove);
        game._eraseListener = onMouseMove;
    },

    // ---------- 谜题6：全屏乱码弹幕 + 紫色目标（含5秒超时） ----------
    puzzle6_start(game, question) {
        if (document.getElementById('barrageOverlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'barrageOverlay';
        overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:#0d0d0d; z-index:500;';
        document.body.appendChild(overlay);

        const container = document.createElement('div');
        container.id = 'barrageContainer';
        container.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; overflow:hidden;';
        overlay.appendChild(container);

        if (!document.getElementById('barrageStyle')) {
            const style = document.createElement('style');
            style.id = 'barrageStyle';
            style.textContent = `
                @keyframes floatBarrage {
                    0% { transform: translateX(100vw) translateY(0) rotate(0deg); opacity: 0.7; }
                    100% { transform: translateX(-100vw) translateY(20px) rotate(15deg); opacity: 0; }
                }
                @keyframes shakeBarrage {
                    0%,100%{ transform: translate(0,0); }
                    25%{ transform: translate(-3px,2px); }
                    50%{ transform: translate(2px,-1px); }
                    75%{ transform: translate(-1px,3px); }
                }
                .barrage-char {
                    position: absolute;
                    font-family: monospace;
                    white-space: nowrap;
                    pointer-events: none;
                    animation: floatBarrage 4s linear infinite;
                }
                .barrage-target {
                    position: absolute;
                    color: #a855f7;
                    font-weight: bold;
                    font-size: 28px;
                    cursor: pointer;
                    pointer-events: auto;
                    z-index: 600;
                    text-shadow: 0 0 10px #a855f7;
                    animation: shakeBarrage 0.2s infinite;
                }
            `;
            document.head.appendChild(style);
        }

        const colors = ['#ff6b6b','#feca57','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#f368e0'];
        const fonts = ['monospace', 'cursive', 'fantasy', 'sans-serif', 'serif'];
        for (let i = 0; i < 40; i++) {
            const span = document.createElement('span');
            span.className = 'barrage-char';
            const length = 8 + Math.floor(Math.random() * 20);
            let text = '';
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`▇▇';
            for (let j = 0; j < length; j++) text += chars[Math.floor(Math.random() * chars.length)];
            span.textContent = text;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const fontFamily = fonts[Math.floor(Math.random() * fonts.length)];
            span.style.cssText = `
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                color: ${color};
                font-family: ${fontFamily};
                font-size: ${14 + Math.random() * 24}px;
                animation: floatBarrage ${3 + Math.random() * 5}s linear infinite, shakeBarrage 0.2s infinite;
            `;
            container.appendChild(span);
        }

        const target = document.createElement('div');
        target.className = 'barrage-target';
        target.textContent = 'R-11-02';
        const left = 20 + Math.random() * 60;
        const top = 20 + Math.random() * 60;
        target.style.left = left + '%';
        target.style.top = top + '%';
        container.appendChild(target);

        let timedOut = false;
        const timeoutId = setTimeout(() => {
            timedOut = true;
            overlay.remove();
            const styleEl = document.getElementById('barrageStyle');
            if (styleEl) styleEl.remove();
            const qText = document.getElementById('questionText');
            const oList = document.getElementById('optionsList');
            const rNote = document.getElementById('rikiNote');
            if (qText) qText.style.display = '';
            if (oList) oList.style.display = '';
            if (rNote) rNote.style.display = '';
            game.state.puzzle6Solved = false;
            game.clearToFinalQuestion(question);
        }, 5000);

        target.addEventListener('click', () => {
            if (timedOut) return;
            clearTimeout(timeoutId);
            if (game.state.puzzle6Solved) return;
            game.state.puzzle6Solved = true;
            PuzzleSystem.unlock('puzzle6');
            overlay.remove();
            const styleEl = document.getElementById('barrageStyle');
            if (styleEl) styleEl.remove();
            const qText = document.getElementById('questionText');
            const oList = document.getElementById('optionsList');
            const rNote = document.getElementById('rikiNote');
            if (qText) qText.style.display = '';
            if (oList) oList.style.display = '';
            if (rNote) rNote.style.display = '';
            game.showBlackoutText('后台入口：R-1102。别让别人看见。');
            setTimeout(() => {
                game.clearToFinalQuestion(question);
            }, 2000);
        });
    }
};