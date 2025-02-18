let currentQuestionIndex = 0;
let score = 0;
let questions = [];

async function fetchQuizData() {
    try {
        const response = await fetch('/api/quiz');
        const data = await response.json();
        questions = data.questions;
        displayQuestion();
    } catch (error) {
        console.error('Error fetching quiz data:', error);
    }
}

function displayQuestion() {
    const question = questions[currentQuestionIndex];
    document.getElementById("question").innerText = question.question;

    const buttons = document.querySelectorAll(".answer-btn");
    buttons.forEach((button, index) => {
        if (index < question.options.length) {
            button.innerText = question.options[index];
            button.style.display = "block";
            button.onclick = function () {
                checkAnswer(button.innerText);
            };
        } else {
            button.style.display = "none";
        }
    });
}

async function getExplanation(answer, isCorrect) {
    try {
        const response = await fetch('/api/explain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: questions[currentQuestionIndex].question,
                answer: answer,
                isCorrect: isCorrect
            })
        });
        
        const data = await response.json();
        return data.explanation;
    } catch (error) {
        console.error('Error getting explanation:', error);
        return 'Sorry, could not get an explanation at this time.';
    }
}

async function checkAnswer(answer) {
    const correctAnswer = questions[currentQuestionIndex].correctAnswer;
    const isCorrect = answer === correctAnswer;
    
    if (isCorrect) {
        score++;
        document.getElementById("score").innerText = score;
    }
    
    try {
        // Get explanation from ChatGPT
        const response = await fetch('/api/explain', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: questions[currentQuestionIndex].question,
                answer: answer,
                isCorrect: isCorrect,
                correctAnswer: correctAnswer
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to get explanation');
        }

        const data = await response.json();
        
        // Show result and explanation
        const explanation = data.explanation || 'No explanation available';
        const message = isCorrect ? 
            `Correct! 🎉\n\n${explanation}` :
            `Incorrect. The correct answer was: ${correctAnswer}\n\n${explanation}`;
        
        // Display the explanation
        const explanationDiv = document.getElementById("explanation");
        explanationDiv.style.display = "block";
        explanationDiv.innerHTML = `<div class="explanation-text">${message.replace(/\n/g, '<br>')}</div>`;
        
    } catch (error) {
        console.error('Error getting explanation:', error);
        const message = isCorrect ? 
            'Correct! 🎉' :
            `Incorrect. The correct answer was: ${correctAnswer}`;
        alert(message);
    }

    document.getElementById("next-btn").style.display = "block";
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        displayQuestion();
        document.getElementById("next-btn").style.display = "none";
    } else {
        const playAgain = confirm(`Quiz complete! Your final score is: ${score}/${questions.length}\nWould you like to play again?`);
        if (playAgain) {
            currentQuestionIndex = 0;
            score = 0;
            document.getElementById("score").innerText = "0";
            displayQuestion();
        }
    }
}

window.onload = fetchQuizData; 