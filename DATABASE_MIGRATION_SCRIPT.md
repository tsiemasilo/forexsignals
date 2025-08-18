# Database Migration Script for Plan-Specific Statuses

## Current Database State
Looking at your Neon console, the subscriptions table currently has:
- `active` status entries
- `free trial` status entries

## Target Status Values
We need to update the database to support:
- `basic plan` (for active Basic plan subscriptions)
- `premium plan` (for active Premium plan subscriptions) 
- `vip plan` (for active VIP plan subscriptions)
- `expired` (for expired subscriptions)
- `free trial` (for trial subscriptions - already exists)

## Migration SQL Commands
Run these commands in your Neon console:

```sql
-- Update all active subscriptions to plan-specific statuses based on plan_id
UPDATE subscriptions 
SET status = 'basic plan' 
WHERE status = 'active' AND plan_id = 1;

UPDATE subscriptions 
SET status = 'premium plan' 
WHERE status = 'active' AND plan_id = 2;

UPDATE subscriptions 
SET status = 'vip plan' 
WHERE status = 'active' AND plan_id = 3;

-- Verify the changes
SELECT status, plan_id, COUNT(*) as count 
FROM subscriptions 
GROUP BY status, plan_id 
ORDER BY status, plan_id;
```

## After Migration
Your database will have clean plan-specific statuses that match exactly what the admin interface expects, eliminating the mapping layer and providing crystal-clear subscription status tracking.

## Verification
After running the migration, you should see statuses like:
- `basic plan` for plan_id = 1
- `premium plan` for plan_id = 2  
- `vip plan` for plan_id = 3
- `free trial` for trial subscriptions
- `expired` for expired subscriptions