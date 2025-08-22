import './quiz.scss';
import { createVideoElement, numberToLetterInOrder, setOpenIconPosition } from './quiz-utils.js';
import FormView from './form/formView.js';
import gsap from 'gsap';

function smartoVideoAssistant(quizSettings) {
    const container = quizSettings.container || document.body;
    container.insertAdjacentHTML('beforeend', getQuizLayout(quizSettings));

    document.querySelector('[id="quiz-open-icon"]').addEventListener('mouseenter', () => {
        document.querySelector('[id="quiz-open-icon"]').querySelector('video').play();
    });
    document.querySelector('[id="quiz-open-icon"]').addEventListener('mouseleave', () => {
        document.querySelector('[id="quiz-open-icon"]').querySelector('video').pause();
    });

    

    const openIcon = document.getElementById('quiz-open-icon');
    const modal = document.getElementById('quiz-modal');
    const content = document.getElementById('quiz-content');
    const closeBtn = document.getElementById('quiz-close-btn');
    
    let currentQuestion = 0;
    let userAnswers = [];
    initQuiz();
    

    
    function addClassDependOnPosition(element) {
        const positionClass = `quiz-${quizSettings.openIcon.position.replace('-', '_')}`;
        element.classList.add(positionClass);
    }
    
    // --- Show/Hide Modal ---
    function showModal() {
        modal.style.display = 'block';
        gsap.timeline()
            .set(modal, { display: 'block' })
            .fromTo(modal, {
                opacity: 0,
                y: -50
            }, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power4.out'
            });
            currentQuestion = 0;
            userAnswers = [];
            showQuestion();
        }
        function hideModal() {
            gsap.timeline()
            .to(modal, {
                opacity: 0,
                y: -50,
                ease: 'power4.out',
                duration: 0.5
            })
            .set(modal, { display: 'none' });
        modal.querySelectorAll('video').forEach(video => video.pause());
    }
    
    
    // --- Render Question ---
    async function showQuestion() {
        const q = quizSettings.questions[currentQuestion];
        if (!q) return showFeedbackForm();
        gsap.fromTo(content, { 
            opacity: 1,
            xPercent: 0,
        }, {  
            duration: 0.5,
            opacity: 0,
            ease: 'power4.out',
            xPercent: currentQuestion == 0 ? 0 : 10,
        });
        await sleep(500);
        content.innerHTML = '';
        // Video

        modal.insertAdjacentHTML('beforeend', `
            <div class="quiz-video__loader">
                <div class="quiz-video__loader-inner"></div>
            </div>
        `);

        const v = createVideoElement(q.video);
        content.appendChild(v);
        v.classList.add('quiz-video');
        content.appendChild(v);
        v.addEventListener('canplaythrough', () => {
            console.log('Video metadata loaded. Duration:', v.duration, 'Dimensions:', v.videoWidth + 'x' + v.videoHeight);
            modal.querySelector('.quiz-video__loader').remove();
            gsap.fromTo(content, { 
                opacity: 1,
                xPercent: currentQuestion == 0 ? 0 : -10,
            }, {  
                opacity: 1,
                duration: 0.5,
                ease: 'power4.out',
                xPercent: 0,
            });
            v.play();
        }, {
            once: true
        });


        

        // Play/Stop button for video (on question screen)
        const playBtn = getPlayButton((e) => {
            e.stopPropagation();
            v.paused ? v.play() : v.pause();
        }, v);
        content.appendChild(playBtn);
        v.addEventListener('play', (e) => playBtn.innerHTML = getPauseIcon());
        v.addEventListener('pause', (e) => playBtn.innerHTML = getPlayIcon());



        // Question
        const qDiv = document.createElement('div');
        qDiv.className = 'quiz-question';
        qDiv.textContent = q.question;
        content.appendChild(qDiv);
        // Answers
        const responseArea = document.createElement('div');
        responseArea.className = 'quiz-answers';
        q.answers.forEach((ans, i) => {
            const answerWrapper = document.createElement('div');
            answerWrapper.className = 'quiz-answer-btn-wrapper';

            const btn = document.createElement('button');
            btn.className = 'quiz-answer-btn';
            btn.innerHTML = `
                ${q.orderedList ? `<span class="quiz-answer-btn__number">${numberToLetterInOrder(i + 1)} </span>` : ''}
                <div class="quiz-answer-btn__title">${ans}</div>
            `;
            btn.onclick = () => {
                userAnswers[currentQuestion] = { question: q.question, _question: q._question, answer: ans, correct: typeof q.correct === 'number' ? i === q.correct : undefined };
                userAnswers = userAnswers.slice(0, currentQuestion + 1);
                currentQuestion++;
                showQuestion();
            };

            answerWrapper.appendChild(btn);
            responseArea.appendChild(answerWrapper);
        });
        content.appendChild(responseArea);
    
        // Back button
        if (currentQuestion > 0) {
            content.appendChild(getStepBackButton((e) => {
                e.preventDefault();
                currentQuestion--;
                showQuestion();
            }));
        }
    }
    
    // --- Feedback Form ---
    function showFeedbackForm() {
        content.innerHTML = '';
        new FormView(content, quizSettings.formAction, quizSettings);
        console.log('userAnswers', userAnswers);

        content.appendChild(getStepBackButton((e) => {
            e.preventDefault();
            currentQuestion--;
            showQuestion();
        }));
    }
    
    function initQuiz() {
        setOpenIconPosition(openIcon, quizSettings.openIcon.position);
        addClassDependOnPosition(modal);
        openIcon.style.display = 'flex';
        // Events
        openIcon.onclick = showModal;
        closeBtn.onclick = hideModal;
        modal.onclick = e => { if (e.target === modal) hideModal(); };
    }

    
}
window.smartoVideoAssistant = smartoVideoAssistant;


