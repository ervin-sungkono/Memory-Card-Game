import { createEle } from "./util.js";

const generateOption = (option, selected) => {
    const optionEle = createEle('option');
    optionEle.value= option.id;
    if(selected) optionEle.setAttribute('selected', '');
    optionEle.textContent = option.label;

    return optionEle;
}

const generateOptions = (options, defaultSelected) => {
    return options.map((option) => generateOption(option, option.id === defaultSelected));
}

export class SelectOption {
    #defaultSelected
    #options;
    #listener;
    #element;

    constructor({ defaultSelected = null, options = [] } = {}) {
        this.#defaultSelected = defaultSelected;
        this.#options = options;
        this.#listener = null;
        this.#element = null;

        this.#init();
    }

    #init() {
        const selectWrapper = createEle('div', { className: 'select-wrapper' });
        const selectEle = createEle('select', { className: 'select-option' });
        const options = generateOptions(this.#options, this.#defaultSelected);

        selectEle.append(...options);
        selectWrapper.append(selectEle);
        this.#element = selectWrapper;
    }

    getElement() {
        return this.#element;
    }

    addOnChangeListener(listener) {
        this.#listener = listener;
        this.#element.addEventListener('change', this.#listener);
    }

    removeOnChangeListener() {
        this.#element.removeEventListener('change', this.#listener);
        this.#listener = null;
    }
}