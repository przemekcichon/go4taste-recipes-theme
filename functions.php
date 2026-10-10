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
 * Return the current absolute URL.
 */
function go4taste_recipes_theme_current_url(): string {
	if ( class_exists( '\Timber\URLHelper' ) ) {
		$current_url = \Timber\URLHelper::get_current_url();
		if ( is_string( $current_url ) && '' !== $current_url ) {
			return $current_url;
		}
	}

	$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( (string) $_SERVER['REQUEST_URI'] ) : '/';
	return home_url( $request_uri );
}

/**
 * Format stored recipe time value (minutes) to human-readable string.
 *
 * Accepts current numeric contract (e.g. "80") and legacy values
 * like "1 h 20 min" for backward compatibility.
 *
 * @param mixed $value Raw time value from view model.
 */
function go4taste_recipes_theme_format_minutes_human( $value ): string {
	if ( ! is_scalar( $value ) ) {
		return '-';
	}

	$raw = trim( (string) $value );
	if ( '' === $raw ) {
		return '-';
	}

	$total_minutes = 0;

	if ( ctype_digit( $raw ) ) {
		$total_minutes = (int) $raw;
	} else {
		$input = strtolower( $raw );
		$hours = 0;
		$mins  = 0;

		if ( preg_match( '/(\d+)\s*h/', $input, $hours_match ) ) {
			$hours = (int) $hours_match[1];
		}

		if ( preg_match( '/(\d+)\s*min/', $input, $mins_match ) ) {
			$mins = (int) $mins_match[1];
		}

		$total_minutes = ( $hours * 60 ) + $mins;

		if ( $total_minutes <= 0 && is_numeric( $raw ) ) {
			$total_minutes = (int) $raw;
		}
	}

	if ( $total_minutes <= 0 ) {
		return '-';
	}

	$hours = (int) floor( $total_minutes / 60 );
	$mins  = $total_minutes % 60;

	if ( $hours > 0 && $mins > 0 ) {
		return $hours . ' h ' . $mins . ' min';
	}

	if ( $hours > 0 ) {
		return $hours . ' h';
	}

	return $mins . ' min';
}

/**
 * Register the FacetWP facets required by the recipe quick actions filter.
 *
 * These facets are intentionally defined in code so the theme owns the facet
 * contract and the FacetWP admin can keep them locked.
 *
 * @param array<int,array<string,mixed>> $facets Existing FacetWP facets.
 * @return array<int,array<string,mixed>>
 */
function go4taste_recipes_theme_register_facetwp_facets( array $facets ): array {
	if ( ! defined( 'G4T_MEAL_TYPE_TAXONOMY' ) ) {
		return $facets;
	}

	$code_facets = array(
		array(
			'label'          => __( 'Typ dania', 'go4taste-recipes-theme' ),
			'name'           => 'g4t_meal_type',
			'type'           => 'checkboxes',
			'source'         => 'tax/' . G4T_MEAL_TYPE_TAXONOMY,
			'parent_term'    => '',
			'hierarchical'   => 'no',
			'orderby'        => 'display_value',
			'count'          => '-1',
			'show_expanded'  => 'no',
			'ghosts'         => 'no',
			'preserve_ghosts'=> 'no',
			'operator'       => 'or',
			'soft_limit'     => '-1',
			'_code'          => true,
		),
		array(
			'label'          => __( 'Czas przygotowania', 'go4taste-recipes-theme' ),
			'name'           => 'g4t_prep_time',
			'type'           => 'checkboxes',
			'source'         => 'tax/' . G4T_PREP_TIME_TAXONOMY,
			'parent_term'    => '',
			'hierarchical'   => 'no',
			'orderby'        => 'display_value',
			'count'          => '-1',
			'show_expanded'  => 'no',
			'ghosts'         => 'no',
			'preserve_ghosts'=> 'no',
			'operator'       => 'or',
			'soft_limit'     => '-1',
			'_code'          => true,
		),
		array(
			'label'          => __( 'Cechy', 'go4taste-recipes-theme' ),
			'name'           => 'g4t_feature',
			'type'           => 'checkboxes',
			'source'         => 'tax/' . G4T_FEATURE_TAXONOMY,
			'parent_term'    => '',
			'hierarchical'   => 'no',
			'orderby'        => 'display_value',
			'count'          => '-1',
			'show_expanded'  => 'no',
			'ghosts'         => 'no',
			'preserve_ghosts'=> 'no',
			'operator'       => 'or',
			'soft_limit'     => '-1',
			'_code'          => true,
		),
		array(
			'label'          => __( 'Składniki', 'go4taste-recipes-theme' ),
			'name'           => 'g4t_ingredients',
			'type'           => 'checkboxes',
			'source'         => 'tax/' . G4T_INGREDIENT_TAXONOMY,
			'parent_term'    => '',
			'hierarchical'   => 'no',
			'orderby'        => 'display_value',
			'count'          => '-1',
			'show_expanded'  => 'no',
			'ghosts'         => 'no',
			'preserve_ghosts'=> 'no',
			'operator'       => 'or',
			'soft_limit'     => '-1',
			'_code'          => true,
		),
	);

	$registered_names = wp_list_pluck( $code_facets, 'name' );

	foreach ( $facets as $facet_index => $facet ) {
		if ( ! is_array( $facet ) || ! isset( $facet['name'] ) ) {
			continue;
		}

		if ( in_array( (string) $facet['name'], $registered_names, true ) ) {
			unset( $facets[ $facet_index ] );
		}
	}

	foreach ( $code_facets as $facet ) {
		$facets[] = $facet;
	}

	return array_values( $facets );
}

