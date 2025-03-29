export const _id = (id) => {
    return document.getElementById(id);
};

export const _class = (className) => {
    return document.getElementsByClassName(className);
};

export const _query = (selector) => {
    return document.querySelector(selector);
};

export const _queryAll = (selector) => {
    return document.querySelectorAll(selector);
};

const addClass = (element, classNames) => {
    if (typeof classNames == 'string') {
        element.classList.add(...classNames.split(' '))
    } else if (Array.isArray(classNames)) {
        element.classList.add(...classNames);
    }
}

/**
 * @param {string} tag HTML tag of the element.
 * @param {object} options
 * @param {string} options.className Class name for the element.
 * @param {string} options.style CSS inline style for the element.
 * @returns {HTMLElement}
 */
export const createEle = (tag = 'div', { className, style } = { className: '', style: '' }) => {
    const element = document.createElement(tag);
    if (className) {
        addClass(element, className);
    }
    if (style) {
        element.style = style;
    }
    
    return element;
}

/**
 * @param {number} min Minimum value included in the random number.
 * @param {number} max Maximum value included in the random number.
 * @returns {number}
 */
export const randomBetween = (min, max) => { 
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * @param {any[]} arr Given array to shuffle.
 * @returns {void}
 */
export const shuffle = (arr) => {
    var i = arr.length, j, temp;
    while(--i > 0){
      j = Math.floor(Math.random()*(i+1));
      temp = arr[j];
      arr[j] = arr[i];
      arr[i] = temp;
    }
}

/**
 * @param {number} ms Time to delay in millisecond.
 * @returns {Promise<void>}
 */
export const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}