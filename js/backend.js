// backend.js
const Backend = {
    currentFile: null,
    openedFiles: 0,
    chatTriggered: false,
    chatDismissed: false,
    inviteTimer: null,
    resultType: '',

    init(result) {
        this.resultType = result.name;
        this.currentFile = null;
        this.openedFiles = 0;
        this.chatTriggered = false;
        this.chatDismissed = false;
        this.renderSidebar();
        this.bindEvents();
        this.startInviteTimer();
        Game.showScreen('screenBackend');
    },

    startInviteTimer() {
        if (this.inviteTimer) clearTimeout(this.inviteTimer);
        this.inviteTimer = setTimeout(() => {
            if (!this.chatTriggered && !this.chatDismissed) {
                this.showInviteDialog();
            }
        }, 20000);
    },

    getEmotionCategory() {
        const highEmotion = ['梅干菜扣肉', '榴莲', '芥末', '麻辣火锅', '螺蛳粉', '东坡肉', '北京烤鸭', '豆汁儿', '臭豆腐'];
        const lowEmotion = ['白切鸡'];
        if (highEmotion.includes(this.resultType)) return 'high';
        if (lowEmotion.includes(this.resultType)) return 'low';
        return 'normal';
    },

    getFolders() {
        return [
            {
                id: 'devlog',
                name: '测试开发日志',
                locked: false,
                files: [
                    { id: '0412', name: '0412-立项.txt', content: '情饕这周睡得很沉，闲得发慌。做个测试玩玩，就测灵魂像什么食物吧，顺便练练看人眼光。' },
                    { id: '0415', name: '0415-题目草稿.txt', content: '第4题改了三版。写着写着总想起酒店里那些客人。算了，只是个游戏而已。' },
                    { id: '0420', name: '0420-结果整理.txt', content: '豆汁儿结果必须保留，懂的人自然懂。哈纳上次偷喝了一口吐了三分钟，他肯定测不出这个结果。' },
                    { id: '0425', name: '0425-后门备注.txt', content: '加了几个调试入口，万一有人能找到呢？总比天天对着空走廊强。1102的门打不开，后台总能进来吧。' },
                    { id: '0502', name: '0502-旧档杂感.txt', content: '整理09年住客记录，有个晴川来的女生很符合情饕的口味，不过那年的顶级食材意外的多，最后还是放她走了。' },
                    { id: '0510', name: '0510-包场通知.txt', content: '12月有个民俗学者包场，姓梁，付了三倍价钱。要求很多，说要搞什么交流会。随便吧，情饕应该会喜欢。' }
                ]
            },
            {
                id: 'villa',
                name: '别墅日常',
                locked: !PuzzleSystem.isUnlocked('puzzle1'),
                files: [
                    { id: 'dogs', name: '小狗合影.jpg', content: '拿破仑、大福、糯米，三个小家伙昨天又拆家了。用英语骂没用，日语骂大福才听得懂。' },
                    { id: 'douzhir', name: '豆汁儿库存记录.txt', content: '尹荔上次送我的豆汁儿冰箱还剩两瓶，得藏去最里面。哈纳上次偷喝吐了，别再让他霍霍。珀池最近熬夜多，给他留了一瓶？算了，他未必敢喝。' },
                    { id: 'meeting', name: '深夜会议录音.mp3', content: '昨晚用三国语言给它们讲故事，大福全程歪头，拿破仑睡着了在打鼾。录下来下次失眠听。' },
                    { id: 'roommate', name: '室友观察笔记.txt', content: '姜离律师昨天又在房间念咒语，声音很小但我听见了。云可好像在画他，挺配的。龙又找他哥借钱了，没好意思问。' }
                ]
            },
            {
                id: 'hotel',
                name: '酒店工作备忘',
                locked: !PuzzleSystem.isUnlocked('puzzle2') || !PuzzleSystem.isUnlocked('puzzle3'),
                files: [
                    { id: '2025food', name: '2025年食材摘要.doc', content: '143：背叛、救赎、前记者\n291：循环、程序员、白日梦\n4030：负罪、画家、海边\n302：贪婪、赌局、富商\n314：痴迷、芭蕾、镜子\n902：狂妄、摇滚、仪式' },
                    { id: 'staff', name: '员工名单.txt', content: '老赵还在干，五十多年了。阿萤越来越不对劲，她自己好像没察觉。洗衣房的老太太……别写了。' },
                    { id: '1102record', name: '1102房记录.txt', content: '门又自己锁上了。契约书没动过。继任者的事，再等等吧。不想随便拉人进来。' },
                    { id: 'rules', name: '入住须知草稿.doc', content: '改到第十七版了。有些规则是用来保护的，有些是……算了，能看懂的人自然能看懂。' }
                ]
            },
            {
                id: 'archive',
                name: '旧案归档',
                locked: !PuzzleSystem.isUnlocked('puzzle4') || !PuzzleSystem.isUnlocked('puzzle5'),
                files: [
                    { id: 'december', name: '12月交流会预案.txt', content: '梁星的申请批了。他要求封闭酒店七天。他好像知道情饕的事。无所谓，他提供的食材质量够高就行。后山小路我不会封，他自己想办法。' },
                    { id: 'twelve', name: '十二祭考据.pdf', content: '他发过来的资料，随便翻了翻。老一套的东西。月光之门，听着就假。' },
                    { id: 'qingchuan', name: '晴川旧闻剪报.png', content: '2014年，西横街，晴川来的客人，状态很不好。她的故事我记住了。' },
                    { id: 'karma', name: '因果随笔.txt', content: '恶是会传染的，就像食物的味道会串。酒店里也是这样，一个人的情绪能影响一整层。晴川那件事，大概也是这个道理。' }
                ]
            },
            {
                id: 'scrap',
                name: '废弃素材',
                locked: false,
                files: [
                    { id: 'q13', name: '废弃第13题.txt', content: '如果有一个地方，去了就再也回不来，但能得到你想要的答案，你去吗？// 备注：太直白了，删掉。' },
                    { id: 'congee', name: '隐藏结果-白粥.txt', content: '最普通也最难得的类型。适合别墅，不适合酒店。// 备注：没位置放了，删掉。' },
                    { id: 'sentence', name: '未完成短句.txt', content: '走廊很长，门很多。我站在中间，不知道往哪走。// 备注：写不下去了。' },
                    { id: 'hr', name: '招聘文案终稿.txt', content: '诚聘服务体验分析师，待遇优厚，工作环境安静。// 备注：好烦，我怎么还要干HR的活。' }
                ]
            }
        ];
    },

    renderSidebar() {
        const sidebar = document.getElementById('backendSidebar');
        if (!sidebar) return;
        const folders = this.getFolders();
        sidebar.innerHTML = '';
        folders.forEach(folder => {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'backend-folder';
            if (folder.locked) {
                folderDiv.innerHTML = `
                    <div class="folder-name locked">🔒 ${folder.name}（加密）</div>
                `;
            } else {
                folderDiv.innerHTML = `
                    <div class="folder-name">📁 ${folder.name}</div>
                    <div class="folder-files" style="display:block;">
                        ${folder.files.map(file => 
                            `<div class="file-item" data-fileid="${file.id}" data-folderid="${folder.id}">📄 ${file.name}</div>`
                        ).join('')}
                    </div>
                `;
            }
            sidebar.appendChild(folderDiv);
        });

        sidebar.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const fileId = e.currentTarget.dataset.fileid;
                const folderId = e.currentTarget.dataset.folderid;
                this.openFile(folderId, fileId);
            });
        });
    },

    openFile(folderId, fileId) {
        const folders = this.getFolders();
        const folder = folders.find(f => f.id === folderId);
        if (!folder || folder.locked) return;

        const file = folder.files.find(f => f.id === fileId);
        if (!file) return;

        this.currentFile = file;
        this.openedFiles++;

        const preview = document.getElementById('backendPreview');
        if (preview) {
            preview.innerHTML = `
                <div class="preview-header">${file.name}</div>
                <div class="preview-content">${file.content.replace(/\n/g, '<br>')}</div>
            `;
        }

        document.querySelectorAll('.file-item').forEach(el => el.classList.remove('active'));
        const activeItem = document.querySelector(`[data-fileid="${fileId}"]`);
        if (activeItem) activeItem.classList.add('active');

        if (this.openedFiles >= 3 && !this.chatTriggered && !this.chatDismissed) {
            if (this.inviteTimer) clearTimeout(this.inviteTimer);
            this.showInviteDialog();
        }
    },

    showInviteDialog() {
        if (document.getElementById('inviteOverlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'inviteOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 2000;
            display: flex; justify-content: center; align-items: center;
        `;
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: linear-gradient(160deg, #2a1a3e, #1e1230);
            border: 1px solid rgba(108, 59, 158, 0.5);
            border-radius: 16px; padding: 32px 28px;
            max-width: 400px; width: 90%; text-align: center;
            color: #d5cde0; box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        `;
        dialog.innerHTML = `
            <p style="font-size:16px; margin-bottom:20px; line-height:1.6;">RIKI 发来对话邀请</p>
            <div style="display:flex; gap:16px; justify-content:center;">
                <button class="btn btn-primary" id="btnInviteAccept">同意</button>
                <button class="btn btn-outline" id="btnInviteReject" style="color:#ccc; border-color:#555;">拒绝</button>
            </div>
        `;
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        document.getElementById('btnInviteAccept').addEventListener('click', () => {
            overlay.remove();
            this.triggerChat();
        });
        document.getElementById('btnInviteReject').addEventListener('click', () => {
            overlay.remove();
            this.chatDismissed = true;
            if (this.inviteTimer) clearTimeout(this.inviteTimer);
        });
    },

    triggerChat() {
        this.chatTriggered = true;
        const chatDiv = document.getElementById('backendChat');
        if (!chatDiv) return;
        chatDiv.style.display = 'flex';

        const header = chatDiv.querySelector('.chat-header');
        if (header && !header.querySelector('.chat-close-btn')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'chat-close-btn';
            closeBtn.textContent = '✕';
            closeBtn.style.cssText = 'position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; color:#c9a0dc; font-size:16px; cursor:pointer;';
            closeBtn.addEventListener('click', () => {
                chatDiv.style.display = 'none';
                this.chatDismissed = true;
            });
            header.style.position = 'relative';
            header.appendChild(closeBtn);
        }

        const messages = ['哦。', '你居然真的摸进来了。', '这些草稿……你都看了？', '算了，看都看了，我也懒得删。', '观察力不错。比我预想的好。'];
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        chatMessages.innerHTML = '';

        let index = 0;
        const showMessage = () => {
            if (index < messages.length) {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'chat-bubble';
                msgDiv.textContent = messages[index];
                chatMessages.appendChild(msgDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                index++;
                setTimeout(showMessage, 1500);
            } else {
                setTimeout(() => {
                    this.showBranchOptions();
                }, 1000);
            }
        };
        showMessage();
    },

    addChatBubble(text) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return null;
        const msgDiv = document.createElement('div');
        msgDiv.className = 'chat-bubble';
        msgDiv.textContent = text;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return msgDiv;
    },

    showBranchOptions() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        const category = this.getEmotionCategory();

        if (category === 'high') {
            this.addChatBubble('对了，你测出的结果，风味很特别。');
            setTimeout(() => {
                this.addChatBubble('我刚好有家酒店，最近有空房。环境很安静，适合想事情。');
                setTimeout(() => {
                    this.addChatBubble('要是感兴趣，可以来住几天。我在大堂等你。');
                    setTimeout(() => {
                        const btnDiv = document.createElement('div');
                        btnDiv.className = 'chat-options';
                        btnDiv.innerHTML = `
                            <button class="btn btn-primary btn-sm" id="btnAccept">接受邀请</button>
                            <button class="btn btn-outline btn-sm" id="btnReject">拒绝邀请</button>
                        `;
                        chatMessages.appendChild(btnDiv);
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                        document.getElementById('btnAccept')?.addEventListener('click', () => this.acceptInvite());
                        document.getElementById('btnReject')?.addEventListener('click', () => this.rejectInvite());
                    }, 1000);
                }, 1000);
            }, 1000);
        } else if (category === 'low') {
            this.addChatBubble('不过你性子太淡了，不太适合我那边的环境。');
            setTimeout(() => {
                this.addChatBubble('但挺难得的。保持这样就好。');
                setTimeout(() => {
                    this.addChatBubble('就当是个小彩蛋吧，别往外说。');
                    setTimeout(() => {
                        this.exitBackend('normal');
                    }, 3000);
                }, 1000);
            }, 1000);
        } else {
            this.addChatBubble('不过你性子太稳了，不太适合我那边的环境。');
            setTimeout(() => {
                this.addChatBubble('就当是个小彩蛋吧，别往外说。');
                setTimeout(() => {
                    this.exitBackend('normal');
                }, 3000);
            }, 1000);
        }
    },

    acceptInvite() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        const optionsDiv = chatMessages.querySelector('.chat-options');
        if (optionsDiv) optionsDiv.remove();
        this.addChatBubble('地址很好找。');
        setTimeout(() => {
            this.addChatBubble('进门的时候，别信门口贴的所有规则。');
            setTimeout(() => {
                this.addChatBubble('——大堂见。');
                setTimeout(() => {
                    this.exitBackend('accept');
                }, 2000);
            }, 1500);
        }, 1000);
    },

    rejectInvite() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        const optionsDiv = chatMessages.querySelector('.chat-options');
        if (optionsDiv) optionsDiv.remove();
        this.addChatBubble('挺明智的。祝你过得开心。');
        setTimeout(() => {
            this.exitBackend('reject');
        }, 3000);
    },

    closeGame() {
        window.open('', '_self').close();
        setTimeout(() => {
            window.location.href = 'about:blank';
        }, 500);
    },

    // 接受邀请后的全黑页面 + 弹窗 + 跳转
    showAcceptEnding() {
        // 隐藏其他屏幕
        Game.hideScreen('screenBackend');
        // 创建全黑覆盖层
        const overlay = document.createElement('div');
        overlay.id = 'acceptEnding';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: #000; z-index: 3000; display: flex;
            flex-direction: column; align-items: center; justify-content: center;
        `;
        const text = document.createElement('p');
        text.textContent = '故事未完待续 · 后续可前往《ROOM酒店规则怪谈》查看';
        text.style.cssText = 'color: #ccc; font-size: 18px; letter-spacing: 2px; margin-bottom: 24px; text-align: center;';
        const btn = document.createElement('button');
        btn.textContent = '前往';
        btn.className = 'btn btn-primary btn-large';
        btn.addEventListener('click', () => {
            // 弹出提示弹窗
            const modalOverlay = document.createElement('div');
            modalOverlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.8); z-index: 3100;
                display: flex; align-items: center; justify-content: center;
            `;
            const modal = document.createElement('div');
            modal.style.cssText = `
                background: #1e1e1e; border: 1px solid #555; border-radius: 12px;
                padding: 24px; text-align: center; color: #ccc; max-width: 320px;
            `;
            modal.innerHTML = `
                <p style="margin-bottom:16px;">现在前往的游戏还没有做完哦，目前只做了一点点内容，不知道什么时候才能全部做完</p>
            `;
            modalOverlay.appendChild(modal);
            document.body.appendChild(modalOverlay);
            // 5秒后弹窗消失并跳转
            setTimeout(() => {
                modalOverlay.remove();
                window.location.href = 'ROOM.html';
            }, 5000);
        });
        overlay.appendChild(text);
        overlay.appendChild(btn);
        document.body.appendChild(overlay);
    },

    exitBackend(outcome) {
        if (this.inviteTimer) clearTimeout(this.inviteTimer);
        Game.hideScreen('screenBackend');

        if (outcome === 'accept') {
            // 进入全黑结束页面，不再返回结果页
            this.showAcceptEnding();
            return;
        }

        // 其他结局返回结果页
        Game.showScreen('screenResult');

        const footer = document.querySelector('.result-footer');
        if (footer) {
            const existingNote = footer.querySelector('.backend-note');
            if (existingNote) existingNote.remove();

            if (outcome === 'reject') {
                const note = document.createElement('p');
                note.className = 'backend-note';
                note.textContent = '后台的事，忘了吧。——R';
                note.style.cssText = 'font-size:12px; color:var(--text-muted); margin-top:12px; font-style:italic;';
                footer.appendChild(note);
                this.closeGame();
            } else if (outcome === 'normal') {
                this.closeGame();
            }
        }
    },

    bindEvents() {
        document.getElementById('btnBackendClose')?.addEventListener('click', () => {
            if (this.inviteTimer) clearTimeout(this.inviteTimer);
            Game.hideScreen('screenBackend');
            Game.showScreen('screenResult');
        });
    }
};