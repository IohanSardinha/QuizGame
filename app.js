document.addEventListener('DOMContentLoaded', () => {
    let questions = [];
    let score = 0;
    let playerQueue = [];
    let ALPHABET = Array.from({ length: 26 }, (v, i) => String.fromCharCode(65 + i));

    fetch('questions.csv')
        .then(response => response.text())
        .then(data => {
            questions = parseCSV(data);
            document.addEventListener('keydown', handlePlayerInput);
            nextQuestion();
        });

    function handlePlayerInput(event) {
        const playerKey = event.key;
        if (['1', '2', '3', '4'].includes(playerKey)) {
            if(!playerQueue.includes(parseInt(playerKey))){
                playerQueue.push(parseInt(playerKey));
            }
            
        } else if (ALPHABET.includes(playerKey.toUpperCase())) {
            console.log(playerKey.toUpperCase())
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

    function createOption(index, option, question){
        option = fromHTML(
            `<button>
                <a class="button-option-letter">${ALPHABET[index]}</a>
                <a class="button-option-text">${option}</a>
            </button>`
        );

        option.onclick = () => checkAnswer(option, question.answer);

        return option;
    }

    function nextQuestion() {
        if (questions.length === 0) {
            document.getElementById('question-container').innerHTML = '<h2>Quiz Over!</h2>';
            return;
        }

        questionIndex = Math.floor(Math.random() * questions.length);
        const questionObject = questions.splice(questionIndex, 1)[0];
        
        document.getElementById('question').innerHTML = questionObject.question.replace(/\\n/g, '<br>');

        const optionsDiv = document.getElementById('options');
        optionsDiv.innerHTML = '';
        
        questionObject.options.forEach((option, index) => {
            optionsDiv.appendChild(createOption(index,option, questionObject));
        });
    }

    function checkAnswer(selectedOption, correctAnswer) {
        const buttons = document.querySelectorAll('#options button');
        buttons.forEach((button, i) => {
            if (ALPHABET[i] === correctAnswer) {
                button.classList.add('correct');
            } else {
                button.classList.add('wrong');
            }
            button.disabled = true;
        });
        if (selectedOption === correctAnswer) {
            score++;
        }
        document.getElementById('score').innerText = `Score: ${score}`;
        setTimeout(nextQuestion, 1000);
    }
});
