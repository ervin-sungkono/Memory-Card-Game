import { _id, _class, _query, _queryAll, randomBetween, createEle, shuffle, delay } from "./util.js";
import { Dialog } from "./popup.js";
import { SelectOption } from "./select.js";
import { Timer } from "./timer.js";

const MAX_PAIRS = 10; // Define the maximum amount of pair allowed;
const range = Array.from({ length: MAX_PAIRS }, (_, index) => index + 1); // Range of cards to choose from
let _cards; // Stores cards detail
let _delay; // Stores delay timeout function for each card flipped
let _pairAmount = 4; // Amount of card pair for memory game, 4 for easy, 8 for medium, 10 for hard, default is 8.
let _timeLimit = 90; // Amount of seconds given to find all pairs
let _boardLocked;
let _chosenCards;
let _difficulty = 'easy'; // Chosen difficulty
let _foundPairs = 0; // Store the amount of found pairs;
const _difficultyOptions = [
    { id: 'easy', label: 'Easy (4 Pairs)' },
    { id: 'medium', label: 'Medium (8 Pairs)' },
    { id: 'hard', label: 'Hard (10 Pairs)' }
];

const coverImages = [];
const images = []
const imageRange = range.map(async(idx) => {  
    for(let i = 0; i < 2; i++){
        const image = new Image(300, 400);
        const coverImage = new Image(300, 400);

        image.src = `assets/${idx}.webp`;
        coverImage.src = 'assets/cover.webp';

        await image.decode();
        await coverImage.decode();

        images[(idx - 1) * 2 + i] = image;
        coverImages[(idx - 1) * 2 + i] = coverImage;
    }
})

const substractRange = (range) => {
    let diff = MAX_PAIRS - _pairAmount;
    while(diff--){
        const removedIndex = randomBetween(0, _pairAmount + diff);
        range.splice(removedIndex, 1);
    }

    return range;
}

const generateCards = () => {
    const substractedRange = substractRange([...range]);

    let fixedRange = [];
    for (let i = 0; i < 2; i++) {
        fixedRange.push(...substractedRange.map(card => ({card, order: i})));
    }

    const cards = fixedRange
        .map(({card, order}) => {
            const id = crypto.randomUUID();
            const cardOrder = (card - 1) * 2 + order;
            _cards[id] = {
                idx: card,
                order: cardOrder,
                flipped: false
            }
            
            return { id };
        });

    shuffle(cards);
    
    for(const card of cards){
        generateCard(card);
    }
}

const generateCard = (card) => {
    const cardWrapperEle = createEle('div', { className: 'card-wrapper' });
    const innerCardEle = createEle('div', { className: 'card card-inner' });
    const frontCardEle = createEle('div', { className: 'card card-front' });
    const backCardEle = createEle('div', { className: 'card card-back' });
    
    cardWrapperEle.id = card.id;
    frontCardEle.appendChild(coverImages[_cards[card.id].order]);

    cardWrapperEle.addEventListener('click', () => {
        if(_cards[card.id].flipped || _boardLocked) return; // if already flipped or board locked, can't trigger flip.

        _chosenCards.push(card);
        flipCard(card.id);

        if (_chosenCards.length === 2) {
            let delayTimeout = 200; // Default delay is 0.2 second
            _boardLocked = true;

            const compareResult = compareCards(_chosenCards);

            if (!compareResult) {
                const tempCards = [..._chosenCards];
                delayTimeout = 1000; // Create a 1 second delay when guessing the wrong card

                setTimeout(() => {
                    tempCards.forEach((card) => {
                        flipCard(card.id);
                        _cards[card.id].flipped = false;
                    });
                }, delayTimeout);
            } else {
                _foundPairs++;
            }

            if(_foundPairs == _pairAmount) {
                const gameEndEvent = new CustomEvent('gameend', {
                    detail: {
                        status: 'WIN'
                    }
                });

                document.dispatchEvent(gameEndEvent);
            }

            setTimeout(() => {
                _boardLocked = false;
                _chosenCards = [];
            }, delayTimeout);
        }
    })

    innerCardEle.append(frontCardEle, backCardEle);
    cardWrapperEle.appendChild(innerCardEle);
    _id('card-board').append(cardWrapperEle);
}

