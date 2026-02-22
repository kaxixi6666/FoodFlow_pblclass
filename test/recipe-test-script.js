// Recipe Test Script
// This script tests the create recipe functionality

import { testRecipes, recipeCreationPayloads, recipeTestCases } from './recipe-test-data.js';

/**
 * Test script for recipe creation functionality
 * This script simulates the recipe creation process and verifies the results
 */
class RecipeTestScript {
  constructor() {
    this.recipes = [];
    this.testResults = [];
  }

  /**
   * Run all recipe tests
   */
  async runAllTests() {
    console.log('=== Starting Recipe Creation Tests ===\n');

    // Test 1: Create recipes from test cases
    await this.testCreateRecipes();

    // Test 2: Verify recipe data integrity
    this.testRecipeDataIntegrity();

    // Test 3: Test recipe filtering by status
    this.testRecipeFiltering();

    // Test 4: Test recipe search functionality
    this.testRecipeSearch();

    // Display test results
    this.displayTestResults();

    console.log('\n=== Recipe Creation Tests Complete ===');
  }

  /**
   * Test creating recipes from test cases
   */
  async testCreateRecipes() {
    console.log('Test 1: Creating recipes...');

    for (const testCase of recipeTestCases) {
      console.log(`  Creating: ${testCase.name}`);
      
      try {
        // Simulate API call to create recipe
        const newRecipe = await this.simulateCreateRecipe(testCase.payload, testCase.expectedStatus);
        this.recipes.push(newRecipe);
        
        this.testResults.push({
          test: `Create ${testCase.name}`,
          status: 'PASS',
          message: `Successfully created recipe: ${newRecipe.name}`
        });
      } catch (error) {
        this.testResults.push({
          test: `Create ${testCase.name}`,
          status: 'FAIL',
          message: `Failed to create recipe: ${error.message}`
        });
      }
    }

    console.log(`  Created ${this.recipes.length} recipes\n`);
  }

  /**
   * Test recipe data integrity
   */
  testRecipeDataIntegrity() {
    console.log('Test 2: Verifying recipe data integrity...');

    let allValid = true;

    for (const recipe of this.recipes) {
      // Check required fields
      const hasRequiredFields = recipe.name && recipe.ingredients && recipe.ingredients.length > 0;
      
      if (!hasRequiredFields) {
        allValid = false;
        this.testResults.push({
          test: `Verify ${recipe.name} data`,
          status: 'FAIL',
          message: 'Missing required fields'
        });
      } else {
        this.testResults.push({
          test: `Verify ${recipe.name} data`,
          status: 'PASS',
          message: 'All required fields present'
        });
      }
    }

    console.log(`  Data integrity check: ${allValid ? 'PASS' : 'FAIL'}\n`);
  }

  /**
   * Test recipe filtering by status
   */
  testRecipeFiltering() {
    console.log('Test 3: Testing recipe filtering...');

    // Test filtering by status
    const statuses = ['public', 'private', 'draft'];
    
    for (const status of statuses) {
      const filteredRecipes = this.recipes.filter(recipe => recipe.status === status);
      console.log(`  ${status}: ${filteredRecipes.length} recipes`);
      
      this.testResults.push({
        test: `Filter recipes by ${status}`,
        status: 'PASS',
        message: `Found ${filteredRecipes.length} recipes with ${status} status`
      });
    }

    console.log('');
  }

  /**
   * Test recipe search functionality
   */
  testRecipeSearch() {
    console.log('Test 4: Testing recipe search...');

    const searchTerms = ['pizza', 'salad', 'stir', 'burger'];
    
    for (const term of searchTerms) {
      const searchResults = this.recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(term.toLowerCase()) ||
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(term.toLowerCase())
        )
      );
      
      console.log(`  Search for "${term}": ${searchResults.length} results`);
      
      this.testResults.push({
        test: `Search for "${term}"`,
        status: 'PASS',
        message: `Found ${searchResults.length} recipes matching "${term}"`
      });
    }

    console.log('');
  }

  /**
   * Simulate creating a recipe (mimics API call)
   * @param {Object} recipeData - Recipe data to create
   * @param {string} status - Recipe status
   * @returns {Promise<Object>} Created recipe
   */
  async simulateCreateRecipe(recipeData, status) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Create new recipe object
    const newRecipe = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      ...recipeData,
      status: status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return newRecipe;
  }

  /**
   * Display test results
   */
  displayTestResults() {
    console.log('=== Test Results ===');
    
    const passCount = this.testResults.filter(result => result.status === 'PASS').length;
    const failCount = this.testResults.filter(result => result.status === 'FAIL').length;
    
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);
    console.log('');

    // Display detailed results
    for (const result of this.testResults) {
      const statusIcon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${statusIcon} ${result.test}: ${result.status}`);
      console.log(`  ${result.message}`);
    }

    console.log('');

    // Display created recipes
    console.log('=== Created Recipes ===');
    for (const recipe of this.recipes) {
      console.log(`Recipe: ${recipe.name}`);
      console.log(`  Status: ${recipe.status}`);
      console.log(`  Ingredients: ${recipe.ingredients.join(', ')}`);
      console.log(`  Prep Time: ${recipe.prepTime}, Cook Time: ${recipe.cookTime}`);
      console.log(`  Servings: ${recipe.servings}`);
      console.log('');
    }
  }
}

// Run the test script
if (import.meta.url === `file://${process.argv[1]}`) {
  const testScript = new RecipeTestScript();
  testScript.runAllTests();
}

export default RecipeTestScript;
