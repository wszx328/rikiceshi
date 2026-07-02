// results.js
const ResultsEngine = {
    currentResult: null,

    calculate(scores) {
        for (let result of RESULTS) {
            if (result.condition(scores)) return result;
        }
        return RESULTS[RESULTS.length - 1];
    },

    render(result) {
        this.currentResult = result;
        const screen = document.getElementById('screenResult');
        screen.innerHTML = this.getResultHTML(result);
        this.checkBackendIcon();
    },

    getResultHTML(result) {
        return `
            <div class="result-container">
                <div class="result-card">
                    <div class="result-emoji">🍽️</div>
                    <h1 class="result-food-name">${result.name}</h1>
                    <div class="result-divider"></div>
                    <div class="result-analysis"><p>${result.analysis}</p></div>
                    <div class="result-divider"></div>
                    <div class="result-riki-comment">
                        <span class="riki-label">RIKI：</span>
                        <span class="riki-text">${result.rikiComment}</span>
                    </div>
                </div>
                <div class="result-footer">
                    <button class="btn btn-primary btn-large" id="btnRestart">再做一次</button>
                </div>
                <div class="backend-icon" id="backendIcon" style="display:none;">⚙</div>
            </div>
        `;
    },

    checkBackendIcon() {
        if (PuzzleSystem.getUnlockedCount() >= 4) {
            const icon = document.getElementById('backendIcon');
            if (icon) {
                icon.style.display = 'block';
                icon.style.cssText = `
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    font-size: 32px;
                    color: var(--accent);
                    cursor: pointer;
                    z-index: 500;
                    transition: color 0.3s;
                `;
                icon.addEventListener('mouseenter', () => icon.style.color = '#4a1d7a');
                icon.addEventListener('mouseleave', () => icon.style.color = 'var(--accent)');
                icon.addEventListener('click', () => this.validatePassword());
            }
        }
    },

    validatePassword() {
        const overlay = document.createElement('div');
        overlay.id = 'pwdOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 2000;
            display: flex; justify-content: center; align-items: center;
        `;
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: #1e1e1e; border: 1px solid #555; border-radius: 12px;
            padding: 24px; text-align: center; color: #ccc;
        `;
        dialog.innerHTML = `
            <p style="margin-bottom:12px;">请输入后台密码</p>
            <input type="text" id="pwdInput" placeholder="输入密码" style="padding:8px; width:200px; background:#333; color:#fff; border:1px solid #555; border-radius:4px; outline:none;">
            <div style="margin-top:12px;">
                <button class="btn btn-primary btn-sm" id="btnPwdSubmit">确认</button>
                <button class="btn btn-outline btn-sm" id="btnPwdCancel">取消</button>
            </div>
            <p id="pwdError" style="color:red; margin-top:8px; display:none;">密码错误</p>
        `;
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        const submit = () => {
            const input = document.getElementById('pwdInput');
            if (input && input.value.trim() === 'R-1102') {
                overlay.remove();
                this.enterBackend();
            } else {
                const error = document.getElementById('pwdError');
                if (error) error.style.display = 'block';
                setTimeout(() => {
                    overlay.remove();
                    const gear = document.getElementById('backendIcon');
                    if (gear) gear.style.display = 'none';
                }, 1000);
            }
        };

        document.getElementById('btnPwdSubmit').addEventListener('click', submit);
        document.getElementById('pwdInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submit();
        });
        document.getElementById('btnPwdCancel').addEventListener('click', () => {
            overlay.remove();
            const gear = document.getElementById('backendIcon');
            if (gear) gear.style.display = 'none';
        });
    },

    enterBackend() {
        if (this.currentResult) {
            Backend.init(this.currentResult);
        }
    },

    bindRestart() {
        document.getElementById('btnRestart')?.addEventListener('click', () => {
            Game.state.scores = { 烈度:0, 质感:0, 气味:0, 回味:0, 保质期:0 };
            Game.state.answers = [];
            Game.state.locks = [];
            Game.state.currentQuestion = 0;
            Game.state.puzzle6Solved = false;
            Game.state.escCount = 0;
            PuzzleSystem.reset();
            Game.showScreen('screen-opening');
        });
    }
};