add_filter( 'facetwp_facets', 'go4taste_recipes_theme_register_facetwp_facets', 10, 1 );

/**
 * Check whether the current request should be treated as a recipe listing.
 */
function go4taste_recipes_theme_is_listing_request(): bool {
	$source_post_type = apply_filters( 'go4taste/recipes/source_post_type', 'post' );

	if ( is_home() || is_front_page() ) {
		return true;
	}

	if ( is_category() ) {
		return true;
	}

	if ( is_post_type_archive( $source_post_type ) ) {
		return true;
	}

	if ( is_tax() ) {
		$queried_object = get_queried_object();
		if ( $queried_object instanceof WP_Term ) {
			$taxonomy = get_taxonomy( $queried_object->taxonomy );
			if ( $taxonomy && is_array( $taxonomy->object_type ) && in_array( $source_post_type, $taxonomy->object_type, true ) ) {
				return true;
			}
		}
	}

	if ( is_archive() && apply_filters( 'go4taste/recipes/use_archive_template', false, get_queried_object() ) ) {
		return true;
	}

	return false;
}

/**
 * Read selected facet values from the current request.
 *
 * @param string $param Query parameter name.
 * @return array<int,string>
 */
function go4taste_recipes_theme_get_request_values( string $param ): array {
	if ( '' === $param || ! isset( $_GET[ $param ] ) ) {
		return array();
	}

	$raw_value = wp_unslash( (string) $_GET[ $param ] );
	if ( '' === $raw_value ) {
		return array();
	}

	$values = array_map( 'sanitize_title', explode( ',', $raw_value ) );
	$values = array_filter(
		array_unique( $values ),
		static function ( string $value ): bool {
			return '' !== $value;
		}
	);

	return array_values( $values );
}

/**
 * Build a tax_query clause from selected facet values.
 *
 * @param array<string,array<int,string>> $facets Selected facet values.
 * @return array<int,array<string,mixed>>
 */
function go4taste_recipes_theme_build_tax_query_from_facets( array $facets ): array {
	$facet_taxonomies = array(
		'mealType'    => G4T_MEAL_TYPE_TAXONOMY,
		'prepTime'    => G4T_PREP_TIME_TAXONOMY,
		'feature'     => G4T_FEATURE_TAXONOMY,
		'ingredients' => G4T_INGREDIENT_TAXONOMY,
	);
	$facet_key_aliases = array(
		'mealType'    => array( 'mealType', 'g4t_meal_type' ),
		'prepTime'    => array( 'prepTime', 'g4t_prep_time' ),
		'feature'     => array( 'feature', 'g4t_feature' ),
		'ingredients' => array( 'ingredients', 'g4t_ingredients' ),
	);

	$tax_query = array();

	foreach ( $facet_taxonomies as $facet_key => $taxonomy ) {
		$values = array();

		foreach ( $facet_key_aliases[ $facet_key ] ?? array( $facet_key ) as $facet_key_alias ) {
			if ( isset( $facets[ $facet_key_alias ] ) && is_array( $facets[ $facet_key_alias ] ) ) {
				$values = $facets[ $facet_key_alias ];
				break;
			}
		}

		$values = array_values(
			array_filter(
				array_map( 'sanitize_title', $values ),
				static function ( string $value ): bool {
					return '' !== $value;
				}
			)
		);

		if ( empty( $values ) ) {
			continue;
		}

		$tax_query[] = array(
			'taxonomy' => $taxonomy,
			'field'    => 'slug',
			'terms'    => $values,
			'operator' => 'IN',
		);
	}

	if ( count( $tax_query ) > 1 ) {
		$tax_query['relation'] = 'AND';
	}

	return $tax_query;
}

