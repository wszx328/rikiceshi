// meta.js
const MetaEffects = {

    showRikiComment(question, letter, optionIndex) {
        const comment = question.metaData[letter];
        if (!comment) return;

        const el = document.createElement('div');
        el.className = 'meta-corner-comment';
        el.textContent = comment;
        document.body.appendChild(el);

        if (letter === 'D') {
            el.style.fontSize = '32px';
            el.style.fontWeight = '700';
            el.style.color = '#1a1a2e';

            setTimeout(() => {
                const subText = document.createElement('span');
                subText.textContent = '没什么。';
                subText.style.cssText = `
                    position: absolute;
                    right: 0;
                    bottom: -30px;
                    font-size: 13px;
                    color: #999;
                    opacity: 0;
                    transition: opacity 0.15s ease;
                    white-space: nowrap;
                `;
                el.appendChild(subText);
                requestAnimationFrame(() => {
                    subText.style.opacity = '0.6';
                });
                setTimeout(() => {
                    subText.style.opacity = '0';
                }, 300);
            }, 2500);

            setTimeout(() => {
                el.style.opacity = '0';
                el.style.transition = 'opacity 0.8s ease';
                setTimeout(() => el.remove(), 800);
            }, 3500);
        } else {
            setTimeout(() => {
                el.style.opacity = '0';
                el.style.transition = 'opacity 0.6s ease';
                setTimeout(() => el.remove(), 600);
            }, 3000);
        }

        setTimeout(() => {
            Game.nextQuestion();
        }, 4000);
    },

    showDreamDoor(question, letter, optionIndex) {
        const overlay = document.createElement('div');
        overlay.id = 'dreamRedOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #2a0a0a; z-index: 300; display: flex;
            justify-content: center; align-items: center;
            opacity: 0; transition: opacity 0.6s ease;
        `;

        const bigText = document.createElement('div');
        bigText.textContent = '我也做过这个梦。';
        bigText.style.cssText = `
            font-size: clamp(32px, 10vw, 80px); font-weight: 900;
            color: #ffffff; text-align: center; letter-spacing: 8px;
            padding: 20px;
            font-family: 'Georgia', 'STSong', 'Songti SC', serif;
            text-shadow: 0 0 20px rgba(255,255,255,0.3);
        `;
        overlay.appendChild(bigText);
        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
        });

        setTimeout(() => {
            overlay.style.opacity = '0';

            setTimeout(() => {
                const smallLine = document.createElement('div');
                smallLine.textContent = '在梦里我开了那扇门。门后面什么都没有。';
                smallLine.style.cssText = `
                    position: absolute;
                    bottom: 30%;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 16px;
                    color: rgba(255,255,255,0.5);
                    letter-spacing: 2px;
                    font-family: 'Georgia', 'STKaiti', 'KaiTi', serif;
                    opacity: 0;
                    transition: opacity 0.8s ease;
                `;
                overlay.appendChild(smallLine);
                requestAnimationFrame(() => {
                    smallLine.style.opacity = '1';
                });
                setTimeout(() => {
                    smallLine.style.opacity = '0';
                }, 1500);
            }, 900);

            setTimeout(() => {
                if (overlay.parentNode) overlay.remove();
            }, 2000);

            const comment = question.metaData[letter];
            if (comment) {
                const commentEl = document.createElement('div');
                commentEl.className = 'meta-corner-comment';
                commentEl.textContent = comment;
                document.body.appendChild(commentEl);

                if (letter === 'D') {
                    commentEl.style.fontSize = '32px';
                    setTimeout(() => {
                        const sub = document.createElement('span');
                        sub.textContent = '没什么。';
                        sub.style.cssText = 'position:absolute; right:0; bottom:-30px; font-size:13px; color:#999; opacity:0.6;';
                        commentEl.appendChild(sub);
                        setTimeout(() => sub.style.opacity = '0', 300);
                    }, 2500);
                    setTimeout(() => {
                        commentEl.style.opacity = '0';
                        commentEl.style.transition = 'opacity 0.8s';
                        setTimeout(() => commentEl.remove(), 800);
                    }, 3500);
                } else {
                    setTimeout(() => {
                        commentEl.style.opacity = '0';
                        commentEl.style.transition = 'opacity 0.6s';
                        setTimeout(() => commentEl.remove(), 600);
                    }, 3000);
                }
            }
        }, 2000);

        setTimeout(() => {
            Game.nextQuestion();
        }, 4200);
    },

    showHappinessQuestion(question, letter, optionIndex) {
        const optionsList = document.getElementById('optionsList');
        const buttons = optionsList.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            btn.style.transition = 'opacity 0.6s ease';
            btn.style.opacity = '0';
        });

        setTimeout(() => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(255,255,255,0.9);
                z-index: 300; display: flex;
                justify-content: center; align-items: center;
                opacity: 0; transition: opacity 0.5s ease;
            `;
            const bigChar = document.createElement('div');
            bigChar.textContent = '好。';
            bigChar.style.cssText = `
                font-size: clamp(80px, 25vw, 200px); font-weight: 900;
                color: #000000; text-align: center;
                font-family: 'Georgia', 'STSong', serif;
                letter-spacing: 10px;
            `;
            overlay.appendChild(bigChar);
            document.body.appendChild(overlay);
            requestAnimationFrame(() => { overlay.style.opacity = '1'; });

            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    if (overlay.parentNode) overlay.remove();
                    const warmOverlay = document.getElementById('warmBgOverlay');
                    if (warmOverlay) warmOverlay.classList.remove('active');
                    Game.nextQuestion();
                }, 500);
            }, 3000);
        }, 700);
    },

    showStrikethrough(question, letter, optionIndex) {
        if (letter !== 'D') {
            setTimeout(() => Game.nextQuestion(), 1500);
            return;
        }

        const questionText = document.getElementById('questionText');
        questionText.classList.add('strikethrough-text');

        const msgEl = document.createElement('div');
        msgEl.className = 'strikethrough-message';
        msgEl.textContent = question.metaData.D.message;
        questionText.parentNode.appendChild(msgEl);

        if (!PuzzleSystem.isUnlocked('puzzle5')) {
            Puzzles.puzzle5_erase(Game);
        } else {
            setTimeout(() => Game.nextQuestion(), 2000);
        }
    }
};