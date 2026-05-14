<?php
/**
 * Timber starter-theme
 * https://github.com/timber/starter-theme
 */

// Load Composer dependencies.
require_once __DIR__ . '/vendor/autoload.php';

require_once __DIR__ . '/src/StarterSite.php';

Timber\Timber::init();

// Sets the directories (inside your theme) to find .twig files.
Timber::$dirname = [ 'templates', 'views' ];

new StarterSite();

/**
 * Enqueue full prototype assets for recipe views.
 */
function go4taste_recipes_theme_enqueue_assets() {
	$source_post_type = apply_filters( 'go4taste/recipes/source_post_type', 'post' );
	$use_recipe_archive_template = apply_filters( 'go4taste/recipes/use_archive_template', false, get_queried_object() );

	$is_recipe_single = is_singular( $source_post_type );
	$is_recipe_archive = is_post_type_archive( $source_post_type ) || ( is_archive() && $use_recipe_archive_template );
	$is_recipe_home = is_home() || is_front_page();

	if ( ! $is_recipe_single && ! $is_recipe_archive && ! $is_recipe_home ) {
		return;
	}

	$theme_version = wp_get_theme()->get( 'Version' );
	$base_uri      = get_template_directory_uri() . '/assets';

	wp_enqueue_style(
		'go4taste-recipes-fonts',
		'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Fira+Sans+Condensed:wght@400;600;700&display=swap',
		array(),
		null,
		'all'
	);

	wp_enqueue_style(
		'go4taste-recipes-main',
		$base_uri . '/css/main.css',
		array( 'go4taste-recipes-fonts' ),
		$theme_version,
		'all'
	);

	if ( $is_recipe_single ) {
		wp_enqueue_style(
			'go4taste-recipes-single',
			$base_uri . '/css/single-recipe.css',
			array( 'go4taste-recipes-main' ),
			$theme_version,
			'all'
		);

		wp_enqueue_style(
			'go4taste-recipes-single-ingredients',
			$base_uri . '/css/single-recipe-ingredients.css',
			array( 'go4taste-recipes-single' ),
			$theme_version,
			'all'
		);

		wp_enqueue_style(
			'go4taste-recipes-single-steps',
			$base_uri . '/css/single-recipe-steps.css',
			array( 'go4taste-recipes-single-ingredients' ),
			$theme_version,
			'all'
		);

		wp_enqueue_style(
			'go4taste-recipes-single-ads',
			$base_uri . '/css/single-recipe-go4taste-ads.css',
			array( 'go4taste-recipes-single-steps' ),
			$theme_version,
			'all'
		);

		wp_enqueue_style(
			'go4taste-recipes-single-hero',
			$base_uri . '/css/single-recipe-hero.css',
			array( 'go4taste-recipes-single-ads' ),
			$theme_version,
			'all'
		);

		wp_enqueue_script(
			'go4taste-recipes-single-ads-slider',
			$base_uri . '/js/go4taste-ads-slider-only.js',
			array(),
			$theme_version,
			true
		);

		wp_enqueue_script(
			'go4taste-recipes-single-mobile-tabs',
			$base_uri . '/js/single-recipe-mobile-tabs.js',
			array(),
			$theme_version,
			true
		);
	}

	if ( $is_recipe_archive || $is_recipe_home ) {
		wp_enqueue_style(
			'go4taste-recipes-archive',
			$base_uri . '/css/archive-recipes.css',
			array( 'go4taste-recipes-main' ),
			$theme_version,
			'all'
		);

		wp_enqueue_style(
			'go4taste-recipes-archive-hero',
			$base_uri . '/css/archive-recipes-hero.css',
			array( 'go4taste-recipes-archive' ),
			$theme_version,
			'all'
		);

		wp_enqueue_style(
			'go4taste-recipes-archive-ads',
			$base_uri . '/css/archive-recipes-go4taste-ads.css',
			array( 'go4taste-recipes-archive-hero' ),
			$theme_version,
			'all'
		);

		wp_enqueue_script(
			'go4taste-recipes-archive-hero',
			$base_uri . '/js/archive-ingredient-hero.js',
			array(),
			$theme_version,
			true
		);
	}

	if ( $is_recipe_home ) {
		wp_enqueue_style(
			'go4taste-recipes-home-hero',
			$base_uri . '/css/home-hero.css',
			array( 'go4taste-recipes-main' ),
			$theme_version,
			'all'
		);

		wp_enqueue_style(
			'go4taste-recipes-home',
			$base_uri . '/css/home.css',
			array( 'go4taste-recipes-home-hero' ),
			$theme_version,
			'all'
		);
	}

	wp_enqueue_style(
		'go4taste-recipes-quick-actions-bar',
		$base_uri . '/css/quick-actions-bar.css',
		array( 'go4taste-recipes-main' ),
		$theme_version,
		'all'
	);

	wp_enqueue_script(
		'go4taste-recipes-quick-actions-bar',
		$base_uri . '/js/quick-actions-bar.js',
		array(),
		$theme_version,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'go4taste_recipes_theme_enqueue_assets', 30 );

/**
 * Enable SVG uploads for ACF taxonomy term icons.
 */
function go4taste_recipes_theme_enable_svg_upload( array $mimes ): array {
	$mimes['svg']  = 'image/svg+xml';
	$mimes['svgz'] = 'image/svg+xml';

	return $mimes;
}
add_filter( 'upload_mimes', 'go4taste_recipes_theme_enable_svg_upload' );

/**
 * Fix MIME type check for SVG uploads.
 */
function go4taste_recipes_theme_fix_svg_mime_check( $data, $file, $filename, $mimes ) {
	$filetype = wp_check_filetype( $filename, $mimes );

	return [
		'ext'             => $filetype['ext'],
		'type'            => $filetype['type'],
		'proper_filename' => $data['proper_filename'],
	];
}
add_filter( 'wp_check_filetype_and_ext', 'go4taste_recipes_theme_fix_svg_mime_check', 10, 4 );

/**
 * Add prototype theme class required by design assets.
 */
function go4taste_recipes_theme_body_class( array $classes ): array {
	if ( ! in_array( 'theme-dark', $classes, true ) ) {
		$classes[] = 'theme-dark';
	}

	return $classes;
}
add_filter( 'body_class', 'go4taste_recipes_theme_body_class' );
