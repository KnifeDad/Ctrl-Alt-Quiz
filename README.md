# Ctrl+Alt+Quiz 🎯⚙️

A steampunk-themed programming quiz application that tests your knowledge of various programming concepts while providing detailed, Victorian-era-styled explanations powered by OpenAI's GPT-3.5.

## 🚂 Features

- Interactive steampunk-themed user interface
- Randomized programming questions
- Real-time feedback and explanations
- Score tracking
- Responsive design
- Rate-limited API endpoints
- AI-powered explanations with steampunk flair

## 🛠️ Technologies Used

- **Frontend:**
  - HTML5
  - CSS3 (with steampunk styling)
  - Vanilla JavaScript
  - Custom gear animations
  - Google Fonts (Special Elite, Orbitron)

- **Backend:**
  - Node.js
  - Express.js
  - OpenAI GPT-3.5 API
  - CORS
  - Rate Limiting

## 🔧 Installation

1. Clone the repository
2. Install dependencies
 - npm install
3. Create a `.env` file in the root directory
 - OPENAI_API_KEY=your_openai_api_key_here
4. Start the server
 - npm start
5. Visit `http://localhost:3001` in your browser

## 💡 Usage

- Start the quiz by visiting the homepage
- Select your answer from the brass-plated options
- Receive immediate feedback with steampunk-themed explanations
- Track your score as you progress
- Complete all questions to see your final score
- Restart the quiz to try again

## 🎨 Design Features

- Brass and copper color scheme
- Animated gear decorations
- Victorian-era typography
- Custom steampunk buttons
- Riveted brass plates
- Textured backgrounds
- Responsive layout

## 🔐 API Endpoints

### GET `/api/quiz`
- Returns a randomized set of programming questions
- Rate limited to prevent abuse

### POST `/api/explain`
- Accepts question and answer data
- Returns AI-generated steampunk-themed explanations
- Requires authentication via API key

## 🛡️ Security Features

- Environment variable protection
- Rate limiting
- CORS protection
- Input validation
- Error handling

## 🔄 Future Improvements

- [ ] Add user authentication
- [ ] Implement difficulty levels
- [ ] Add more question categories
- [ ] Create a leaderboard system
- [ ] Add sound effects
- [ ] Implement progressive web app features

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚙️ Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🎩 Acknowledgments

- OpenAI for providing the GPT-3.5 API
- Various programming resources for quiz content

---

<p align="center">Created with ⚙️ by KnifeDad</p>