const timer = new Timer();
const generateTimer = () => {
    const cardBoard = _id('card-board');
    timer.setDuration(_timeLimit);
    timer.reset();

    if(!timer.getElement().isConnected) cardBoard.parentNode.insertBefore(timer.getElement(), cardBoard);

    timer.removeOnTimerEndListener();

    const gameEndEvent = new CustomEvent('gameend', {
        detail: {
            status: 'LOSE'
        }
    });
    timer.addOnTimerEndListener(() => document.dispatchEvent(gameEndEvent));

    timer.start();
}

const flipCard = (id) => {  
    if(!_cards[id].flipped) _cards[id].flipped = true;

    // Clears the previous timeout function
    clearTimeout(_delay[id]);

    const cardWrapperEle = _id(id);
    const innerCardEle = cardWrapperEle.querySelector('.card-inner');
    const backCardEle = cardWrapperEle.querySelector('.card-inner .card-back');

    innerCardEle.classList.toggle('flipped');
    const imageNode = images[_cards[id].order];

    if (innerCardEle.classList.contains('flipped')) {
        backCardEle.appendChild(imageNode);
    }
    else {
        // Set a delay to avoid multiple setTimeout calls
        _delay[id] = setTimeout(() => {
            imageNode.remove();
        }, 500);
    }
}

const isSameCard = (card, val) => {
    return _cards[card.id].idx === val;
}

const compareCards = (cards) => {
    const val = _cards[cards[0].id].idx;
    return cards.every((card) => isSameCard(card, val));
}

const setDifficulty = (diff, { pairAmount, timeLimit } = {}) => {
    switch (diff) {
        case 'easy':
            _pairAmount = 4;
            _timeLimit = 90;

            break;
        case 'medium':
            _pairAmount = 8;
            _timeLimit = 90;

            break;
        case 'hard':
            _pairAmount = 10;
            _timeLimit = 60;

            break;
        case 'custom':
            _pairAmount = pairAmount;
            _timeLimit = timeLimit;
    }
}

const startGame = () => {
    _foundPairs = 0;
    _cards = {};
    _delay = {};
    _chosenCards = [];
    _boardLocked = false;
    _id('card-board').innerHTML = '';
    setDifficulty(_difficulty);
    generateCards();
    generateTimer();
}

const showResults = (e) => {
    _boardLocked = true;
    timer.pause();

    const { status } = e.detail;
    const remainingTime = timer.getCurrentTime();

    let resultTitle;
    let resultBody;

    if(status === 'WIN') {
        resultTitle = 'You Win!';
        resultBody = `<p>With a remaining time of ${remainingTime} seconds!</p><p>Do you want to play again?</p>`;
    } else if (status === 'LOSE') {
        resultTitle = 'You Lose!';
        resultBody = '<p>Do you want to try again?</p>';
    }

    const resultConfig = {
        title: resultTitle,
        body: resultBody,
        confirm: {
            label: 'Play Again',
            onClick: () => {
                resultDialog.hide().then(startGame);
            }
        }
    }

    const resultDialog = new Dialog(resultConfig);
    resultDialog.show();
}

const selectDiff = new SelectOption({ defaultSelected: _difficulty, options: _difficultyOptions });
selectDiff.addOnChangeListener((e) => {
    _difficulty = e.target.value;
})

const menuConfig = {
    title: 'Let\'s Play Memory Card Game',
    body: `<p>To continue, please select a difficulty</p>`,
    confirm: {
        label: 'Start Game',
        onClick: () => {
            menuDialog.hide().then(startGame);
        }
    }
}
const menuDialog = new Dialog(menuConfig);
menuDialog.addContent(selectDiff.getElement());

Promise.all(imageRange).then(() => {
    _id('loading').classList.add('hide');
    document.addEventListener('gameend', showResults);
    menuDialog.show();
});