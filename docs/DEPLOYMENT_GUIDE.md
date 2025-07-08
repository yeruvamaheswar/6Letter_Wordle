# 🚀 GitHub Deployment Guide

## Step-by-Step Instructions for Hosting Your 6-Letter Wordle Game

### 📝 Prerequisites
- A GitHub account (free at [github.com](https://github.com))
- Your 6Letter_Wordle folder with all game files

---

## 🔧 Step 1: Create GitHub Repository

1. **Go to GitHub** - Visit [github.com](https://github.com) and sign in
2. **Create New Repository**
   - Click the **"+" button** in top right corner
   - Select **"New repository"**
3. **Repository Settings**
   - **Repository name:** `6letter-wordle` (or any name you prefer)
   - **Description:** "Daily 6-letter word puzzle game"
   - **Visibility:** Choose **"Public"** (required for free GitHub Pages)
   - **✅ Check "Add a README file"**
   - Click **"Create repository"**

---

## 📁 Step 2: Upload Your 6Letter_Wordle Folder

### Method A: Web Interface (Easiest for beginners)

1. **In your new repository**, click **"uploading an existing file"**
2. **Upload the entire 6Letter_Wordle folder** (drag and drop or browse):
   ```
   📁 6Letter_Wordle/
   ├── ✅ index.html
   ├── 📁 css/
   │   └── ✅ style.css
   ├── 📁 js/
   │   ├── ✅ script.js
   │   ├── ✅ daily-word-manager.js
   │   └── ✅ dictionary-api.js
   ├── 📁 admin/
   │   └── ✅ admin-panel.html
   └── 📁 docs/
       ├── ✅ README.md
       └── ✅ DEPLOYMENT_GUIDE.md
   ```
3. **Commit changes**
   - Add commit message: "Add 6-Letter Wordle game files"
   - Click **"Commit changes"**

### Method B: Git Commands (If you have Git installed)

```bash
# Clone your repository
git clone https://github.com/[YOUR-USERNAME]/6letter-wordle.git

# Navigate to the folder
cd 6letter-wordle

# Copy your entire 6Letter_Wordle folder here
# Your structure should be:
# 6letter-wordle/
# └── 6Letter_Wordle/
#     ├── index.html
#     ├── admin-panel.html
#     └── ... (all other files)

# Add files to Git
git add .

# Commit changes
git commit -m "Add 6-Letter Wordle game files"

# Push to GitHub
git push origin main
```

---

## 🌐 Step 3: Enable GitHub Pages

1. **Go to Repository Settings**
   - In your repository, click **"Settings"** tab
2. **Find Pages Section**
   - Scroll down to **"Pages"** in left sidebar
3. **Configure Source**
   - **Source:** Select **"Deploy from a branch"**
   - **Branch:** Select **"main"** (or "master")
   - **Folder:** Select **"/ (root)"**
4. **Save**
   - Click **"Save"**
   - GitHub will show: *"Your site is published at https://[YOUR-USERNAME].github.io/6letter-wordle/"*

---

## ✅ Step 4: Test Your Game

1. **Wait 2-5 minutes** for deployment to complete
2. **Visit your game URL:**
   ```
   https://[YOUR-USERNAME].github.io/6letter-wordle/6Letter_Wordle/
   ```
3. **Test features:**
   - ✅ Game loads correctly
   - ✅ Can make guesses
   - ✅ Daily word system works
   - ✅ Admin panel accessible at: `https://[YOUR-USERNAME].github.io/6letter-wordle/6Letter_Wordle/admin/admin-panel.html`

---

## 🔐 Step 5: Set Up Admin Access

1. **Visit Admin Panel** - `https://[YOUR-USERNAME].github.io/6letter-wordle/6Letter_Wordle/admin/admin-panel.html`
2. **Login with default password:** `admin123`
3. **Set today's word** - Choose a 6-letter word for today
4. **Optional: Change password**
   - Edit `daily-word-manager.js` in your repository
   - Find: `this.defaultPassword = 'admin123';`
   - Change to: `this.defaultPassword = 'your-new-password';`
   - Commit the change

---

## 📱 Step 6: Share with Friends

**Share these URLs with your friends:**

🎮 **Game URL:** `https://[YOUR-USERNAME].github.io/6letter-wordle/6Letter_Wordle/`

📊 **Features to tell them:**
- New word every day at midnight
- Can only play once per day
- Share results with emoji grid
- Works on phones and computers

---

## 🔄 Step 7: Managing Daily Words

### Via Admin Panel (Recommended)
1. Visit admin panel daily
2. Set new words for upcoming dates
3. Use "Generate Random Word" for quick setup

### Via GitHub (Advanced)
1. Edit `6Letter_Wordle/daily-word-manager.js` in your repository
2. Modify the word list in `generateInitialWords()`
3. Commit changes

---

## 🛠️ Troubleshooting

### ❌ Game doesn't load
- Check all files are uploaded inside the 6Letter_Wordle folder
- Verify GitHub Pages is enabled
- Wait 5-10 minutes after enabling Pages

### ❌ "Not Found" error
- Ensure repository is **public**
- Check the URL format includes the folder: `https://[USERNAME].github.io/[REPO-NAME]/6Letter_Wordle/`
- Verify `index.html` is inside the 6Letter_Wordle folder

### ❌ Admin panel won't login
- Default password is `admin123`
- Check browser console for errors
- Try refreshing the page

### ❌ Friends can't access
- Ensure repository is **public**
- Share the exact GitHub Pages URL with `/6Letter_Wordle/` at the end
- Test the URL in an incognito browser

---

## 🎉 You're Done!

Your 6-Letter Wordle game is now live and ready for your friends to play!

**Your URLs:**
- **Game:** `https://[YOUR-USERNAME].github.io/6letter-wordle/6Letter_Wordle/`
- **Admin:** `https://[YOUR-USERNAME].github.io/6letter-wordle/6Letter_Wordle/admin/admin-panel.html`

**Next Steps:**
1. Set daily words via admin panel
2. Share the game URL with friends
3. Check back daily to set new words
4. Watch your friends' shared results!

---

*Need help? Check the repository's Issues section or contact Uma Yeruva.*