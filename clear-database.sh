#!/bin/bash

# Script to clear all data from FoodFlow database
# Author: FoodFlow Team
# Date: 2026-02-27

# Database configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="foodflow"
DB_USER="kaxixi"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to display messages
print_message() {
    echo -e "${GREEN}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

print_error() {
    echo -e "${RED}$1${NC}"
}

# Display warning
print_warning "⚠️  WARNING: This will delete ALL data from the FoodFlow database!"
print_warning "This action cannot be undone."

# Ask for confirmation
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    print_error "Operation cancelled."
    exit 1
fi

# Display start message
print_message "🗑️  Starting to clear all data from FoodFlow database..."

# Execute SQL script
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$(dirname "$0")/clear-database-data.sql"; then
    print_message "✅ Database cleared successfully!"
    print_message "📊 All tables are now empty."
    print_message "🔄 Auto-increment sequences have been reset to 1."
else
    print_error "❌ Failed to clear database data."
    print_error "Please check the error messages above."
    exit 1
fi

# Display completion message
print_message "✨ Operation completed!"
