// Utility for positioning the quiz open icon
export function setOpenIconPosition(openIcon, position) {
    const positions = {
        'top-left': { top: '16px', left: '16px', right: '', bottom: '' },
        'top-right': { top: '16px', right: '16px', left: '', bottom: '' },
        'bottom-left': { bottom: '16px', left: '16px', right: '', top: '' },
        'bottom-right': { bottom: '16px', right: '16px', left: '', top: '' },
        'center-left': { top: '50%', left: '16px', transform: 'translateY(-50%)' },
        'center-right': { top: '50%', right: '16px', transform: 'translateY(-50%)' },
    };
    Object.assign(openIcon.style, positions[position] || positions['top-right']);
}

export function createVideoElement(src) {
    const video = document.createElement('video');
    video.src = src;
    video.controls = false;
    video.autoplay = true;
    video.muted = false;
    video.playsInline = true;
    video.classList.add('quiz-video');
    return video;
}

export function numberToLetterInOrder(number) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[number - 1] || '';
}