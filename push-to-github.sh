#!/bin/bash

# Push to GitHub with token authentication
echo "Pushing to GitHub..."

# Export the token as environment variable
export GITHUB_TOKEN="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"

# Use the token for authentication
git push https://$GITHUB_TOKEN@github.com/tsiemasilo/forexsignals.git main

echo "Push completed!"