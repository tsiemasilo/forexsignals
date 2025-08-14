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
        -d "{\"message\":\"Fix: Upload missing $file_path\",\"content\":\"$content\"}" \
        "https://api.github.com/repos/$REPO/contents/$file_path" > /dev/null
}

# Upload missing lib files
echo "Uploading missing library files..."
upload_file "client/src/lib/queryClient.ts"
upload_file "client/src/lib/utils.ts"

# Upload missing hook files
echo "Uploading hook files..."
upload_file "client/src/hooks/useAuth.ts"
upload_file "client/src/hooks/use-toast.ts"

# Upload missing component files
echo "Uploading component files..."
upload_file "client/src/components/ui/button.tsx"
upload_file "client/src/components/ui/form.tsx"
upload_file "client/src/components/ui/input.tsx"
upload_file "client/src/components/ui/select.tsx"
upload_file "client/src/components/ui/textarea.tsx"
upload_file "client/src/components/ui/toast.tsx"
upload_file "client/src/components/ui/badge.tsx"
upload_file "client/src/components/ui/dialog.tsx"

# Upload missing pages
echo "Uploading remaining pages..."
upload_file "client/src/pages/Cart.tsx"
upload_file "client/src/pages/Contact.tsx"
upload_file "client/src/pages/About.tsx"
upload_file "client/src/pages/Auth.tsx"
upload_file "client/src/pages/AdminUsers.tsx"
upload_file "client/src/pages/not-found.tsx"

# Upload other critical files
echo "Uploading config files..."
upload_file "tsconfig.json"
upload_file "vite.config.ts"
upload_file "tailwind.config.ts"
upload_file "server/vite.ts"

echo "Missing files uploaded successfully!"