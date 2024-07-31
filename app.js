document.addEventListener('DOMContentLoaded', () => {
    let questions = [];
    let score = 0;

    fetch('questions.csv')
        .then(response => response.text())
        .then(data => {
            questions = parseCSV(data);
            nextQuestion();
        });

    function parseCSV(data) {
        const lines = data.split('\n').filter(line => line.trim() !== '');
        const result = [];
        lines.forEach(line => {
            const [question, optionA, optionB, optionC, optionD, optionE, answer] = line.split(',');
            result.push({ question, options: [optionA, optionB, optionC, optionD, optionE], answer: answer.trim() });
        });
        return result;
    }

    function nextQuestion() {
        if (questions.length === 0) {
            document.getElementById('question-container').innerHTML = '<h2>Quiz Over!</h2>';
            return;
        }

        const currentQuestionIndex = Math.floor(Math.random() * questions.length);
        const currentQuestion = questions.splice(currentQuestionIndex, 1)[0];
        
        document.getElementById('question').innerHTML = currentQuestion.question.replace(/\\n/g, '<br>');
        const optionsDiv = document.getElementById('options');
        optionsDiv.innerHTML = '';
        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.innerHTML = option;
            button.onclick = () => checkAnswer(index, currentQuestion.answer);
            optionsDiv.appendChild(button);
        });
    }

    function checkAnswer(selectedIndex, correctAnswer) {
        const correctIndex = correctAnswer.charCodeAt(0) - 65; // 'A' is 65 in ASCII
        const buttons = document.querySelectorAll('#options button');
        buttons.forEach((button, index) => {
            if (index === correctIndex) {
                button.classList.add('correct');
            } else {
                button.classList.add('wrong');
            }
            button.disabled = true;
        });
        if (selectedIndex === correctIndex) {
            score++;
            document.getElementById('score').innerText = `Score: ${score}`;
        }
        setTimeout(nextQuestion, 1000);
    }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log('Service Worker Registered'))
    .catch(error => console.log('Service Worker Registration Failed:', error));
}
