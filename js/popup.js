import { createEle, delay } from "./util.js";

export class Dialog {
    #title;
    #body;
    #confirm;
    #cancel;
    #element;

    #dialogCard;
    #dialogBody;

    constructor({
        title = null, 
        body = null, 
        confirm = null, 
        cancel = null 
    } = {}) {
        this.#title = title;
        this.#body = body;
        this.#confirm = confirm;
        this.#cancel = cancel;
        this.#element = null;

        this.#init();
    }

    #init() {
        const dialogWrapper = createEle('div', { className: 'dialog dialog-wrapper' });
        this.#dialogCard = createEle('div', { className: 'dialog dialog-card' })
        this.#dialogBody = createEle('div', { className: 'dialog dialog-body' });
        const buttonWrapper = createEle('div', { className: 'dialog button-wrapper' });

        if(this.#title){
            const dialogHeader = createEle('div', { className: 'dialog dialog-header' });
            dialogHeader.textContent = this.#title;
            this.#dialogCard.appendChild(dialogHeader);
        }

        if(this.#body){
            this.#dialogBody.innerHTML = this.#body;
        }

        if(this.#cancel) {
            const cancelBtn = createEle('button', { className: 'dialog dialog-btn btn-cancel' });
            cancelBtn.textContent = this.#cancel.label;
            cancelBtn.addEventListener('click', this.#cancel.onClick);
            buttonWrapper.appendChild(cancelBtn);
        }

        if(this.#confirm) {
            const confirmBtn = createEle('button', { className: 'dialog dialog-btn btn-confirm' });
            confirmBtn.textContent = this.#confirm.label;
            confirmBtn.addEventListener('click', this.#confirm.onClick);
            buttonWrapper.appendChild(confirmBtn);
        }
        
        this.#dialogCard.append(this.#dialogBody, buttonWrapper);
        dialogWrapper.appendChild(this.#dialogCard);
        
        this.#element = dialogWrapper;
    }

    getElement() {
        return this.#element;
    }

    async show() {
        if(!this.#element) this.#init();

        document.body.appendChild(this.#element);
        this.#element.classList.add('show');
        this.#element.classList.remove('hide');
    }

    async hide() {
        if(!this.#element) return;

        this.#element.classList.remove('show');
        this.#element.offsetWidth;
        this.#element.classList.add('hide');

        await delay(500);

        this.#element.remove();
    }

    addContent(element) {
        if(!this.#element) return;
        
        this.#dialogBody.appendChild(element);
    }
}