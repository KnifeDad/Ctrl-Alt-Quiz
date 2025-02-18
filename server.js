const express = require('express');  // Add this line at the top
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const cors = require('cors');

if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set in environment variables');
    process.exit(1);
}

const app = express();
const port = process.env.PORT || 3001;

// Add this near the top, after other requires
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

// Apply to all routes
app.use(limiter);

// Add JSON parsing middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Add this after express initialization
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGIN 
        : 'http://localhost:3000'
}));

// Initialize OpenAI with simpler configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    maxRetries: 3,
    timeout: 30 * 1000 // 30 seconds
});

// Update the explanation endpoint
app.post('/api/explain', async (req, res) => {
    const { question, answer, isCorrect, correctAnswer } = req.body;
    
    // Add input validation
    if (!question || !answer || typeof isCorrect !== 'boolean') {
        return res.status(400).json({ 
            error: 'Missing required fields',
            explanation: 'Invalid request parameters'
        });
    }
    
    try {
        const prompt = `Question: "${question}"\n${isCorrect ? 'Correct' : 'Incorrect'} answer: "${answer}"\n${!isCorrect ? `The correct answer was: "${correctAnswer}"\n` : ''}\nPlease explain why this answer is ${isCorrect ? 'correct' : 'incorrect'} and provide additional context about the topic.`;
        
        console.log('Starting OpenAI request...');
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful programming tutor providing clear, concise explanations for quiz answers in a steampunk theme. Use mechanical and Victorian-era metaphors when possible."
                },
                { 
                    role: "user", 
                    content: prompt 
                }
            ],
            temperature: 0.7,
            max_tokens: 150
        });

        console.log('Response received:', completion.choices[0]?.message?.content);

        if (!completion.choices[0]?.message?.content) {
            throw new Error('No explanation received from OpenAI');
        }

        res.json({ explanation: completion.choices[0].message.content });
    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(error.status || 500).json({ 
            explanation: `${isCorrect ? 'Correct!' : 'Incorrect. The correct answer is: ' + correctAnswer}`,
            error: {
                message: error.message,
                type: error.type || 'UnknownError',
                code: error.code || 'INTERNAL_ERROR'
            }
        });
    }
});