/**
 * Calculate the number of posts matching the selected quick-actions facets.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response
 */
function go4taste_recipes_theme_rest_filter_count( WP_REST_Request $request ): WP_REST_Response {
	$facets = $request->get_param( 'facets' );
	if ( ! is_array( $facets ) ) {
		$facets = array();
	}

	$query_args = array(
		'post_type'           => apply_filters( 'go4taste/recipes/source_post_type', 'post' ),
		'post_status'         => 'publish',
		'posts_per_page'      => 1,
		'no_found_rows'       => false,
		'ignore_sticky_posts' => true,
		'fields'              => 'ids',
	);

	$tax_query = go4taste_recipes_theme_build_tax_query_from_facets( $facets );
	if ( ! empty( $tax_query ) ) {
		$query_args['tax_query'] = $tax_query;
	}

	$query = new WP_Query( $query_args );

	return new WP_REST_Response(
		array(
			'total_rows' => (int) $query->found_posts,
		),
		200
	);
}

/**
 * Register the quick-actions count endpoint.
 */
function go4taste_recipes_theme_register_rest_routes(): void {
	register_rest_route(
		'go4taste-recipes/v1',
		'/filter-count',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'go4taste_recipes_theme_rest_filter_count',
			'permission_callback' => '__return_true',
		)
	);
}

add_action( 'rest_api_init', 'go4taste_recipes_theme_register_rest_routes' );

/**
 * Filter the main recipe query using the same URL params as the Quick Actions Bar.
 */
function go4taste_recipes_theme_filter_listing_query( WP_Query $query ): void {
	if ( is_admin() || ! $query->is_main_query() || ! go4taste_recipes_theme_is_listing_request() ) {
		return;
	}

	$source_post_type = apply_filters( 'go4taste/recipes/source_post_type', 'post' );
	$query->set( 'post_type', $source_post_type );

	$tax_query = $query->get( 'tax_query' );
	if ( ! is_array( $tax_query ) ) {
		$tax_query = array();
	}

	$facet_taxonomies = array(
		'g4t_meal_type'   => G4T_MEAL_TYPE_TAXONOMY,
		'g4t_prep_time'   => G4T_PREP_TIME_TAXONOMY,
		'g4t_feature'     => G4T_FEATURE_TAXONOMY,
		'g4t_ingredients' => G4T_INGREDIENT_TAXONOMY,
	);

	foreach ( $facet_taxonomies as $param => $taxonomy ) {
		$values = go4taste_recipes_theme_get_request_values( $param );
		if ( empty( $values ) ) {
			continue;
		}

		$tax_query[] = array(
			'taxonomy' => $taxonomy,
			'field'    => 'slug',
			'terms'    => $values,
			'operator' => 'IN',
		);
	}

	if ( count( $tax_query ) > 1 ) {
		$tax_query['relation'] = 'AND';
	}

	$query->set( 'tax_query', $tax_query );
}

add_action( 'pre_get_posts', 'go4taste_recipes_theme_filter_listing_query' );

/**
 * Add tax_query to home query args based on URL params.
 */
function go4taste_recipes_theme_filter_home_query_args( array $args ): array {
	if ( ! go4taste_recipes_theme_is_listing_request() ) {
		return $args;
	}

	$facet_taxonomies = array(
		'g4t_meal_type'   => G4T_MEAL_TYPE_TAXONOMY,
		'g4t_prep_time'   => G4T_PREP_TIME_TAXONOMY,
		'g4t_feature'     => G4T_FEATURE_TAXONOMY,
		'g4t_ingredients' => G4T_INGREDIENT_TAXONOMY,
	);

	$tax_query = isset( $args['tax_query'] ) && is_array( $args['tax_query'] ) ? $args['tax_query'] : array();

	foreach ( $facet_taxonomies as $param => $taxonomy ) {
		$values = go4taste_recipes_theme_get_request_values( $param );
		if ( empty( $values ) ) {
			continue;
		}

		$tax_query[] = array(
			'taxonomy' => $taxonomy,
			'field'    => 'slug',
			'terms'    => $values,
			'operator' => 'IN',
		);
	}

	if ( count( $tax_query ) > 1 ) {
		$tax_query['relation'] = 'AND';
	}

	if ( ! empty( $tax_query ) ) {
		$args['tax_query'] = $tax_query;
	}

	return $args;
}

add_filter( 'go4taste/recipes/home_query_args', 'go4taste_recipes_theme_filter_home_query_args' );

