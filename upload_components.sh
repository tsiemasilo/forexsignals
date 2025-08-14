#!/bin/bash

TOKEN="YOUR_GITHUB_TOKEN_HERE"
REPO="tsiemasilo/forexsignals"

# Upload function
upload_file() {
    local file_path="$1"
    if [ -f "$file_path" ]; then
        local content=$(base64 -w 0 "$file_path")
        echo "Uploading: $file_path"
        curl -s -X PUT \
            -H "Authorization: token $TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"message\":\"Fix: Upload missing component $file_path\",\"content\":\"$content\"}" \
            "https://api.github.com/repos/$REPO/contents/$file_path" > /dev/null
    else
        echo "File not found: $file_path"
    fi
}

# Upload all missing component files
echo "Uploading missing component files..."
upload_file "client/src/components/SubscriptionStatusBadge.tsx"
upload_file "client/src/components/ImageUpload.tsx"
upload_file "client/src/components/StatusBadge.tsx"

# Upload any other component files in the components directory
find client/src/components -name "*.tsx" -type f | while read file; do
    # Skip files that are directories or already uploaded
    if [[ ! "$file" =~ ui/ ]] && [[ ! "$file" =~ Layout.tsx ]]; then
        upload_file "$file"
    fi
done

echo "Component upload completed!"