const quizData = {
    questions: [
        {
            question: 'What is JavaScript?',
            options: ['A programming language', 'A coffee brand', 'A type of car', 'A book genre'],
            correctAnswer: 'A programming language'
        },
                {
                    question: 'What does HTML stand for?',
                    options: ['HyperText Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyper Text Multiple Language'],
                    correctAnswer: 'HyperText Markup Language'
                },
                {
                    question: 'What is CSS used for?',
                    options: ['Styling web pages', 'Creating databases', 'Writing server code', 'Managing files'],
                    correctAnswer: 'Styling web pages'
                },
                {
                    question: 'Which is not a JavaScript data type?',
                    options: ['Float', 'String', 'Boolean', 'Number'],
                    correctAnswer: 'Float'
                },
                {
                    question: 'What symbol is used for single-line comments in JavaScript?',
                    options: ['//', '/*', '#', '--'],
                    correctAnswer: '//'
                },
                {
                    question: 'What does DOM stand for?',
                    options: ['Document Object Model', 'Data Object Model', 'Document Oriented Model', 'Digital Object Model'],
                    correctAnswer: 'Document Object Model'
                },
                {
                    question: 'Which method adds an element to the end of an array?',
                    options: ['push()', 'pop()', 'shift()', 'unshift()'],
                    correctAnswer: 'push()'
                },
                {
                    question: 'What is the correct way to write a JavaScript array?',
                    options: ['["apple", "banana"]', '{apple, banana}', '(apple, banana)', '<apple, banana>'],
                    correctAnswer: '["apple", "banana"]'
                },
                {
                    question: 'Which operator is used for strict equality?',
                    options: ['===', '==', '=', '!='],
                    correctAnswer: '==='
                },
                {
                    question: 'What is Node.js?',
                    options: ['A JavaScript runtime', 'A programming language', 'A database', 'A web browser'],
                    correctAnswer: 'A JavaScript runtime'
                },
                {
                    question: 'What does API stand for?',
                    options: ['Application Programming Interface', 'Application Program Input', 'Advanced Programming Interface', 'Advanced Program Input'],
                    correctAnswer: 'Application Programming Interface'
                },
                {
                    question: 'What is JSON?',
                    options: ['JavaScript Object Notation', 'JavaScript Object Numbers', 'JavaScript Option Network', 'Java Standard Object Notation'],
                    correctAnswer: 'JavaScript Object Notation'
                },
                {
                    question: 'Which symbol is used for template literals?',
                    options: ['Backtick (`)', 'Single quote (\')', 'Double quote (")', 'Hash (#)'],
                    correctAnswer: 'Backtick (`)'
                },
                {
                    question: 'What is the purpose of the return statement?',
                    options: ['To output a value from the function', 'To print to the console', 'To end the program', 'To start a new line'],
                    correctAnswer: 'To output a value from the function'
                },
                {
                    question: 'What is a callback function?',
                    options: ['A function passed as an argument', 'A function that calls itself', 'The main function', 'A function that returns nothing'],
                    correctAnswer: 'A function passed as an argument'
                },
                {
                    question: 'What is the purpose of npm?',
                    options: ['Package manager for Node.js', 'A JavaScript framework', 'A testing tool', 'A web browser'],
                    correctAnswer: 'Package manager for Node.js'
                },
                {
                    question: 'What does SQL stand for?',
                    options: ['Structured Query Language', 'Simple Question Language', 'Structured Question List', 'System Query Language'],
                    correctAnswer: 'Structured Query Language'
                },
                {
                    question: 'What is React?',
                    options: ['A JavaScript library for UI', 'A database system', 'A programming language', 'An operating system'],
                    correctAnswer: 'A JavaScript library for UI'
                },
                {
                    question: 'What is Git?',
                    options: ['Version control system', 'Programming language', 'Database system', 'Web browser'],
                    correctAnswer: 'Version control system'
                },
                {
                    question: 'What is an API endpoint?',
                    options: ['A URL where API can be accessed', 'A programming language', 'A database table', 'A type of variable'],
                    correctAnswer: 'A URL where API can be accessed'
                },
                {
                    question: 'What is the purpose of useState in React?',
                    options: ['Managing component state', 'Styling components', 'Creating routes', 'Making API calls'],
                    correctAnswer: 'Managing component state'
                },
                {
                    question: 'What is a Promise in JavaScript?',
                    options: ['An object representing future completion of an operation', 'A type of function', 'A variable declaration', 'A loop structure'],
                    correctAnswer: 'An object representing future completion of an operation'
                },
                {
                    question: 'What is the purpose of async/await?',
                    options: ['Handle asynchronous operations', 'Create variables', 'Style web pages', 'Define functions'],
                    correctAnswer: 'Handle asynchronous operations'
                },
                {
                    question: 'What is MongoDB?',
                    options: ['A NoSQL database', 'A programming language', 'A web framework', 'A testing tool'],
                    correctAnswer: 'A NoSQL database'
                },
                {
                    question: 'What is JWT?',
                    options: ['JSON Web Token', 'JavaScript Web Tool', 'Java Web Template', 'JSON Web Template'],
                    correctAnswer: 'JSON Web Token'
                },
                {
                    question: 'What is the purpose of middleware?',
                    options: ['Process requests before handlers', 'Style web pages', 'Create databases', 'Write HTML'],
                    correctAnswer: 'Process requests before handlers'
                },
                {
                    question: 'What is Redux used for?',
                    options: ['State management', 'Database queries', 'Writing HTML', 'Styling components'],
                    correctAnswer: 'State management'
                },
                {
                    question: 'What is TypeScript?',
                    options: ['Typed superset of JavaScript', 'A database system', 'A styling framework', 'A testing tool'],
                    correctAnswer: 'Typed superset of JavaScript'
                },
                {
                    question: 'What is ESLint?',
                    options: ['Code linting tool', 'Database system', 'Programming language', 'Web framework'],
                    correctAnswer: 'Code linting tool'
                },
                {
                    question: 'What is webpack?',
                    options: ['Module bundler', 'Programming language', 'Database system', 'Testing framework'],
                    correctAnswer: 'Module bundler'
                },
                {
                    question: 'What is a REST API?',
                    options: ['Representational State Transfer API', 'React State Transfer', 'Remote State Transfer', 'Reactive State Transfer'],
                    correctAnswer: 'Representational State Transfer API'
                },
                {
                    question: 'What is CORS?',
                    options: ['Cross-Origin Resource Sharing', 'Cross-Origin React Server', 'Component Origin Resource System', 'Component Object Response System'],
                    correctAnswer: 'Cross-Origin Resource Sharing'
                },
                {
                    question: 'What is npm init used for?',
                    options: ['Initialize a new npm project', 'Install packages', 'Update packages', 'Remove packages'],
                    correctAnswer: 'Initialize a new npm project'
                },
                {
                    question: 'What is the purpose of package.json?',
                    options: ['Project metadata and dependencies', 'Writing JavaScript code', 'Styling web pages', 'Database configuration'],
                    correctAnswer: 'Project metadata and dependencies'
                },
                {
                    question: 'What is a closure in JavaScript?',
                    options: ['Function with access to outer scope', 'A way to close programs', 'A type of loop', 'A database connection'],
                    correctAnswer: 'Function with access to outer scope'
                },
                {
                    question: 'What is the purpose of useEffect?',
                    options: ['Handle side effects in React', 'Style components', 'Create routes', 'Define variables'],
                    correctAnswer: 'Handle side effects in React'
                },
                {
                    question: 'What is Express.js?',
                    options: ['Web application framework', 'Database system', 'Programming language', 'Testing tool'],
                    correctAnswer: 'Web application framework'
                },
                {
                    question: 'What is a RESTful API?',
                    options: ['API following REST principles', 'A testing framework', 'A database system', 'A programming language'],
                    correctAnswer: 'API following REST principles'
                },
                {
                    question: 'What is npm run build used for?',
                    options: ['Create production build', 'Install dependencies', 'Start development server', 'Run tests'],
                    correctAnswer: 'Create production build'
                },
                {
                    question: 'What is the purpose of .gitignore?',
                    options: ['Specify files Git should ignore', 'Write Git commands', 'Configure Git settings', 'Track Git changes'],
                    correctAnswer: 'Specify files Git should ignore'
                },
                {
                    question: 'What is a React component?',
                    options: ['Reusable UI piece', 'Database table', 'Styling rule', 'JavaScript variable'],
                    correctAnswer: 'Reusable UI piece'
                },
                {
                    question: 'What is Node.js built on?',
                    options: ['V8 JavaScript engine', 'Java Virtual Machine', 'Python interpreter', 'Ruby runtime'],
                    correctAnswer: 'V8 JavaScript engine'
                },
                {
                    question: 'What is the purpose of props in React?',
                    options: ['Pass data between components', 'Style components', 'Create routes', 'Handle events'],
                    correctAnswer: 'Pass data between components'
                },
                {
                    question: 'What is a JavaScript event loop?',
                    options: ['Handles async operations', 'Creates variables', 'Defines functions', 'Styles pages'],
                    correctAnswer: 'Handles async operations'
                },
                {
                    question: 'What is npm install --save-dev used for?',
                    options: ['Install development dependencies', 'Install production dependencies', 'Update packages', 'Remove packages'],
                    correctAnswer: 'Install development dependencies'
                },
                {
                    question: 'What is the purpose of babel?',
                    options: ['JavaScript compiler', 'Package manager', 'Testing framework', 'Styling tool'],
                    correctAnswer: 'JavaScript compiler'
                },
                {
                    question: 'What is a JavaScript Map?',
                    options: ['Key-value pair collection', 'Geographic map', 'Function type', 'Loop structure'],
                    correctAnswer: 'Key-value pair collection'
                },
                {
                    question: 'What is the purpose of Docker?',
                    options: ['Container platform', 'Programming language', 'Database system', 'Testing framework'],
                    correctAnswer: 'Container platform'
                },
                {
                    question: 'What is a JavaScript Set?',
                    options: ['Unique value collection', 'Function type', 'Variable declaration', 'Loop structure'],
                    correctAnswer: 'Unique value collection'
                },
                {
                    question: 'What is the purpose of npm audit?',
                    options: ['Check security vulnerabilities', 'Install packages', 'Update packages', 'Remove packages'],
                    correctAnswer: 'Check security vulnerabilities'
                },
                {
                    question: 'What is GraphQL?',
                    options: ['Query language for APIs', 'Database system', 'Programming language', 'Testing framework'],
                    correctAnswer: 'Query language for APIs'
                },
                {
                    question: 'What is the purpose of localStorage?',
                    options: ['Store data in browser', 'Run server code', 'Style components', 'Handle routing'],
                    correctAnswer: 'Store data in browser'
                },
                {
                    question: 'What is a JavaScript Promise.all()?',
                    options: ['Handle multiple promises', 'Create variables', 'Define functions', 'Style pages'],
                    correctAnswer: 'Handle multiple promises'
                }
    ]
};

// API endpoint for quiz data
app.get('/api/quiz', (req, res) => {
    // Shuffle the questions array and get 10 questions
    const shuffledQuestions = [...quizData.questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
    
    // For each question, shuffle the options
    const randomizedQuestions = shuffledQuestions.map(q => ({
        ...q,
        options: [...q.options].sort(() => Math.random() - 0.5)
    }));

    res.json({ questions: randomizedQuestions });
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});