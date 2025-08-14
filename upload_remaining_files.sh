#!/bin/bash

TOKEN="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"
REPO="tsiemasilo/forexsignals"

# Upload function with smaller file size handling
upload_file_safe() {
    local file_path="$1"
    local file_size=$(stat -c%s "$file_path")
    
    # Skip files larger than 1MB (GitHub API limit is 1MB)
    if [ $file_size -gt 1048576 ]; then
        echo "Skipping large file: $file_path ($file_size bytes)"
        return
    fi
    
    local content=$(base64 -w 0 "$file_path")
    
    echo "Uploading: $file_path"
    curl -s -X PUT \
        -H "Authorization: token $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"message\":\"Deploy: $file_path\",\"content\":\"$content\"}" \
        "https://api.github.com/repos/$REPO/contents/$file_path" > /dev/null
}

# Upload key frontend files
echo "Uploading frontend files..."
upload_file_safe "client/src/App.tsx"
upload_file_safe "client/src/index.css"
upload_file_safe "client/src/pages/Home.tsx"
upload_file_safe "client/src/pages/Signals.tsx"
upload_file_safe "client/src/pages/SignalDetails.tsx"
upload_file_safe "client/src/pages/AdminSignals.tsx"
upload_file_safe "client/src/pages/AdminDashboard.tsx"
upload_file_safe "client/src/pages/Plans.tsx"
upload_file_safe "client/src/pages/Checkout.tsx"

# Upload backend files
echo "Uploading backend files..."
upload_file_safe "server/index.ts"
upload_file_safe "server/routes.ts"
upload_file_safe "server/storage.ts"
upload_file_safe "server/db.ts"
upload_file_safe "shared/schema.ts"

echo "Upload batch completed!"