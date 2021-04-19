/**
 * Recipe specific error type
 * This error should be thrown from the top level of a helper function.
 * If it is caught during recipe execution, the stacktrace is modified to show
 * the code-frame in the recipe where the helper function was called.
 */
export class RecipeError extends Error {}
