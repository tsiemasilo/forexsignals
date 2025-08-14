#!/bin/bash

# GitHub upload script for Watchlist Fx
TOKEN="YOUR_GITHUB_TOKEN_HERE"
REPO="tsiemasilo/forexsignals"
BASE_URL="https://api.github.com/repos/$REPO/contents"

# Function to upload a file
upload_file() {
    local file_path="$1"
    local github_path="${file_path#./}"
    
    # Skip unwanted files
    if [[ "$file_path" =~ node_modules|\.git|\.replit|\.cache|\.local|upload_to_github\.sh|watchlist-fx-deployment\.tar\.gz ]]; then
        return
    fi
    
    # Check if it's a file (not directory)
    if [ -f "$file_path" ]; then
        echo "Uploading: $github_path"
        
        # Encode file content in base64
        content=$(base64 -w 0 "$file_path")
        
        # Create JSON payload
        json_payload=$(cat <<EOF
{
    "message": "Deploy: Watchlist Fx platform - Complete trading signals app with multiple image support",
    "content": "$content"
}
EOF
)
        
        # Upload to GitHub
        curl -s -X PUT \
            -H "Authorization: token $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$json_payload" \
            "$BASE_URL/$github_path" > /dev/null
    fi
}

# Export the function so it can be used with find
export -f upload_file
export TOKEN REPO BASE_URL

echo "Starting upload to GitHub repository: $REPO"

# Find and upload all project files
find . -type f -not -path './node_modules/*' -not -path './.git/*' -not -path './.replit/*' -not -path './.cache/*' -not -path './.local/*' -not -name 'upload_to_github.sh' -not -name 'watchlist-fx-deployment.tar.gz' | head -50 | while read file; do
    upload_file "$file"
done

echo "Upload completed!"