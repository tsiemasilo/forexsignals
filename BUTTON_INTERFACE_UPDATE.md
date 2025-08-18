✅ Admin Interface Reworked - Button-Based Status Management

Changes Applied:
- Removed Select dropdown for plan activation
- Replaced with individual buttons for each plan (Basic, Premium, VIP)
- Enhanced visual feedback with color-coded buttons
- Added detailed console logging for debugging
- Improved loading states and error handling

Button Structure:
🔵 Create 7-Day Trial (Blue)
🟡 Set Inactive (Yellow) 
🔴 Set Expired (Red)
🟢 Set Basic Plan (Green)
🟢 Set Premium Plan (Green)  
🟢 Set VIP Plan (Green)

All buttons trigger immediate backend updates and cache invalidation.
