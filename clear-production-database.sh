#!/bin/bash

# PRODUCTION DATABASE DATA CLEARING SCRIPT
# ⚠️  EXTREME CAUTION: This script will delete ALL data from PRODUCTION database
# Author: FoodFlow Team
# Date: 2026-02-27

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to display messages
print_header() {
    echo -e "${BOLD}${BLUE}========================================${NC}"
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BOLD}${BLUE}========================================${NC}"
}

print_warning() {
    echo -e "${RED}⚠️  WARNING: $1${NC}"
}

print_error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Display critical warning
print_header "PRODUCTION DATABASE DATA CLEARING"
echo ""
print_warning "THIS SCRIPT WILL DELETE ALL DATA FROM THE PRODUCTION DATABASE"
print_warning "THIS OPERATION IS IRREVERSIBLE"
print_warning "ALL USER DATA, RECIPES, MEAL PLANS, AND OTHER DATA WILL BE LOST"
echo ""
print_info "Tables that will be cleared:"
echo "  - users (all user accounts)"
echo "  - recipes (all recipes)"
echo "  - meal_plans (all meal planning data)"
echo "  - recipe_likes (all recipe likes)"
echo "  - note_likes (all note likes)"
echo "  - notifications (all notifications)"
echo "  - shopping_list_items (all shopping list items)"
echo "  - inventory (all inventory items)"
echo "  - ingredients (all ingredients)"
echo "  - recipe_ingredients (all recipe-ingredient relationships)"
echo ""

# First confirmation
print_warning "Are you sure you want to proceed?"
read -p "Type 'yes' to continue, or press Enter to cancel: " confirm1

if [ "$confirm1" != "yes" ]; then
    print_error "Operation cancelled by user."
    exit 1
fi

echo ""

# Second confirmation with specific word
print_warning "To confirm you understand this is PRODUCTION, type 'PRODUCTION':"
read -p "Type 'PRODUCTION' to continue: " confirm2

if [ "$confirm2" != "PRODUCTION" ]; then
    print_error "Operation cancelled. Incorrect confirmation word."
    exit 1
fi

echo ""

# Database configuration - Update these with your production database credentials
print_info "Please provide your production database credentials:"
read -p "Database Host (default: localhost): " DB_HOST
read -p "Database Port (default: 5432): " DB_PORT
read -p "Database Name (default: foodflow): " DB_NAME
read -p "Database Username: " DB_USER
read -s -p "Database Password: " DB_PASSWORD
echo ""

# Set defaults if not provided
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-foodflow}

echo ""
print_info "Connecting to production database:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Test database connection
print_info "Testing database connection..."
if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_error "Failed to connect to database. Please check your credentials."
    exit 1
fi

echo ""

# Show current data count
print_info "Current data in database:"
echo ""
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT 
    tablename AS table_name,
    n_tup_ins - n_tup_del AS row_count
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
" 2>/dev/null || print_error "Failed to retrieve data counts"

echo ""

# Create backup
print_info "Creating backup before clearing..."
BACKUP_FILE="production_backup_$(date +%Y%m%d_%H%M%S).sql"

if PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
    print_success "Backup created: $BACKUP_FILE"
    print_info "Backup file size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    print_error "Failed to create backup. Aborting operation."
    exit 1
fi

echo ""

# Final confirmation
print_warning "FINAL CONFIRMATION"
print_warning "You are about to delete ALL data from the production database"
print_warning "Backup has been created at: $BACKUP_FILE"
read -p "Type 'DELETE' to proceed with data deletion, or press Enter to cancel: " confirm3

if [ "$confirm3" != "DELETE" ]; then
    print_error "Operation cancelled by user."
    print_info "Backup file is preserved at: $BACKUP_FILE"
    exit 1
fi

echo ""

# Execute SQL script
print_info "Starting data deletion..."
echo ""

if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$(dirname "$0")/clear-database-data.sql"; then
    echo ""
    print_success "Production database cleared successfully!"
    print_info "Backup file: $BACKUP_FILE"
    print_info "Auto-increment sequences have been reset to 1"
else
    echo ""
    print_error "Failed to clear production database data."
    print_error "Backup file is preserved at: $BACKUP_FILE"
    print_error "Please check the error messages above."
    exit 1
fi

echo ""

# Verify deletion
print_info "Verifying data deletion..."
REMAINING_DATA=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
SELECT SUM(n_tup_ins - n_tup_del) 
FROM pg_stat_user_tables 
WHERE schemaname = 'public';
" 2>/dev/null | tr -d ' ')

if [ "$REMAINING_DATA" = "0" ] || [ -z "$REMAINING_DATA" ]; then
    print_success "Verification complete: All data has been cleared"
else
    print_warning "Verification complete: $REMAINING_DATA rows remain"
    print_warning "Please check the database manually"
fi

echo ""
print_header "OPERATION COMPLETED"
print_success "Production database has been cleared"
print_info "Backup file: $BACKUP_FILE"
print_info "Timestamp: $(date)"
echo ""
print_warning "IMPORTANT: Keep the backup file safe!"
print_warning "You can restore it if needed using:"
echo "  PGPASSWORD='$DB_PASSWORD' psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < $BACKUP_FILE"
echo ""
