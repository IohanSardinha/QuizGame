document.addEventListener('DOMContentLoaded', async () => {
    let config = null;
    let ALPHABET = Array.from({ length: 26 }, (v, i) => String.fromCharCode(65 + i));
    let questions = [];
    let currentQuestion = null;

    let playerScores = [0,0,0,0];
    let playerQueue = [];
    let roundBlocked = []
    let currentPlayer = null;
    let scoreMultiplier = 1;
    let scoreReduction = 0.25;
    let questionScore = 100;
    let playerTimeToAnswer = 10;
    let wrongOptions = []
    let turnStarted = false;
    let gameDuration = 10;
    let roundCount = 0;
    let isGameOver = false;

    let playerNames = ["Player 1", "Player 2", "Player 3", "Player 4"]
    let playerColors = ["#ff9999","#99ff99","#9999ff","#ffff99"]

    const shuffle = (array) => { 
        for (let i = array.length - 1; i > 0; i--) { 
          const j = Math.floor(Math.random() * (i + 1)); 
          [array[i], array[j]] = [array[j], array[i]]; 
        } 
        return array; 
      }; 
    
    
    fetch("./config.json")
      .then(response => response.json())
      .then(data => {
          config = data;
          reconfigure(config)
        fetch('questions.csv')
            .then(response => response.text())
            .then(data => {
                defaultQuestions = parseCSV(data);
                document.addEventListener('keydown', handlePlayerInput);
                //newGame()
                setUpMainMenu();
            });
      })

    async function newGame(){

        gameDuration = document.querySelector('input[name="turns"]:checked').value;

        for(let i = 1; i <= playerNames.length; i++){
            const el = document.getElementById(`player-name-input-${i}`)
            playerNames[i-1] = el.value || el.placeholder;
            document.getElementById(`player-name-${i}`).innerHTML = playerNames[i-1]
        }

        if(document.getElementById("question-data-source").selectedIndex == 0){
            questions = shuffle(defaultQuestions).slice(0,gameDuration);
        }
        else if(document.getElementById("question-data-source").selectedIndex == 1){
            const selectedCategories = [];
            const checkboxes = document.querySelectorAll('input[name="open-trivia-category"]:checked');

            checkboxes.forEach((checkbox) => {
                selectedCategories.push(checkbox.value);
            });


            document.getElementById("loading-popup").style.visibility = "visible";
            document.getElementById("loading-bar").classList.add("loading-animation");
            document.getElementById("loading-bar").style.animationDuration = `${(checkboxes.length)*5}s`;

            const difficulty = document.querySelector('input[name="open-trivia-difficulty"]:checked').value;

            let OTDBQuestions = []

            for(let [i, category] of selectedCategories.entries()){
                const requestURL = `https://opentdb.com/api.php?type=multiple&amount=${gameDuration}${difficulty.length > 0 ? ("&difficulty="+difficulty):""}&category=${category}`;

                const requesQuestions = (await(await fetch(requestURL)).json()).results;
                OTDBQuestions = OTDBQuestions.concat(requesQuestions)

                if(i != selectedCategories.length-1) await new Promise(resolve=>setTimeout(resolve,5000));
            }

            if(OTDBQuestions.length == 0){
                const requestURL = `https://opentdb.com/api.php?type=multiple&amount=${gameDuration}${difficulty.length > 0 ? ("&difficulty="+difficulty):""}`;
                const requesQuestions = (await(await fetch(requestURL)).json()).results;
                OTDBQuestions = OTDBQuestions.concat(requesQuestions)
            }

            OTDBQuestions = shuffle(OTDBQuestions).slice(0,gameDuration);

            questions = OTDBQuestions.map((question)=>{
                
                let O = shuffle(question.incorrect_answers.concat([question.correct_answer]))
                let A = O.indexOf(question.correct_answer)
                O.map(decodeURI)
                let Q = {"question":decodeURI(question.question), options:O, answer:ALPHABET[A]}

                return Q
            });

            document.getElementById("loading-popup").style.visibility = "hidden";
            document.getElementById("loading-bar").classList.remove("loading-animation");

        }else if(document.getElementById("question-data-source").selectedIndex == 2){
            return
        }
        

        playerTimeToAnswer = document.getElementById("answer-time-input").value

        playerScores = [0,0,0,0]
        roundCount = 0
        document.getElementById('main-menu').style.display = "none";
        document.getElementById('game-over').style.display = "none";
        document.getElementById('scoreboard').style.display = "block";

        isGameOver = false;
        turnStarted = false;

        nextQuestion()
    }

    function showExtendedSettings(el){
        switch(el.selectedIndex){
            case 0:
                document.getElementById("open-trivia-settings").style.display = "none";
                document.getElementById("upload-questions-settings").style.display = "none";
                break;
            case 1:
                document.getElementById("open-trivia-settings").style.display = "block";
                document.getElementById("upload-questions-settings").style.display = "none";
                break;
            case 2:
                document.getElementById("open-trivia-settings").style.display = "none";
                document.getElementById("upload-questions-settings").style.display = "block";
                break;                
        }
    }

    function setUpMainMenu(){

        showExtendedSettings(document.getElementById("question-data-source"));

        document.getElementById("question-data-source").addEventListener("change",(e)=>showExtendedSettings(e.target));

        document.getElementById("start-button").onclick = newGame
    }

    function countDownDisplay(id, val, interval, finish, player){
        if(player != currentPlayer && player !== false)
            return

        if(val > 0){
            document.getElementById(id).innerHTML = val;
            setTimeout(()=>countDownDisplay(id, val-1, interval, finish, player), interval);
        }
        else{
            setTimeout(() => {
                document.getElementById(id).innerHTML = "";
                finish()
            }, interval/3);
        }
    }

    function setPlayerTurn(player){
        if(!turnStarted) return
        document.getElementById("player-turn-display").innerHTML = `${getString(config, "player-turn-before-str")}${playerNames[player-1]}${getString(config, "player-turn-after-str")}`;
        document.getElementById("background").style.backgroundColor = playerColors[player-1];
        countDownDisplay("player-turn-counter", playerTimeToAnswer, 1000, nextPlayer, currentPlayer)
    }

    function clearTurn(){
        document.getElementById("player-turn-display").innerHTML = ""
        document.getElementById("player-turn-counter").innerHTML = ""
        document.getElementById("background").style.backgroundColor = "#f0f0f0"
        document.getElementById("next-player").innerHTML = ""
        document.getElementById("question-img").src = ""
        document.getElementById('question-img').style.display = "none";
    }

    function handlePlayerSelection(player){

        if(!roundBlocked.includes(player)){
            playerQueue.push(player);
            roundBlocked.push(player);

            if(currentPlayer == null){
                currentPlayer = playerQueue.splice(0,1);
                setPlayerTurn(player)
            }

            if(playerQueue.length > 0){
                document.getElementById("next-player").innerHTML = `${getString(config, "next")} ${playerNames[playerQueue[0]-1]}`
            }
        }
    }

    function nextPlayer(){
        if((playerQueue.length == 0 && roundBlocked.length == playerNames.length) || (wrongOptions.length == currentQuestion.options.length - 1)){

            clearTurn()
            
            document.getElementById(`option-${currentQuestion.answer}`).classList.add('correct')
            turnStarted = false;
            setTimeout(nextQuestion, 1500);
        }
        else{

            if(playerQueue.length > 0){
                currentPlayer = playerQueue.splice(0,1);
                setPlayerTurn(currentPlayer)
                if(playerQueue.length > 0)
                    document.getElementById("next-player").innerHTML = `${getString(config, "next")} ${playerNames[playerQueue[0]-1]}`
                else
                    document.getElementById("next-player").innerHTML = ``
            }else{
                currentPlayer = null;
                clearTurn()
            }
        }
    }

    function handlePlayerOption(option){
        if(wrongOptions.includes(option) || currentPlayer == null)
            return

        optionButton = document.getElementById(`option-${option}`)
        if(currentQuestion.answer == option){
            optionButton.classList.add('correct');
            playerScores[currentPlayer-1] += parseInt(questionScore*scoreMultiplier);
            turnStarted = false;
            setTimeout(nextQuestion, 1000);
        }
        else{
            scoreMultiplier -= scoreReduction;
            optionButton.classList.add('wrong')
            wrongOptions.push(option)

            nextPlayer();
        }
    }

    function handlePlayerInput(event) {
        if(isGameOver)
            newGame()

        if(!turnStarted)
            return

        const playerKey = event.key;
        if (['1', '2', '3', '4'].includes(playerKey)) {
            handlePlayerSelection(parseInt(playerKey))  

        } else if (ALPHABET.includes(playerKey.toUpperCase())) {
            handlePlayerOption(playerKey.toUpperCase())
            
        }else if(playerKey === "ArrowRight"){
            nextQuestion()
            turnStarted = false;
        }
    }
    

    function parseCSV(data) {
        const lines = data.split('\n');
        const result = [];
        lines.forEach(line => {
            const splitLine = line.split(',');
            const hasImage = splitLine[splitLine.length-1].length > 1
            const imgDisplacement = hasImage?2:1;
            result.push({ question: splitLine[0], 
                          options: splitLine.slice(1,splitLine.length-imgDisplacement), 
                          answer:splitLine[splitLine.length-imgDisplacement], 
                          image:hasImage?(splitLine[splitLine.length-1]==""?null:splitLine[splitLine.length-1]):null
                        });
        });
        return result;
    }

    function fromHTML(html, trim = true) {
        html = trim ? html.trim() : html;
        if (!html) return null;
    
        const template = document.createElement('template');
        template.innerHTML = html;
        const result = template.content.children;
      
        if (result.length === 1) return result[0];
        return result;
      }

    function createOption(index, option){
        option = fromHTML(
            `<button id="option-${ALPHABET[index]}">
                <a class="button-option-letter">${ALPHABET[index]}</a>
                <a class="button-option-text">${option}</a>
            </button>`
        );

        option.onclick = () => handlePlayerOption(ALPHABET[index]);
        return option;
    }

    function resetTurn(){
        scoreMultiplier = 1;
        currentPlayer = null;
        playerQueue = [];
        roundBlocked = [];
        wrongOptions = []
        clearTurn()

        for(let i = 0; i < playerScores.length; i++){
            document.querySelector(`#player${i+1} .score`).innerHTML = playerScores[i];
        }
    }

    function nextQuestionFinish(){
        document.getElementById('question-container').style.display = "flex";
        document.getElementById('center-display').style.display = "none";

        questionIndex = Math.floor(Math.random() * questions.length);
        currentQuestion = questions.splice(questionIndex, 1)[0];

        if(currentQuestion.image){
            document.getElementById("question-img").src = `${currentQuestion.image.includes("http")?"":"images/"}${currentQuestion.image}`
            document.getElementById('question-img').style.display = "block";
        }
            
        document.getElementById('question').innerHTML = currentQuestion.question.replace(/\\n/g, '<br>');

        const optionsDiv = document.getElementById('options');
        optionsDiv.innerHTML = '';
        
        currentQuestion.options.forEach((option, index) => {
            optionsDiv.appendChild(createOption(index, option));
        });
        turnStarted = true;
    }

    function gameOver(){

        setTimeout(() => {isGameOver = true; }, 2000);

        document.getElementById('game-over').style.display = "block";
        document.getElementById('question-container').style.display = "none";
        document.getElementById('scoreboard').style.display = "none";
        players = playerScores.map((v, i)=>{
            return {"score":v, "name":playerNames[i], "color":playerColors[i]}
        })
        
        players.sort((p1,p2)=>p2.score - p1.score)

        document.getElementById('first-place-score').innerHTML = players[0].score
        document.getElementById('first-place').innerHTML = players[0].name
        
        document.getElementById('second-place-score').innerHTML = players[1].score
        document.getElementById('second-place').innerHTML = players[1].name
        document.querySelector('.second').style.height = `${30*((players[1].score+1)/(players[0].score+1))}vh`

        document.getElementById('third-place-score').innerHTML = players[2].score
        document.getElementById('third-place').innerHTML = players[2].name
        document.querySelector('.third').style.height = `${30*((players[2].score+1)/(players[0].score+1))}vh`

        document.getElementById('fourth-place-score').innerHTML = players[3].score
        document.getElementById('fourth-place-name').innerHTML = players[3].name
        
        document.getElementById('play-again').onclick = ()=>{
            document.getElementById("main-menu").style.display = "block";
            document.getElementById('game-over').style.display = "none";
        }
    }

    function nextQuestion() {
        
        resetTurn();

        if (roundCount >= gameDuration) {
            gameOver()
            return;
        }

        roundCount++;

        document.getElementById('question-container').style.display = "none";
        document.getElementById('center-display').style.display = "flex";

        setTimeout(()=>countDownDisplay("center-display", 3, 1000, nextQuestionFinish, false), 250)
    }
});
