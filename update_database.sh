#!/bin/bash

TOKEN="YOUR_GITHUB_TOKEN_HERE"
REPO="tsiemasilo/forexsignals"

# Upload function
upload_file() {
    local file_path="$1"
    local content=$(base64 -w 0 "$file_path")
    
    echo "Uploading: $file_path"
    curl -s -X PUT \
        -H "Authorization: token $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"message\":\"Update: $file_path with new Neon database\",\"content\":\"$content\"}" \
        "https://api.github.com/repos/$REPO/contents/$file_path" > /dev/null
}

echo "Uploading updated database configuration..."
upload_file ".env"

echo "Database configuration updated!"