/**
 * Build filter options from taxonomy terms for the quick actions panel.
 *
 * @param string $taxonomy Taxonomy slug.
 * @param bool   $hide_empty Whether to hide empty terms.
 * @return array<int,array<string,string>>
 */
function go4taste_recipes_theme_get_filter_options_from_taxonomy( string $taxonomy, bool $hide_empty = true ): array {
	if ( '' === $taxonomy || ! taxonomy_exists( $taxonomy ) ) {
		return array();
	}

	$terms = get_terms(
		array(
			'taxonomy'   => $taxonomy,
			'hide_empty' => $hide_empty,
		)
	);

	if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
		return array();
	}

	$options = array();

	foreach ( $terms as $term ) {
		if ( ! $term instanceof WP_Term ) {
			continue;
		}

		$options[] = array(
			'value' => (string) $term->slug,
			'label' => (string) $term->name,
		);
	}

	return $options;
}

/**
 * Return quick-actions filter option payload passed to JavaScript.
 *
 * @return array<string,array<int,array<string,string>>>
 */
function go4taste_recipes_theme_get_quick_actions_filter_options(): array {
	$meal_type_taxonomy   = defined( 'G4T_MEAL_TYPE_TAXONOMY' ) ? (string) G4T_MEAL_TYPE_TAXONOMY : 'recipe_meal_type';
	$prep_time_taxonomy   = defined( 'G4T_PREP_TIME_TAXONOMY' ) ? (string) G4T_PREP_TIME_TAXONOMY : 'recipe_prep_time_range';
	$feature_taxonomy     = defined( 'G4T_FEATURE_TAXONOMY' ) ? (string) G4T_FEATURE_TAXONOMY : 'recipe_feature';
	$ingredient_taxonomy  = defined( 'G4T_INGREDIENT_TAXONOMY' ) ? (string) G4T_INGREDIENT_TAXONOMY : 'recipe_ingredient';

	return array(
		'mealType'    => go4taste_recipes_theme_get_filter_options_from_taxonomy( $meal_type_taxonomy ),
		'prepTime'    => go4taste_recipes_theme_get_filter_options_from_taxonomy( $prep_time_taxonomy ),
		'feature'     => go4taste_recipes_theme_get_filter_options_from_taxonomy( $feature_taxonomy, false ),
		'ingredients' => go4taste_recipes_theme_get_filter_options_from_taxonomy( $ingredient_taxonomy ),
	);
}

/**
 * Resolve recipe creator page URL by assigned page template slug.
 */
function go4taste_recipes_theme_get_recipe_creator_page_url(): string {
	$pages = get_posts(
		array(
			'post_type'      => 'page',
			'post_status'    => array( 'publish', 'private' ),
			'posts_per_page' => 1,
			'meta_key'       => '_wp_page_template',
			'meta_value'     => 'g4t-recipe-creator',
			'orderby'        => 'menu_order title',
			'order'          => 'ASC',
			'fields'         => 'ids',
		)
	);

	if ( empty( $pages ) || ! is_array( $pages ) ) {
		return '';
	}

	$page_id = (int) $pages[0];
	if ( $page_id <= 0 ) {
		return '';
	}

	$permalink = get_permalink( $page_id );
	return is_string( $permalink ) ? $permalink : '';
}

/**
 * Build quick actions recipe edit config for single recipe views.
 *
 * @param string $source_post_type Source recipe post type.
 * @return array{enabled:bool,url:string}
 */
function go4taste_recipes_theme_get_recipe_edit_quick_action( string $source_post_type ): array {
	if ( ! is_singular( $source_post_type ) ) {
		return array(
			'enabled' => false,
			'url'     => '',
		);
	}

	$post_id = get_queried_object_id();
	if ( $post_id <= 0 ) {
		return array(
			'enabled' => false,
			'url'     => '',
		);
	}

	$can_create = function_exists( 'g4t_current_user_can_create_recipe' )
		? g4t_current_user_can_create_recipe()
		: current_user_can( 'edit_posts' );

	$can_edit_this = function_exists( 'g4t_can_user_edit_recipe' )
		? g4t_can_user_edit_recipe( (int) $post_id )
		: current_user_can( 'edit_post', $post_id );

	if ( ! $can_create || ! $can_edit_this ) {
		return array(
			'enabled' => false,
			'url'     => '',
		);
	}

	$creator_page_url = go4taste_recipes_theme_get_recipe_creator_page_url();
	if ( '' === $creator_page_url ) {
		return array(
			'enabled' => false,
			'url'     => '',
		);
	}

	return array(
		'enabled' => true,
		'url'     => add_query_arg( 'post_id', (string) $post_id, $creator_page_url ),
	);
}

