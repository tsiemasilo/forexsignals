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
        -d "{\"message\":\"Fix: Upload $file_path for deployment\",\"content\":\"$content\"}" \
        "https://api.github.com/repos/$REPO/contents/$file_path" > /dev/null
}

# Upload essential files that are still missing
echo "Uploading final essential files..."
upload_file "client/src/main.tsx"
upload_file "client/index.html"

# Upload missing UI components that might be needed
echo "Uploading more UI components..."
upload_file "client/src/components/ui/table.tsx"
upload_file "client/src/components/ui/dropdown-menu.tsx"

echo "Final files uploaded!"