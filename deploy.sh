#!/bin/bash

# ListenPDF Deployment Script
echo "=== ListenPDF Deployment ==="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Add all files
echo "Adding files to git..."
git add -A

# Check if there are changes
if git diff --cached --quiet; then
    echo "No changes to commit."
else
    # Commit changes
    echo "Committing changes..."
    git commit -m "Add text normalization for better TTS experience"
fi

# Check remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
    echo "No remote repository set."
    echo "To set a remote, run: git remote add origin https://github.com/YOUR_USERNAME/listenpdf.git"
    echo "Then run: git push -u origin main"
else
    echo "Pushing to remote: $REMOTE_URL"
    git push origin main
fi

echo ""
echo "=== Files in ListenPDF ==="
ls -la

echo ""
echo "=== Text Normalizer Test ==="
echo "Open test-normalizer.html in your browser to test the normalization."
echo "Or open index.html to test the full application."

echo ""
echo "=== Next Steps ==="
echo "1. Test locally by opening index.html in a browser"
echo "2. If using GitHub Pages, push to your repository"
echo "3. Enable GitHub Pages in repository settings"
echo "4. Update crypto addresses in app.js if needed"