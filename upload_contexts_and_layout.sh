#!/bin/bash

TOKEN="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"
REPO="tsiemasilo/forexsignals"

# Upload function
upload_file() {
    local file_path="$1"
    local content=$(base64 -w 0 "$file_path")
    
    echo "Uploading: $file_path"
    curl -s -X PUT \
        -H "Authorization: token $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"message\":\"Fix: Upload missing $file_path\",\"content\":\"$content\"}" \
        "https://api.github.com/repos/$REPO/contents/$file_path" > /dev/null
}

# Upload context files
echo "Uploading context files..."
upload_file "client/src/contexts/AuthContext.tsx"
upload_file "client/src/contexts/CartContext.tsx"

# Upload layout and other missing components
echo "Uploading layout and components..."
upload_file "client/src/components/Layout.tsx"
upload_file "client/src/components/Navbar.tsx"

# Upload missing hooks that failed
echo "Uploading remaining hook files..."
find client/src/hooks -name "*.ts" -o -name "*.tsx" | while read file; do
    upload_file "$file"
done

echo "Context and layout files uploaded!"