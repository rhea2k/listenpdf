# Deployment Instructions

## Quick Deploy to GitHub Pages (Free)

### 1. Create a GitHub account (use anonymous email)
- Use ProtonMail, Tutanota, or any privacy-focused email.
- Do not use your real name if you desire anonymity.

### 2. Create a new repository
- Name: `listenpdf` (or any name)
- Visibility: Public (so GitHub Pages works)
- Do NOT initialize with README, .gitignore, or license.

### 3. Push the code
```bash
# In the listenpdf directory (where this file is)
# If git not initialized yet:
git init
git add -A
git commit -m "Initial commit"

# Add remote (replace USER with your GitHub username)
git remote add origin https://github.com/USER/listenpdf.git

# Push
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages
- Go to repo Settings → Pages
- Source: Deploy from a branch
- Branch: `main`, folder: `/ (root)`
- Save
- After a minute, your site will be at: `https://USER.github.io/listenpdf/`

## Customize Crypto Addresses (Optional)

Edit `app.js` and update:

```javascript
const CONFIG = {
  cryptoAddresses: {
    btc: 'YOUR_BTC_ADDRESS',
    eth: 'YOUR_ETH_ADDRESS'
  },
  premiumUnlocked: false
};
```

Then commit and push.

## Testing

Open the GitHub Pages URL and test with a sample PDF.

## Promotion

Once live, share on:
- r/selfhosted
- r/SomebodyMakeThis
- r/privacy
- Hacker News (Show HN)
- Indie Hackers

## Income

- Accept donations in BTC/ETH.
- Future: add premium AI voice and MP3 download for a one-time crypto payment.

Good luck!
