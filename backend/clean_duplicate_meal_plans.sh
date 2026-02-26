#!/bin/bash

# Script to clean up duplicate meal plans and add unique constraint
# 清理重复的餐计划并添加唯一约束的脚本

echo "========================================="
echo "Cleaning up duplicate meal plans"
echo "========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL to your PostgreSQL connection string"
    echo "Example: export DATABASE_URL='postgresql://user:password@host:port/database'"
    exit 1
fi

# Extract database connection parameters from DATABASE_URL
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo $DATABASE_URL | sed -n 's/.*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "Database connection details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Confirm before proceeding
read -p "Do you want to proceed with cleaning up duplicates? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled by user"
    exit 0
fi

echo ""
echo "Executing cleanup script..."
echo "========================================="
echo ""

# Execute the SQL script
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f clean_duplicate_meal_plans.sql

# Check if the script executed successfully
if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✓ Cleanup completed successfully!"
    echo "========================================="
    echo ""
    echo "The meal_plans table has been cleaned:"
    echo "  - Removed duplicate entries"
    echo "  - Added unique constraint (user_id, date, meal_type)"
    echo ""
    echo "Please restart the backend server to apply the changes."
else
    echo ""
    echo "========================================="
    echo "✗ Cleanup failed!"
    echo "========================================="
    echo ""
    echo "Please check the error messages above and fix any issues."
    exit 1
fi
