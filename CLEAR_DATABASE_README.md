# Database Data Clearing Scripts

This directory contains scripts to clear all data from the FoodFlow PostgreSQL database.

## Files

### 1. `clear-database-data.sql`
SQL script that clears all data from all tables in the FoodFlow database.

**Tables cleared:**
- `meal_plans` - Meal planning data
- `recipe_ingredients` - Recipe-ingredient relationships
- `recipe_likes` - Recipe likes
- `note_likes` - Note likes
- `notifications` - User notifications
- `shopping_list_items` - Shopping list items
- `recipes` - Recipe data
- `inventory` - Inventory items
- `users` - User accounts
- `ingredients` - Ingredient data

**Features:**
- Respects foreign key constraints by deleting in correct order
- Resets all auto-increment sequences to start from 1
- Provides progress notifications during execution
- Uses transaction for data consistency

### 2. `clear-database.sh`
Bash wrapper script that executes the SQL script with safety checks.

**Features:**
- Interactive confirmation prompt
- Color-coded output messages
- Error handling
- Progress feedback

## Usage

### Option 1: Using the Bash Script (Recommended)

```bash
./clear-database.sh
```

You will be prompted to confirm the operation:
```
⚠️  WARNING: This will delete ALL data from the FoodFlow database!
This action cannot be undone.
Are you sure you want to continue? (yes/no):
```

Type `yes` to proceed or `no` to cancel.

### Option 2: Using psql Directly

```bash
psql -h localhost -U kaxixi -d foodflow -f clear-database-data.sql
```

### Option 3: Using Environment Variables

If you need to use different database credentials, modify the variables in `clear-database.sh`:

```bash
DB_HOST="your_host"
DB_PORT="your_port"
DB_NAME="your_database"
DB_USER="your_username"
```

## What Gets Cleared

1. **User Data**
   - All user accounts
   - User preferences and settings

2. **Recipe Data**
   - All recipes (including draft, private, and public)
   - Recipe-ingredient relationships
   - Recipe likes

3. **Meal Planning Data**
   - All meal plans
   - Scheduled recipes

4. **Inventory Data**
   - All inventory items

5. **Shopping List Data**
   - All shopping list items

6. **Notification Data**
   - All user notifications

7. **Ingredient Data**
   - All ingredients

## Important Notes

⚠️ **This operation is irreversible!**
- All data will be permanently deleted
- Make sure to backup your database before running this script
- This should only be used in development/testing environments

🔄 **Auto-increment sequences are reset**
- After clearing, new records will start from ID 1
- This ensures a clean slate for testing

📋 **Foreign key constraints are respected**
- Tables are deleted in the correct order to avoid constraint violations
- Dependent data is deleted before parent data

## Backup Before Clearing

To backup your database before clearing:

```bash
# Backup to a file
pg_dump -h localhost -U kaxixi -d foodflow > backup_$(date +%Y%m%d_%H%M%S).sql

# Or backup to a compressed file
pg_dump -h localhost -U kaxixi -d foodflow | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

## Restore from Backup

To restore from a backup:

```bash
# From SQL file
psql -h localhost -U kaxixi -d foodflow < backup_20260227_123045.sql

# From compressed file
gunzip -c backup_20260227_123045.sql.gz | psql -h localhost -U kaxixi -d foodflow
```

## Verification

After clearing, verify the database is empty:

```bash
# Check row counts
psql -h localhost -U kaxixi -d foodflow -c "
SELECT 
    schemaname,
    tablename,
    n_tup_ins - n_tup_del as row_count
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"
```

All tables should show `row_count` as 0.

## Troubleshooting

### Permission Denied
If you get a permission error:
```bash
chmod +x clear-database.sh
```

### Connection Error
If you get a connection error, verify:
- PostgreSQL is running: `ps aux | grep postgres`
- Database exists: `psql -h localhost -U kaxixi -d foodflow -c "\l"`
- Credentials are correct in the script

### Lock Timeout
If the script hangs, there might be a lock:
```bash
# Check for active connections
psql -h localhost -U kaxixi -d foodflow -c "
SELECT pid, usename, state, query 
FROM pg_stat_activity 
WHERE datname = 'foodflow';
"

# Terminate if necessary (use with caution)
psql -h localhost -U kaxixi -d foodflow -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'foodflow';"
```

## Support

For issues or questions:
1. Check PostgreSQL logs: `/usr/local/var/log/postgresql/` or `/var/log/postgresql/`
2. Verify database configuration in `application.yml`
3. Test database connection: `psql -h localhost -U kaxixi -d foodflow -c "SELECT 1;"`
