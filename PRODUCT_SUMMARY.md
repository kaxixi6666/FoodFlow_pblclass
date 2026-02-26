# FoodFlow Product Summary

FoodFlow is a feature-rich recipe management application designed to help users more effectively manage ingredients, recipes, and meal plans.

## Core Features

### 1. Recipe Management
- **Personal Recipes**: Create, edit, view, and categorize personal recipes
- **Public Recipes**: Browse and like public recipes published by other users
- **Recipe Details**: View detailed recipe information, including ingredients, cooking steps, prep time, and cook time
- **Recipe Status**: Supports two statuses: draft (visible only to the creator) and public (visible to all users)

### 2. Inventory Management
- **Manual Addition**: Directly input ingredient names to add to inventory
- **AI Recognition**: Automatically identify ingredients from receipt or fridge images and add to inventory
- **Bulk Operations**: Support for bulk adding ingredients to inventory

### 3. Meal Plan Management
- **Weekly View**: View and manage meal plans by week
- **Meal Type Classification**: Supports three meal types: breakfast, lunch, and dinner
- **Recipe Addition**: Add recipes from personal or public recipes to meal plans
- **Week Switching**: Support for switching between different weeks' meal plans

### 4. Social Interaction
- **Recipe Liking**: Like recipes with support for unliking
- **Author Notifications**: Send notifications to recipe authors when their recipe is first liked
- **Notification Center**: View and manage unread notifications

### 5. User Authentication
- **Registration**: Create new user accounts
- **Login**: User authentication
- **User Information**: Manage personal profiles

## Technical Architecture

### Frontend
- **Framework**: React + TypeScript
- **State Management**: React Context API (AuthProvider)
- **Styling**: Tailwind CSS
- **API Calls**: Axios
- **Routing**: React Router DOM
- **Icons**: Lucide React

### Backend
- **Framework**: Spring Boot
- **Database**: PostgreSQL
- **ORM**: JPA
- **API Design**: RESTful API
- **Authentication**: Request header-based user ID verification
- **Transaction Management**: @Transactional annotation

### Data Flow
1. Frontend interacts with backend through API calls
2. Backend processes requests and operates on the database
3. Frontend receives responses, updates state, and re-renders UI

## Key Highlights

1. **AI Ingredient Recognition**: Uses AI technology to automatically identify ingredients in images, improving user experience
2. **Weekly Meal Plan View**: Intuitive weekly view for easy meal planning
3. **Recipe Liking and Notifications**: Enhance social interaction and encourage sharing of quality recipes
4. **Responsive Design**: Adapts to different screen sizes for a good mobile experience
5. **Modular Architecture**: Separate frontend and backend with clear code structure, easy to maintain and extend
6. **Efficient Data Filtering**: Filter meal plans by weekly time range and user permissions to ensure data accuracy

## Application Scenarios

- **Family Users**: Plan family meals, manage ingredient inventory, and reduce food waste
- **Cooking Enthusiasts**: Create and share recipes, get inspiration and feedback
- **Health-Conscious Individuals**: Achieve healthy eating goals through meal plan management
- **Busy Professionals**: Plan weekly meals in advance to save decision-making time

FoodFlow is not just a recipe management tool, but also an intelligent assistant that helps users achieve healthy and efficient dietary lifestyles. Through its intuitive interface and powerful features, users can easily manage ingredients, plan meals, discover new recipes, and ultimately enhance their overall dining experience.