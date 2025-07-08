# 6-Letter Wordle

A daily word puzzle game where players guess a 6-letter word with limited attempts.

## 🎮 Play Online

**Game URL:** `https://[your-github-username].github.io/6letter-wordle/`

**Admin Panel:** `https://[your-github-username].github.io/6letter-wordle/admin-panel.html`

## 🎯 Features

- **Daily Word Challenge** - New 6-letter word every day
- **One Game Per Day** - Prevents multiple attempts
- **Social Sharing** - Share your results with friends
- **Admin Panel** - Set daily words and manage the game
- **Progress Tracking** - Saves your daily game history
- **Mobile Friendly** - Works great on phones and tablets

## 🔐 Admin Access

- **Default Password:** `admin123`
- **Session Duration:** 1 hour
- **Features:**
  - Set daily words for any date
  - Generate random words
  - View upcoming word schedule
  - Monitor game statistics

## 📱 How to Play

1. **Visit the game URL** - One word per day for everyone
2. **Guess the 6-letter word** - You have 6 attempts
3. **Color feedback:**
   - 🟩 **Green** - Correct letter in correct position
   - 🟨 **Yellow** - Correct letter in wrong position
   - ⬛ **Gray** - Letter not in the word
4. **Share your results** - Copy emoji grid to share with friends

## 🚀 For Developers

### Local Development
```bash
# Clone the repository
git clone https://github.com/[your-username]/6letter-wordle.git

# Open index.html in your browser
# Or serve with a local server:
python -m http.server 8000
```

### File Structure
```
├── index.html              # Main game interface
├── admin-panel.html        # Admin word management
├── style.css              # Game styling
├── script.js              # Main game logic
├── daily-word-manager.js   # Daily word system
├── dictionary-api.js      # Word validation API
└── README.md              # This file
```

### Technologies Used
- **Vanilla JavaScript** - No frameworks required
- **Local Storage** - Saves game state and daily words
- **Free Dictionary API** - Word validation (dictionaryapi.dev)
- **CSS Grid/Flexbox** - Responsive layout

## 📊 Game Statistics

The game tracks:
- Daily completion status
- Number of attempts
- Win/loss record
- Completion time
- Guess patterns for sharing

## 🔧 Customization

### Change Admin Password
Edit `daily-word-manager.js`:
```javascript
this.defaultPassword = 'your-new-password';
```

### Add More Words
Use the admin panel or edit the word list in `daily-word-manager.js`

### Styling
Modify `style.css` to change colors, fonts, and layout

## 🌐 Deployment

This game is designed for **GitHub Pages** hosting:

1. Create a GitHub repository
2. Upload all files to the repository
3. Enable GitHub Pages in repository settings
4. Share the generated URL with friends

## 🤝 Contributing

Feel free to fork this project and submit pull requests for improvements!

## 📄 License

This project is open source and available under the MIT License.

---

**Created by Uma Yeruva** - A daily word challenge for friends and family!