# Advanced Debugging Guide - WatchlistFX

## Overview
This guide covers the advanced debugging and monitoring system implemented for the WatchlistFX admin dashboard to identify and resolve subscription days calculation issues.

## Debugging Features

### 1. Real-Time Debug Dashboard
The admin dashboard includes a live debug display with three main sections:

#### Real-time Status Card
- **Active Users**: Current number of users in the system
- **Cache Updates**: Count of cache invalidations and refreshes
- **Query Invalidations**: Number of React Query cache invalidations
- **Last Update**: Timestamp of the most recent cache update

#### Recent Subscription Changes Card
- Tracks the last 3 subscription plan changes
- Shows before/after plan information
- Displays timestamps and user IDs
- Automatically updates when plans change

#### Days Calculation Monitor Card
- Shows the last 5 days calculations
- Compares calculated days vs expected days from plan
- Highlights discrepancies in red
- Shows plan names and duration expectations

### 2. Advanced Debugging Hook (`useAdvancedDebug`)
Custom React hook that provides:
- **Subscription Change Detection**: Automatically detects when users change plans
- **Days Calculation Tracking**: Monitors all days calculations in real-time
- **Cache Update Monitoring**: Tracks React Query cache invalidations
- **Historical Data**: Maintains history of changes and calculations

### 3. Console Debugging
Enhanced console logging with structured output:
- **Grouped Logging**: Related debug information is grouped together
- **Real-time Snapshots**: Every 5 seconds, logs current state
- **Discrepancy Alerts**: Warns when days calculations don't match expectations
- **Subscription Change Logs**: Detailed logging of plan changes

## How to Use the Debugging System

### Accessing Debug Information
1. **Log in as Admin**: Use `admin@forexsignals.com`
2. **Open Admin Dashboard**: Navigate to user management
3. **View Live Debug Display**: Check the debug cards at the top
4. **Open Browser Console**: Press F12 to see detailed logs

### Testing Subscription Changes
1. Select a test user (e.g., `af@gmail.com`)
2. Change their subscription plan using the admin buttons
3. Watch the debug display for real-time updates
4. Check console for detailed calculation breakdowns

### Identifying Issues
The system will automatically detect:
- **Cache Update Failures**: When UI doesn't refresh after changes
- **Days Calculation Discrepancies**: When frontend and backend calculations differ
- **Plan Change Problems**: When subscription updates don't reflect properly

## Debug Output Examples

### Console Group Example
```
🔍 SUBSCRIPTION CHANGES DETECTED
  User ID: 29
  Old Plan: Basic Plan Duration: 5
  New Plan: Premium Plan Duration: 14
  Plan Changed: true

🔬 REAL-TIME DEBUG SNAPSHOT
  Cache State: {totalUsers: 8, updateCount: 3, lastUpdate: "2025-08-18T11:49:00.251Z"}
```

### Discrepancy Alert Example
```
DISCREPANCY DETECTED: {
  userId: 29,
  email: "af@gmail.com",
  realTimeDays: 14,
  backendDuration: 14,
  difference: 0,
  endDate: "2025-09-01T11:49:00.210Z",
  planName: "Premium Plan"
}
```

## Common Issues and Solutions

### 1. Days Not Updating in UI
**Symptoms**: Days calculation shows old values after plan change
**Check**: 
- Cache update count in debug display
- Browser console for discrepancy alerts
- Recent subscription changes log

**Solution**: The debug system will identify if it's a cache issue or calculation error

### 2. Subscription Changes Not Reflecting
**Symptoms**: Plan changes don't show in admin dashboard
**Check**: 
- Recent subscription changes card
- Console logs for mutation responses
- Query invalidation count

**Solution**: Debug display will show if changes are detected but not displayed

### 3. Cache Update Issues
**Symptoms**: UI doesn't refresh automatically
**Check**: 
- Cache update counter remains at 0
- No entries in subscription changes log
- Console errors

**Solution**: Debug system will identify React Query cache problems

## Testing Workflow

### Manual Testing Process
1. **Baseline Check**: Note current debug state
2. **Make Change**: Update user subscription plan
3. **Monitor Response**: Watch debug cards for updates
4. **Verify Calculation**: Check days calculation in monitor
5. **Console Review**: Examine detailed logs in browser console

### Automated Monitoring
The system continuously:
- Monitors all users every 5 seconds
- Tracks cache invalidations automatically
- Logs discrepancies as they occur
- Maintains history of changes and calculations

## Advanced Features

### 1. Debug State Management
- **Reset Functionality**: Clear debug history with reset button
- **Historical Tracking**: Maintains last 10 subscription changes
- **Calculation History**: Stores last 50 days calculations

### 2. Real-time Updates
- **Live Timestamps**: Updates every second
- **Automatic Refresh**: Detects changes without manual refresh
- **Background Monitoring**: Continues monitoring even when tab not focused

### 3. Comprehensive Logging
- **Structured Data**: All debug data in consistent format
- **Performance Tracking**: Monitor query performance and cache efficiency
- **Error Detection**: Automatic identification of calculation errors

This debugging system provides comprehensive insight into the subscription management system and will identify the root cause of any days calculation display issues.