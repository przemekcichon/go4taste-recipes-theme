<?php
/**
 * The main template file
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
 * It is used to display a page when nothing more specific matches a query.
 * E.g., it puts together the home page when no home.php file exists
 *
 * Methods for TimberHelper can be found in the /lib sub-directory
 *
 * @package  WordPress
 * @subpackage  Timber
 * @since   Timber 0.1
 */

$context = Timber::context();

if ( is_home() || is_front_page() ) {
	$home_query_args = apply_filters( 'go4taste/recipes/home_query_args', array() );
	$context['posts'] = Timber::get_posts( $home_query_args );
	$context         = apply_filters( 'go4taste/recipes/context/home', $context, array() );
} else {
	$context['posts'] = Timber::get_posts();
}

$context['foo']   = 'bar';
$templates        = array( 'index.twig' );
if ( is_home() || is_front_page() ) {
	array_unshift( $templates, 'front-page.twig', 'home.twig' );
}
Timber::render( $templates, $context );