/**
 * Build quick actions add-recipe config for users who can create recipes.
 *
 * Shown on all page types (archive, home, single) — not just single recipe.
 *
 * @return array{enabled:bool,url:string}
 */
function go4taste_recipes_theme_get_recipe_add_quick_action(): array {
	$can_create = function_exists( 'g4t_current_user_can_create_recipe' )
		? g4t_current_user_can_create_recipe()
		: current_user_can( 'edit_posts' );

	if ( ! $can_create ) {
		return array(
			'enabled' => false,
			'url'     => '',
		);
	}

	$creator_page_url = go4taste_recipes_theme_get_recipe_creator_page_url();
	if ( '' === $creator_page_url ) {
		return array(
			'enabled' => false,
			'url'     => '',
		);
	}

	return array(
		'enabled' => true,
		'url'     => $creator_page_url,
	);
}

/**
 * Concatenate theme stylesheets from assets/css for inline output.
 *
 * @param string[] $files File names relative to assets/css, in cascade order.
 */
function go4taste_recipes_theme_get_inline_css( array $files ): string {
	$css_dir = get_template_directory() . '/assets/css/';
	$css     = '';

	foreach ( $files as $file ) {
		$contents = file_get_contents( $css_dir . $file );

		if ( false !== $contents ) {
			// A UTF-8 BOM is ignored in a linked file but would break the first selector inline.
			$css .= preg_replace( '/^\xEF\xBB\xBF/', '', $contents ) . "\n";
		}
	}

	return $css;
}

/**
 * Enqueue full prototype assets for recipe views.
 */
function go4taste_recipes_theme_enqueue_assets() {
	$source_post_type = apply_filters( 'go4taste/recipes/source_post_type', 'post' );
	$use_recipe_archive_template = apply_filters( 'go4taste/recipes/use_archive_template', false, get_queried_object() );

	$is_recipe_single = is_singular( $source_post_type );
	$is_recipe_archive = is_post_type_archive( $source_post_type ) || ( is_archive() && $use_recipe_archive_template );
	$is_recipe_home = is_home() || is_front_page();
	$is_404 = is_404();

	if ( ! $is_recipe_single && ! $is_recipe_archive && ! $is_recipe_home && ! $is_404 ) {
		return;
	}

	$theme_version = wp_get_theme()->get( 'Version' );
	$base_uri      = get_template_directory_uri() . '/assets';
	$quick_actions_version = filemtime( get_template_directory() . '/assets/js/quick-actions-bar.js' );

	wp_enqueue_style(
		'go4taste-recipes-fonts',
		'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&family=Fira+Sans+Condensed:wght@400;600;700&display=swap',
		array(),
		null,
		'all'
	);

	// Theme CSS is printed inline in <head> instead of as separate render-blocking files.
	// Order matters: it is the cascade order the files had as linked stylesheets.
	$css_files = array( 'main.css' );

	if ( $is_recipe_single ) {
		array_push(
			$css_files,
			'single-recipe.css',
			'single-recipe-ingredients.css',
			'single-recipe-steps.css',
			'single-recipe-go4taste-ads.css',
			'single-recipe-hero.css'
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

	if ( $is_recipe_archive || $is_recipe_home || $is_404 ) {
		array_push(
			$css_files,
			'archive-recipes.css',
			'archive-recipes-hero.css',
			'archive-recipes-go4taste-ads.css'
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
		array_push( $css_files, 'home-hero.css', 'home.css' );
	}

	$css_files[] = 'quick-actions-bar.css';

	wp_register_style( 'go4taste-recipes-theme', false, array( 'go4taste-recipes-fonts' ), null );
	wp_enqueue_style( 'go4taste-recipes-theme' );
	wp_add_inline_style( 'go4taste-recipes-theme', go4taste_recipes_theme_get_inline_css( $css_files ) );

	wp_enqueue_script(
		'go4taste-recipes-quick-actions-bar',
		$base_uri . '/js/quick-actions-bar.js',
		array(),
		$quick_actions_version ? (string) $quick_actions_version : $theme_version,
		true
	);

	wp_localize_script(
		'go4taste-recipes-quick-actions-bar',
		'go4tasteQuickActionsConfig',
		array(
			'options'        => go4taste_recipes_theme_get_quick_actions_filter_options(),
			'recipeEdit'     => go4taste_recipes_theme_get_recipe_edit_quick_action( (string) $source_post_type ),
			'recipeAdd'      => go4taste_recipes_theme_get_recipe_add_quick_action(),
			'filterCountUrl' => esc_url_raw( rest_url( 'go4taste-recipes/v1/filter-count' ) ),
		)
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
