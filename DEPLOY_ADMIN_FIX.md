# Admin Subscription Fix Deployment

## Fixed Issues
- ✅ Changed table name from `user_subscriptions` to `subscriptions` 
- ✅ Fixed SQL syntax error with dynamic query building
- ✅ Added proper planId parameter handling
- ✅ Added logic to create subscriptions if none exist
- ✅ Proper CORS headers and method handling

## Commands to Run (Copy & Paste):

```bash
cp admin-subscription-fixed.mjs netlify/functions/admin-subscription.mjs
git add netlify/functions/admin-subscription.mjs
git commit -m "Fix SQL syntax error in admin subscription function"
git push https://tsiemasilo:$PERSONAL_ACCESS_TOKEN_FOREX@github.com/tsiemasilo/forexsignals.git main
```

## Test Command After Deployment:
```bash
curl -X POST https://watchlistfx.netlify.app/api/login -H "Content-Type: application/json" -d '{"email":"admin@forexsignals.com"}' -c cookies.txt

curl -X PATCH https://watchlistfx.netlify.app/api/admin/users/3/subscription -H "Content-Type: application/json" -d '{"status":"active","planId":1}' -b cookies.txt
```

Expected Result: `{"success":true,"message":"Subscription updated successfully","status":"active","endDate":"2025-08-28T..."}`