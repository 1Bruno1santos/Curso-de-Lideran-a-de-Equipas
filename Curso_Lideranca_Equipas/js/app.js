/**
 * Curso de Liderança de Equipas - Aplicação Principal
 * Sistema de navegação, progresso e funcionalidades interativas
 */

class CursoLideranca {
    constructor() {
        this.currentModule = 0;
        this.currentLesson = 0;
        this.progress = this.loadProgress();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgressDisplay();
        this.initAnimations();
        console.log('🚀 Curso de Liderança iniciado!');
    }

    // ========================================
    // GESTÃO DE PROGRESSO
    // ========================================

    loadProgress() {
        const saved = localStorage.getItem('curso-lideranca-progress');
        return saved ? JSON.parse(saved) : {
            modulesCompleted: [],
            lessonsCompleted: [],
            quizzesCompleted: [],
            exercisesCompleted: [],
            totalProgress: 0,
            timeSpent: 0,
            achievements: [],
            lastAccess: new Date().toISOString()
        };
    }

    saveProgress() {
        this.progress.lastAccess = new Date().toISOString();
        localStorage.setItem('curso-lideranca-progress', JSON.stringify(this.progress));
    }

    markLessonComplete(moduleId, lessonId) {
        const lessonKey = `${moduleId}-${lessonId}`;
        if (!this.progress.lessonsCompleted.includes(lessonKey)) {
            this.progress.lessonsCompleted.push(lessonKey);
            this.calculateTotalProgress();
            this.saveProgress();
            this.showAchievement(`Lição ${lessonId} completada!`);
        }
    }

    markModuleComplete(moduleId) {
        if (!this.progress.modulesCompleted.includes(moduleId)) {
            this.progress.modulesCompleted.push(moduleId);
            this.calculateTotalProgress();
            this.saveProgress();
            this.showAchievement(`Módulo ${moduleId} completado! 🎉`);
        }
    }

    calculateTotalProgress() {
        const totalLessons = 50; // Total estimado de lições
        const completedLessons = this.progress.lessonsCompleted.length;
        this.progress.totalProgress = Math.round((completedLessons / totalLessons) * 100);
    }

    // ========================================
    // NAVEGAÇÃO
    // ========================================

    navigateToLesson(moduleId, lessonId) {
        this.currentModule = moduleId;
        this.currentLesson = lessonId;
        
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Update breadcrumbs
        this.updateBreadcrumbs();
        
        // Mark as visited
        this.markLessonComplete(moduleId, lessonId);
    }

    nextLesson() {
        const nextBtn = document.querySelector('.next-lesson-btn');
        if (nextBtn && nextBtn.dataset.nextModule && nextBtn.dataset.nextLesson) {
            const nextModule = parseInt(nextBtn.dataset.nextModule);
            const nextLesson = parseInt(nextBtn.dataset.nextLesson);
            this.navigateToLesson(nextModule, nextLesson);
        }
    }

    previousLesson() {
        const prevBtn = document.querySelector('.prev-lesson-btn');
        if (prevBtn && prevBtn.dataset.prevModule && prevBtn.dataset.prevLesson) {
            const prevModule = parseInt(prevBtn.dataset.prevModule);
            const prevLesson = parseInt(prevBtn.dataset.prevLesson);
            this.navigateToLesson(prevModule, prevLesson);
        }
    }

    // ========================================
    // INTERFACE E ANIMAÇÕES
    // ========================================

    updateProgressDisplay() {
        const progressBars = document.querySelectorAll('.progress-bar');
        const progressTexts = document.querySelectorAll('.progress-text');
        
        progressBars.forEach(bar => {
            bar.style.width = `${this.progress.totalProgress}%`;
        });
        
        progressTexts.forEach(text => {
            text.textContent = `${this.progress.totalProgress}%`;
        });

        // Update module completion indicators
        this.updateModuleCompletionStatus();
    }

    updateModuleCompletionStatus() {
        const moduleCards = document.querySelectorAll('.module-card');
        moduleCards.forEach((card, index) => {
            const moduleId = index;
            if (this.progress.modulesCompleted.includes(moduleId)) {
                card.classList.add('completed');
                const badge = card.querySelector('.completion-badge');
                if (badge) badge.style.display = 'block';
            }
        });
    }

