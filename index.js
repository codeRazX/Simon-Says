(()=>{
    const $ = el => document.querySelector(`.${el}`);
    const $$ = el => document.getElementById(el);

    const board = $(`board`);
    const count = $$('count');
    const btnStart = $$('start');
    const btnStrict = $$('strict');
    const toggleTurnedON = $$('toggle');
    const pulsersDom = [...document.querySelectorAll('[class*="pulser-"]')];

    let modeStrict = false;
    let gameOver = false;
    let start = false;
    let canPlay = true;
    let waitingTouchID = null;
    let totalCount = 1;
    let currentIndex = 0;
    const AMOUNT_PULSERS = 4;
    const MAX_STEPS = 20;
   
    const pulsers = new Map();
    const listSteps = [];
 

    const getPulser = ()=>{
        pulsersDom.forEach(pulser => {    

            pulsers.set(pulser.dataset.value,()=>{

                return new Promise(resolve => {
                    removeClass(pulser,'desactived');
                    new Audio(pulser.dataset.audio).play();
                    setTimeout(()=>{
                        pulser.classList.add('desactived');
                        resolve();
                    },1000)
                })
            })
        })
    }
    getPulser();


    const removeAllClass = (el,clas)=> el.forEach(pulser => pulser.classList.contains(clas) && removeClass(pulser,clas));

    const addAllClass = (el,clas)=> el.forEach(pulser => !pulser.classList.contains(clas) && pulser.classList.add(clas));

    const updateCount = ()=> count.textContent = String(totalCount).padStart(2,'0');

    const toggleClass = (el,clas)=> el.classList.toggle(clas);
    
    const removeClass = (el,clas)=> el.classList.remove(clas);

    const resetBoard = ()=>{
        if(count.textContent !== '--') count.textContent = '--';
        count.classList.contains('anim-appear') && removeClass(count,'anim-appear');
        totalCount = 1;
        currentIndex = 0;
        if(listSteps.length) listSteps.length = 0;
        removeAllClass(pulsersDom,'touch');
        addAllClass(pulsersDom,'desactived');
        if(waitingTouchID)clearTimeout(waitingTouchID);
        if(gameOver)gameOver = false;
    }

    const randomNumber = ()=> Math.floor(Math.random() * AMOUNT_PULSERS);

    const waitingTouch = ()=> setTimeout(()=>{
       
        canPlay = false;
        removeAllClass(pulsersDom,'touch');
        count.textContent = '??'
        count.classList.add('anim-appear');
         setTimeout(()=>{
            updateCount();
            removeClass(count,'anim-appear');
            play();
        },1400)
    },10000);

    const play = async()=>{
        if(waitingTouchID)clearTimeout(waitingTouchID);

        for(let i= 0; i < listSteps.length; i++){
          await pulsers.get(String(listSteps[i]))();
        }

        waitingTouchID = waitingTouch();
        canPlay = true;
        addAllClass(pulsersDom,'touch');
    }

    const generateSeries = ()=>{
         if(modeStrict){
            listSteps.length = 0;
            for(let i = 0; i < totalCount; i++){
                listSteps.push(randomNumber());
            }
         }
         else{
            listSteps.push(randomNumber());
         }
         
         play();
    }
       
    function launchGame(e){

        if(e.target.closest('.toggle-start')){
            start = !start;
            toggleClass(count,'desactived');
            toggleClass(this,'actived-toggle');
            btnStrict.firstElementChild.classList.contains('strict-on') && removeClass(btnStrict.firstElementChild,'strict-on'); 
            modeStrict = false;
            gameOver = false;
            canPlay = true;
            resetBoard();
        }
    }

    const startGame = (e)=>{
        if(!start)return;
        resetBoard();
        count.classList.add('anim-appear');

        setTimeout(()=>{
            updateCount();
            generateSeries();
            removeClass(count,'anim-appear');
        },1400);
    }

    function strictMode(e){
        if(!start)return;
        toggleClass(this.firstElementChild,'strict-on');
        modeStrict = !modeStrict;
     
    }

    const handleTouch = (e)=>{
        if(!e.target.matches('[class*="pulser-"]') || !start || !listSteps.length || !canPlay || gameOver)return;

        if(waitingTouchID)clearTimeout(waitingTouchID);
        const selectStep = parseInt(e.target.dataset.value);
        
        if(selectStep === listSteps[currentIndex]){
           
            if(currentIndex === listSteps.length - 1){

                if(listSteps.length === MAX_STEPS){
                    gameOver = true;
                    count.textContent = 'WIN'
                    count.classList.add('anim-appear');
                    setTimeout(()=>{
                        startGame();
                    },4000);
                    return;
                }
                removeAllClass(pulsersDom,'touch');
                canPlay = false;
                totalCount++;
                currentIndex = 0;
                updateCount();
                setTimeout(()=> generateSeries(),1500);
            }
            else{
                currentIndex++;
            }
        }
        else{
            if(modeStrict){
                startGame();
                return;
            }

            removeAllClass(pulsersDom,'touch');
            currentIndex = 0;
            canPlay = false;
            count.textContent = '!!'
            count.classList.add('anim-appear');
            setTimeout(()=>{
                removeClass(count,'anim-appear');
                updateCount();
                play(); 
            },1400)
            
        }
    }

    toggleTurnedON.addEventListener('click',launchGame);
    btnStart.addEventListener('click',startGame);
    btnStrict.addEventListener('click',strictMode);
    board.addEventListener('click',handleTouch);

})();