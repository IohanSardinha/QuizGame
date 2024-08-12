document.addEventListener('DOMContentLoaded', () => {
    let ALPHABET = Array.from({ length: 26 }, (v, i) => String.fromCharCode(65 + i));
    let questions = [];
    let currentQuestion = null;

    let playerScores = [0,0,0,0];
    let playerQueue = [];
    let roundBlocked = []
    let currentPlayer = null;
    let scoreMultiplier = 1;
    let scoreReduction = 0.75;
    let questionScore = 100;
    let wrongOptions = []

    let playerNames = ["Player 1", "Player 2", "Player 3", "Player 4"]
    let playerColors = ["#ff9999","#99ff99","#9999ff","#ffff99"]

    fetch('questions.csv')
        .then(response => response.text())
        .then(data => {
            questions = parseCSV(data);
            document.addEventListener('keydown', handlePlayerInput);
            nextQuestion();
        });

    function handlePlayerSelection(player){
        if(!roundBlocked.includes(player)){
            playerQueue.push(player);
            roundBlocked.push(player)

            if(currentPlayer == null){
                currentPlayer = playerQueue.splice(0,1);
                document.getElementById("player-turn").innerHTML = `${playerNames[player-1]}'s turn!`;
                document.getElementById("background").style.backgroundColor = playerColors[player-1];
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
            scoreMultiplier *= scoreReduction;
            optionButton.classList.add('wrong')
            wrongOptions.push(option)

            if(playerQueue.length == 0 && roundBlocked.length == playerNames.length){
                document.getElementById("player-turn").innerHTML = ""
                document.getElementById("background").style.backgroundColor = "#f0f0f0"
                
                document.getElementById(`option-${currentQuestion.answer}`).classList.add('correct')
                
                setTimeout(nextQuestion, 1500);
            }
            else if(playerQueue.length > 0){
                currentPlayer = playerQueue.splice(0,1);
                document.getElementById("player-turn").innerHTML = `${playerNames[currentPlayer-1]}'s turn!`
                document.getElementById("background").style.backgroundColor = playerColors[currentPlayer-1];
            }else{
                currentPlayer = null;
                document.getElementById("player-turn").innerHTML = ""
                document.getElementById("background").style.backgroundColor = "#f0f0f0"
            }
        }
    }

    function handlePlayerInput(event) {
        const playerKey = event.key;
        if (['1', '2', '3', '4'].includes(playerKey)) {
            handlePlayerSelection(parseInt(playerKey))  

        } else if (ALPHABET.includes(playerKey.toUpperCase())) {
            handlePlayerOption(playerKey.toUpperCase())
            
        }
        console.log(playerQueue)
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
        currentPlayer = null;
        playerQueue = [];
        roundBlocked = [];
        wrongOptions = []
        document.getElementById("player-turn").innerHTML = "";
        document.getElementById("background").style.backgroundColor = "#f0f0f0"

        for(let i = 0; i < playerScores.length; i++){
            document.querySelector(`#player${i+1} .score`).innerHTML = playerScores[i];
        }
    }

    function nextQuestion() {
        resetTurn();

        if (questions.length === 0) {
            document.getElementById('question-container').innerHTML = '<h2>Quiz Over!</h2>';
            return;
        }

        questionIndex = Math.floor(Math.random() * questions.length);
        currentQuestion = questions.splice(questionIndex, 1)[0];
        
        document.getElementById('question').innerHTML = currentQuestion.question.replace(/\\n/g, '<br>');

        const optionsDiv = document.getElementById('options');
        optionsDiv.innerHTML = '';
        
        currentQuestion.options.forEach((option, index) => {
            optionsDiv.appendChild(createOption(index, option));
        });
    }
});
