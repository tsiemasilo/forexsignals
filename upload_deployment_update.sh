#!/bin/bash

TOKEN="YOUR_GITHUB_TOKEN_HERE"
REPO="tsiemasilo/forexsignals"

# Get current SHA for updating existing file
get_file_sha() {
    local file_path="$1"
    curl -s -H "Authorization: token $TOKEN" \
        "https://api.github.com/repos/$REPO/contents/$file_path" | \
        grep '"sha"' | head -1 | cut -d'"' -f4
}

# Upload/update file function
upload_file() {
    local file_path="$1"
    local content=$(base64 -w 0 "$file_path")
    local sha=$(get_file_sha "$file_path")
    
    echo "Updating: $file_path"
    
    if [ -n "$sha" ]; then
        # Update existing file
        curl -s -X PUT \
            -H "Authorization: token $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"message\":\"Update: $file_path with new Neon database info\",\"content\":\"$content\",\"sha\":\"$sha\"}" \
            "https://api.github.com/repos/$REPO/contents/$file_path" > /dev/null
    else
        # Create new file
        curl -s -X PUT \
            -H "Authorization: token $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"message\":\"Add: $file_path with new database info\",\"content\":\"$content\"}" \
            "https://api.github.com/repos/$REPO/contents/$file_path" > /dev/null
    fi
}

echo "Updating deployment documentation..."
upload_file "DEPLOYMENT.md"

echo "Database configuration updated!"