function getStepBackButton(onclick) {
    const backBtn = document.createElement('button');
    backBtn.className = 'quiz-back-btn';
    backBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.29291 11.8535L12.1464 17.707L12.8535 17L8.20697 12.3535H17.9999V11.3535H8.20697L12.8535 6.70703L12.1464 6L6.29291 11.8535Z" fill="#FAFBFE"/>
        </svg>
    `;
    backBtn.onclick = onclick;
    return backBtn;
} 

function getPlayButton(onclick = () => {}, v) {
    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.className = 'quiz-video-play-btn';
    playBtn.innerHTML = v.paused ? getPlayIcon() : getPauseIcon();
    playBtn.style.zIndex = '5';
    playBtn.onclick = onclick;

    return playBtn;
}

function getPlayIcon() {
    return `
        <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5L0.5 9.33013L0.5 0.669872L8 5Z" fill="var(--quiz-nav-btn-color)"/>
        </svg>
    `
}

function getPauseIcon() {
    return `
        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="1.5" height="10" fill="var(--quiz-nav-btn-color)"/>
            <rect x="4" y="6.10352e-05" width="1.5" height="10" fill="var(--quiz-nav-btn-color)"/>
        </svg>
    `
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getQuizLayout(quizSettings) {
    return `
        <div id="quiz-open-icon" style="display:none;" class="quiz-open-button">
            <!-- <img alt="Open Quiz" src="${quizSettings.poster}"/>-->
            <video muted playsinline poster="${quizSettings.poster}">
                <source src="${quizSettings['play-button-video']}" type="video/mp4">
            </video>
            <span class="quiz-open-button__title">${quizSettings.openIcon.text}</span>
        </div>
        
        <!-- Quiz Modal -->
        <div id="quiz-modal">
            <div id="quiz-content"></div>
            <button id="quiz-close-btn" title="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.707 8L13.207 12.5L17.707 17L17 17.707L12.5 13.207L8 17.707L7.29297 17L11.793 12.5L7.29297 8L8 7.29297L12.5 11.793L17 7.29297L17.707 8Z" fill="#FAFBFE"/>
                </svg>
            </button>
            <div class="quiz-modal-footer">
                <img src="${quizSettings.authorLogo}" alt="Author Logo" />
            </div>
        </div>
    `;
}

