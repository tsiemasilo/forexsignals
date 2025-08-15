# GitHub Update Instructions - Free Trial Fix

## 🔧 **CHANGES READY FOR DEPLOYMENT**

### **What Was Fixed**
- **React Hooks Error**: Fixed useQuery being called conditionally 
- **Trial Access Logic**: Users with active trials now see signals instead of upgrade prompt
- **Frontend Stability**: No more React violations, clean component structure
- **Real-time Updates**: Maintained 3-second auto-refresh during trial period

### **Files Changed**
- `client/src/pages/Signals.tsx` - Fixed hooks order and trial validation logic
- Database trial setup scripts for proper 7-day periods
- Enhanced debug logging for subscription status tracking

## 🚀 **MANUAL GIT COMMANDS**

Run these commands in your terminal:

```bash
cd /home/runner/workspace

# Add all changes
git add .

# Commit with descriptive message
git commit -m "🔧 Fix free trial logic - users now see signals during 7-day trial period

- Fixed React hooks error by moving useQuery to component top level
- Enhanced subscription validation for proper trial handling  
- Trial users with daysLeft > 0 now access signals instead of upgrade prompt
- Fixed admin panel trial duration from 1-minute to proper 7-day periods
- Maintained real-time auto-refresh functionality during trial
- Added comprehensive debug logging for trial access decisions

Trial users now get full signal access for 7 days as intended."

# Push to GitHub (use your personal access token)
git push https://tsiemasilo:$PERSONAL_ACCESS_TOKEN_FOREX@github.com/tsiemasilo/forexsignals.git main
```

## 📋 **DEPLOYMENT STATUS**

**Frontend Changes**: ✅ Ready
- React hooks error fixed
- Trial access logic corrected
- Real-time functionality maintained

**Backend Support**: ✅ Working  
- Subscription validation enhanced
- Database trial management improved
- Access control logic verified

**Expected Result**: Trial users will see 15 signals during their 7-day trial period instead of immediate upgrade prompts.

Once you push to GitHub, Netlify will automatically rebuild and deploy the fixed version.