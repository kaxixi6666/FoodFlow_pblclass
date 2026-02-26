#!/bin/bash

# Script to fix meal_plans table in production environment
# 修复生产环境中 meal_plans 表的脚本

echo "========================================="
echo "Fixing meal_plans table structure"
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
# 从 DATABASE_URL 中提取数据库连接参数
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
# 执行前确认
read -p "Do you want to proceed with the database migration? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Operation cancelled by user"
    exit 0
fi

echo ""
echo "Executing migration script..."
echo "========================================="
echo ""

# Execute the SQL script
# 执行 SQL 脚本
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f add_user_id_to_meal_plans.sql

# Check if the script executed successfully
# 检查脚本是否成功执行
if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✓ Migration completed successfully!"
    echo "========================================="
    echo ""
    echo "The meal_plans table has been updated with:"
    echo "  - Added user_id column"
    echo "  - Updated unique constraint to (user_id, date, meal_type)"
    echo ""
    echo "Please restart the backend server to apply the changes."
else
    echo ""
    echo "========================================="
    echo "✗ Migration failed!"
    echo "========================================="
    echo ""
    echo "Please check the error messages above and fix any issues."
    exit 1
fi