    updateBreadcrumbs() {
        const breadcrumb = document.querySelector('.breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = `
                <a href="/" class="breadcrumb-item">Início</a>
                <span class="breadcrumb-separator">›</span>
                <a href="/curso.html" class="breadcrumb-item">Curso</a>
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-current">Módulo ${this.currentModule}</span>
            `;
        }
    }

    showAchievement(message) {
        const achievement = document.createElement('div');
        achievement.className = 'achievement-notification';
        achievement.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">🏆</div>
                <div class="achievement-text">${message}</div>
            </div>
        `;
        
        document.body.appendChild(achievement);
        
        // Animate in
        setTimeout(() => achievement.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            achievement.classList.remove('show');
            setTimeout(() => achievement.remove(), 300);
        }, 3000);
    }

    initAnimations() {
        // Animate cards on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    // ========================================
    // QUIZ ENGINE
    // ========================================

    initQuiz(quizData) {
        this.currentQuiz = quizData;
        this.currentQuestionIndex = 0;
        this.quizScore = 0;
        this.quizAnswers = [];
        this.renderQuizQuestion();
    }

    renderQuizQuestion() {
        const quizContainer = document.querySelector('.quiz-container');
        if (!quizContainer || !this.currentQuiz) return;

        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const totalQuestions = this.currentQuiz.questions.length;
        const progressPercent = ((this.currentQuestionIndex + 1) / totalQuestions) * 100;

        quizContainer.innerHTML = `
            <div class="quiz-header">
                <div class="quiz-progress">
                    <div class="quiz-progress-bar" style="width: ${progressPercent}%"></div>
                </div>
                <div class="quiz-info">
                    Questão ${this.currentQuestionIndex + 1} de ${totalQuestions}
                </div>
            </div>
            
            <div class="quiz-question">
                <h3>${question.question}</h3>
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <button class="quiz-option" data-index="${index}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <div class="quiz-actions">
                <button class="btn btn-primary quiz-next" disabled>
                    ${this.currentQuestionIndex < totalQuestions - 1 ? 'Próxima' : 'Finalizar'}
                </button>
            </div>
        `;

        this.setupQuizEventListeners();
    }

    setupQuizEventListeners() {
        const options = document.querySelectorAll('.quiz-option');
        const nextBtn = document.querySelector('.quiz-next');

        options.forEach((option, index) => {
            option.addEventListener('click', () => {
                // Remove previous selection
                options.forEach(opt => opt.classList.remove('selected'));
                
                // Mark current selection
                option.classList.add('selected');
                
                // Enable next button
                nextBtn.disabled = false;
                
                // Store answer
                this.quizAnswers[this.currentQuestionIndex] = index;
            });
        });

        nextBtn.addEventListener('click', () => {
            this.processQuizAnswer();
        });
    }

    processQuizAnswer() {
        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        const userAnswer = this.quizAnswers[this.currentQuestionIndex];
        
        if (userAnswer === question.correct_answer) {
            this.quizScore += question.points || 1;
        }

        this.currentQuestionIndex++;

        if (this.currentQuestionIndex < this.currentQuiz.questions.length) {
            this.renderQuizQuestion();
        } else {
            this.showQuizResults();
        }
    }

    showQuizResults() {
        const totalPoints = this.currentQuiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
        const percentage = Math.round((this.quizScore / totalPoints) * 100);
        const passed = percentage >= (this.currentQuiz.passing_score || 70);

        const quizContainer = document.querySelector('.quiz-container');
        quizContainer.innerHTML = `
            <div class="quiz-results">
                <div class="quiz-results-header">
                    <h2>Resultado do Quiz</h2>
                    <div class="quiz-score ${passed ? 'passed' : 'failed'}">
                        ${percentage}%
                    </div>
                </div>
                
                <div class="quiz-feedback">
                    ${passed ? 
                        '<div class="success-message">🎉 Parabéns! Passou no quiz!</div>' :
                        '<div class="error-message">😔 Não passou desta vez. Tente novamente!</div>'
                    }
                </div>
                
                <div class="quiz-actions">
                    ${passed ? 
                        '<button class="btn btn-primary" onclick="app.continueToNextModule()">Continuar</button>' :
                        '<button class="btn btn-secondary" onclick="app.retryQuiz()">Tentar Novamente</button>'
                    }
                </div>
            </div>
        `;

        if (passed) {
            this.markQuizComplete();
        }
    }

    markQuizComplete() {
        const quizKey = `quiz-${this.currentModule}`;
        if (!this.progress.quizzesCompleted.includes(quizKey)) {
            this.progress.quizzesCompleted.push(quizKey);
            this.saveProgress();
            this.showAchievement('Quiz completado com sucesso! 🎯');
        }
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    setupEventListeners() {
        // Navigation buttons
        document.addEventListener('click', (e) => {
            if (e.target.matches('.next-lesson-btn')) {
                this.nextLesson();
            }
            
            if (e.target.matches('.prev-lesson-btn')) {
                this.previousLesson();
            }
            
            if (e.target.matches('.module-card')) {
                const moduleId = e.target.dataset.module;
                if (moduleId) {
                    window.location.href = `/modulo${moduleId}.html`;
                }
            }
        });

        // Dark mode toggle
        const darkModeToggle = document.querySelector('.dark-mode-toggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', this.toggleDarkMode.bind(this));
        }

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.handleSearch.bind(this));
        }

