#!/bin/bash

TOKEN="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"
REPO="tsiemasilo/forexsignals"

# Upload a single file to GitHub
upload_single_file() {
    local file_path="$1"
    local content=$(base64 -w 0 "$file_path")
    
    curl -s -X PUT \
        -H "Authorization: token $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"message\":\"Deploy: $file_path\",\"content\":\"$content\"}" \
        "https://api.github.com/repos/$REPO/contents/$file_path"
}

# Critical files for deployment
echo "Uploading critical files..."

upload_single_file "package.json"
upload_single_file "netlify.toml"
upload_single_file "DEPLOYMENT.md"
upload_single_file "README.md"
upload_single_file "netlify/functions/server.js"

echo "Critical files uploaded!"