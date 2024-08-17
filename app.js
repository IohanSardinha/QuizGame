document.addEventListener('DOMContentLoaded', () => {
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

    fetch('questions.csv')
        .then(response => response.text())
        .then(data => {
            questions = parseCSV(data);
            document.addEventListener('keydown', handlePlayerInput);
            nextQuestion();
        });

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
        document.getElementById("player-turn-display").innerHTML = `${playerNames[player-1]}'s turn!`;
        document.getElementById("background").style.backgroundColor = playerColors[player-1];
        countDownDisplay("player-turn-counter", playerTimeToAnswer, 1000, nextPlayer, currentPlayer)
    }

    function clearTurn(){
        document.getElementById("player-turn-display").innerHTML = ""
        document.getElementById("player-turn-counter").innerHTML = ""
        document.getElementById("background").style.backgroundColor = "#f0f0f0"
        document.getElementById("next-player").innerHTML = ""
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
                document.getElementById("next-player").innerHTML = `Next: ${playerNames[playerQueue[0]-1]}`
            }
        }
    }

    function nextPlayer(){
        if((playerQueue.length == 0 && roundBlocked.length == playerNames.length) || (wrongOptions.length == currentQuestion.options.length - 1)){
            clearTurn()
            
            document.getElementById(`option-${currentQuestion.answer}`).classList.add('correct')
            
            setTimeout(nextQuestion, 1500);
        }
        else{
            if(playerQueue.length > 0){
                currentPlayer = playerQueue.splice(0,1);
                setPlayerTurn(currentPlayer)
                if(playerQueue.length > 0)
                    document.getElementById("next-player").innerHTML = `Next: ${playerNames[playerQueue[0]-1]}`
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
        
        console.log(questionScore, scoreMultiplier)

        const playerKey = event.key;
        if (['1', '2', '3', '4'].includes(playerKey)) {
            handlePlayerSelection(parseInt(playerKey))  

        } else if (ALPHABET.includes(playerKey.toUpperCase())) {
            handlePlayerOption(playerKey.toUpperCase())
            
        }else if(playerKey === "ArrowRight"){
            nextQuestion()
        }
    }
    

    function parseCSV(data) {
        const lines = data.split('\n');
        const result = [];
        lines.forEach(line => {
            const splitLine = line.split(',');
            result.push({ question: splitLine[0], options: splitLine.slice(1,splitLine.length-1), answer:splitLine[splitLine.length-1] });
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
        
        document.getElementById('play-again').onclick = newGame
    }

    function newGame(){
        playerScores = [0,0,0,0]
        roundCount = 0
        document.getElementById('game-over').style.display = "none";
        document.getElementById('scoreboard').style.display = "block";

        isGameOver = false;

        nextQuestion()
    }

    function nextQuestion() {
        turnStarted = false;
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