        // Track time spent
        this.startTimeTracking();
    }

    toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('dark-mode', isDark);
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        const searchResults = document.querySelector('.search-results');
        
        if (query.length < 2) {
            if (searchResults) searchResults.style.display = 'none';
            return;
        }

        // Simple search implementation
        const results = this.searchContent(query);
        this.displaySearchResults(results, searchResults);
    }

    searchContent(query) {
        // Implementação básica de busca
        const modules = [
            { id: 1, title: 'Fundamentos da Liderança', url: '/modulo1.html' },
            { id: 2, title: 'Estilos de Liderança', url: '/modulo2.html' },
            // ... outros módulos
        ];

        return modules.filter(module => 
            module.title.toLowerCase().includes(query)
        );
    }

    displaySearchResults(results, container) {
        if (!container) return;

        container.innerHTML = results.map(result => `
            <div class="search-result-item">
                <a href="${result.url}">${result.title}</a>
            </div>
        `).join('');

        container.style.display = results.length > 0 ? 'block' : 'none';
    }

    startTimeTracking() {
        this.sessionStartTime = Date.now();
        
        // Save time every minute
        setInterval(() => {
            const sessionTime = Date.now() - this.sessionStartTime;
            this.progress.timeSpent += sessionTime;
            this.sessionStartTime = Date.now();
            this.saveProgress();
        }, 60000);

        // Save on page unload
        window.addEventListener('beforeunload', () => {
            const sessionTime = Date.now() - this.sessionStartTime;
            this.progress.timeSpent += sessionTime;
            this.saveProgress();
        });
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m`;
    }

    getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    }

    // ========================================
    // PUBLIC API
    // ========================================

    getProgressData() {
        return this.progress;
    }

    resetProgress() {
        if (confirm('Tem certeza que deseja resetar todo o progresso?')) {
            localStorage.removeItem('curso-lideranca-progress');
            this.progress = this.loadProgress();
            this.updateProgressDisplay();
            this.showAchievement('Progresso resetado!');
        }
    }

    exportProgress() {
        const data = {
            progress: this.progress,
            exportDate: new Date().toISOString(),
            courseVersion: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'curso-lideranca-progresso.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CursoLideranca();
    
    // Apply saved dark mode preference
    const savedDarkMode = localStorage.getItem('dark-mode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
    }
});

// ========================================
// GLOBAL UTILITIES
// ========================================

// Smooth scroll for anchor links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    }
});

// Console welcome message
console.log(`
🎯 CURSO DE LIDERANÇA DE EQUIPAS
==============================
Versão: 1.0.0
Desenvolvido com ❤️ para excelência em liderança

Comandos disponíveis:
- app.getProgressData() - Ver progresso atual
- app.resetProgress() - Resetar progresso
- app.exportProgress() - Exportar dados
`);