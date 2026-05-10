<?php
/**
 * The Template for displaying all single posts
 *
 * Methods for TimberHelper can be found in the /lib sub-directory
 *
 * @package  WordPress
 * @subpackage  Timber
 * @since    Timber 0.1
 */

$context         = Timber::context();
$timber_post     = Timber::get_post();
$context['post'] = $timber_post;

$source_post_type = apply_filters( 'go4taste/recipes/source_post_type', 'post' );
$is_recipe_single = isset( $timber_post->post_type ) && $timber_post->post_type === $source_post_type;
$is_debug_request = isset( $_GET['g4t_recipe_debug'] );

// Fallback: ensure recipe context is present even if timber/context hook chain is bypassed.
if ( $is_recipe_single ) {
	$context = apply_filters( 'go4taste/recipes/context/single', $context, array( 'scope' => 'single-template-fallback' ) );
}

if ( post_password_required( $timber_post->ID ) ) {
	Timber::render( 'single-password.twig', $context );
} else {
	$templates = array( 'single-' . $timber_post->ID . '.twig', 'single-' . $timber_post->post_type . '.twig', 'single-' . $timber_post->slug . '.twig', 'single.twig' );

	if ( $is_recipe_single ) {
		array_unshift( $templates, 'single-recipe.twig' );
	}

	$context['g4t_debug_request'] = $is_debug_request;
	$context['g4t_debug_single']  = array(
		'post_id'           => (int) $timber_post->ID,
		'post_type'         => (string) $timber_post->post_type,
		'source_post_type'  => (string) $source_post_type,
		'is_recipe_single'  => (bool) $is_recipe_single,
		'has_recipe_key'    => array_key_exists( 'recipe', $context ),
		'has_recipes_key'   => array_key_exists( 'recipes', $context ),
		'recipe_steps_type' => isset( $context['recipe']['steps'] ) ? gettype( $context['recipe']['steps'] ) : null,
		'recipe_steps_count'=> isset( $context['recipe']['steps'] ) && is_array( $context['recipe']['steps'] ) ? count( $context['recipe']['steps'] ) : 0,
		'recipe_ing_count'  => isset( $context['recipe']['ingredients'] ) && is_array( $context['recipe']['ingredients'] ) ? count( $context['recipe']['ingredients'] ) : 0,
		'filter_single_attached' => false !== has_filter( 'go4taste/recipes/context/single' ),
		'plugin_bootstrap_function' => function_exists( 'go4taste_recipes_plugin_bootstrap' ),
		'templates_checked' => $templates,
	);

	Timber::render( $templates, $context );
}
