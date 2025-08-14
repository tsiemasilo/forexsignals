#!/bin/bash

TOKEN="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"
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
            -d "{\"message\":\"Upload: $file_path\",\"content\":\"$content\"}" \
            "https://api.github.com/repos/$REPO/contents/$file_path" > /dev/null
    fi
}

echo "Uploading all remaining UI components..."

# Upload all UI components that might be missing
for component in skeleton sidebar separator checkbox collapsible context-menu menubar carousel; do
    upload_file "client/src/components/ui/${component}.tsx"
done

echo "UI components uploaded!"