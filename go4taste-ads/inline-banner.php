<?php
/**
 * Theme override template for go4taste-ads/inline-banner block.
 *
 * @var array<string,mixed> $attributes Block attributes.
 * @var string              $content    Block content.
 * @var WP_Block            $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$products_attr = isset( $attributes['products'] ) && is_array( $attributes['products'] ) ? $attributes['products'] : array();
if ( empty( $products_attr ) ) {
    return;
}

$options  = get_option( 'go4taste_ads_options' );
$p_value  = isset( $options['p_parameter_value'] ) ? (string) $options['p_parameter_value'] : '';
$lang     = isset( $options['prestashop_lang'] ) ? (string) $options['prestashop_lang'] : 'pl';
$api_type = isset( $options['api_type'] ) ? (string) $options['api_type'] : 'prestashop_1_5';
$api_url  = isset( $options['api_url'] ) ? (string) $options['api_url'] : '';

$plugin_instance = Go4Taste_Ads::get_instance();
$products_data   = array();

foreach ( $products_attr as $product_entry ) {
    $product_id = isset( $product_entry['id'] ) ? sanitize_text_field( (string) $product_entry['id'] ) : '';
    if ( '' === $product_id ) {
        continue;
    }

    $data = $plugin_instance->fetch_product_data( $product_id, $p_value, $lang, $api_type, $api_url );
    if ( $data ) {
        $products_data[] = $data;
    }
}

if ( empty( $products_data ) ) {
    return;
}
?>
<section class="g4t-ads-strip" aria-labelledby="g4t-ads-title" data-g4t-ads>
    <div class="g4t-ads-strip__top">
        <div class="g4t-ads-strip__text">
            <div class="g4t-ads-strip__brand-row">
                <p class="g4t-ads-strip__brand">GO4TASTE.PL</p>
                <span class="g4t-ads-strip__promo-badge"><?php echo esc_html__( 'Autopromocja', 'go4taste-recipes-theme' ); ?></span>
            </div>
            <h2 id="g4t-ads-title" class="g4t-ads-strip__title"><?php echo esc_html__( 'Produkty ze sklepu', 'go4taste-recipes-theme' ); ?></h2>
            <p class="g4t-ads-strip__desc"><?php echo esc_html__( 'Skladniki dostepne w naszym sklepie', 'go4taste-recipes-theme' ); ?></p>
        </div>
        <div class="g4t-ads-strip__nav-group" hidden>
            <button type="button" class="g4t-ads__nav g4t-ads__nav--prev" aria-label="<?php echo esc_attr__( 'Poprzednie produkty', 'go4taste-recipes-theme' ); ?>" data-g4t-ads-prev disabled aria-disabled="true"><span aria-hidden="true">&larr;</span></button>
            <button type="button" class="g4t-ads__nav g4t-ads__nav--next" aria-label="<?php echo esc_attr__( 'Nastepne produkty', 'go4taste-recipes-theme' ); ?>" data-g4t-ads-next disabled aria-disabled="true"><span aria-hidden="true">&rarr;</span></button>
        </div>
    </div>

    <div class="g4t-ads">
        <div class="g4t-ads__viewport" tabindex="0" role="group" aria-label="<?php echo esc_attr__( 'Lista promowanych produktow', 'go4taste-recipes-theme' ); ?>" data-g4t-ads-viewport>
            <ul class="g4t-ads__track" data-g4t-ads-track>
                <?php foreach ( $products_data as $product_data ) :
                    $link  = isset( $product_data->link ) ? (string) $product_data->link : '';
                    $image = isset( $product_data->picture ) ? (string) $product_data->picture : '';
                    $name  = isset( $product_data->name ) ? (string) $product_data->name : '';
                    $price = isset( $product_data->price ) ? (string) $product_data->price : '';
                    ?>
                    <li class="g4t-product-card">
                        <a class="g4t-product-card__link" href="<?php echo esc_url( $link ); ?>">
                            <figure class="g4t-product-card__figure">
                                <img class="g4t-product-card__image" src="<?php echo esc_url( $image ); ?>" alt="<?php echo esc_attr( $name ); ?>" loading="lazy">
                            </figure>
                            <div class="g4t-product-card__info">
                                <div class="g4t-product-card__top">
                                    <h3 class="g4t-product-card__title"><?php echo esc_html( $name ); ?></h3>
                                </div>
                                <div class="g4t-product-card__bottom">
                                    <p class="g4t-product-card__price"><?php echo esc_html( $price ); ?></p>
                                    <span class="g4t-product-card__cta" aria-hidden="true">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                            <path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path>
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </a>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </div>
</section>
