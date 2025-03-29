import { createEle } from "./util.js";

const timerChangeEvent = new CustomEvent('timerchange');
const timerEndEvent = new CustomEvent('timerend');

export class Timer {
    #duration;
    #currentTime;
    #interval;
    #element;
    #changeListener;
    #endListener;

    #timerSlider;
    #timerIndicator;

    constructor(duration) {
        this.#duration = duration;
        this.#element = null;

        this.#init();
    }

    #init() {
        const timerWrapper = createEle('div', { className: 'timer timer-wrapper' });
        const timerRange = createEle('div', { className: 'timer timer-range' });
        this.#timerSlider = createEle('div', { className: 'timer timer-slider' });
        this.#timerIndicator = createEle('p', { className: 'timer timer-indicator' });

        timerRange.appendChild(this.#timerSlider);
        timerWrapper.append(this.#timerIndicator, timerRange);
        this.#element = timerWrapper;
    }
    
    #update() {
        this.#timerIndicator.textContent = this.#currentTime;

        this.#element.dispatchEvent(timerChangeEvent);
    }

    getElement() {
        return this.#element;
    }

    getCurrentTime() {
        return this.#currentTime;
    }

    setDuration(duration) {
        this.#duration = duration;
    }

    start() {
        this.#update();
        this.#timerSlider.style.animation = `shrink ${this.#duration}s linear forwards`;
        this.#interval = setInterval(() => {
            this.#currentTime -= 1; 
            this.#update();

            if(this.#currentTime <= 0) {
                clearInterval(this.#interval);
                this.#element.dispatchEvent(timerEndEvent);
                return;
            } 
        }, 1000);
    }

    pause() {
        this.#timerSlider.style.animationPlayState = 'paused';
        clearInterval(this.#interval);
    }

    reset() {
        this.#currentTime = this.#duration;
        
        this.#timerIndicator
    }

    addOnTimerChangeListener(listener) {
        this.#changeListener = listener;
        this.#element.addEventListener('timerchange', listener);
    }

    removeOnTimerChangeListener() {
        if(!this.#changeListener) return;
        this.#element.removeEventListener('timerchange', this.#changeListener);
    }

    addOnTimerEndListener(listener) {
        this.#endListener = listener;
        this.#element.addEventListener('timerend', listener);
    }

    removeOnTimerEndListener() {
        if(!this.#endListener) return;
        this.#element.removeEventListener('timerend', this.#endListener);
    }
}