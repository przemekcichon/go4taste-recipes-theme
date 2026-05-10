# The Timber Starter Theme

[![Build Status](https://travis-ci.com/timber/starter-theme.svg?branch=master)](https://travis-ci.com/github/timber/starter-theme)
[![Packagist Version](https://img.shields.io/packagist/v/upstatement/timber-starter-theme?include_prereleases)](https://packagist.org/packages/upstatement/timber-starter-theme)

The "_s" for Timber: a dead-simple theme that you can build from. The primary purpose of this theme is to provide a file structure rather than a framework for markup or styles. Configure your SASS files, scripts, and task runners however you would like!

## Installing the theme

Follow the guide on [how to Install Timber using the Starter Theme](https://timber.github.io/docs/v2/installation/installation/#use-the-starter-theme).

Then,

1. Rename the theme folder to something that makes sense for your website. You could keep the name `timber-starter-theme` but the point of a starter theme is to make it your own!
2. Activate the theme in the WordPress Dashboard under **Appearance → Themes**.
3. Do your thing! And read [the docs](https://timber.github.io/docs/).

## The `StarterSite` class

In **functions.php**, we call `new StarterSite();`. The `StarterSite` class sits in the **src** folder. You can update this class to add functionality to your theme. This approach is just one example for how you could do it.

The **src** folder would be the right place to put your classes that [extend Timber’s functionality](https://timber.github.io/docs/v2/guides/extending-timber/).

Small tip: You can make use of Composer’s [autoloading functionality](https://getcomposer.org/doc/04-schema.md#psr-4) to automatically load your PHP classes when they are requested instead of requiring one by one in **functions.php**.

## What else is there?

- `static/` is where you can keep your static front-end scripts, styles, or images. In other words, your Sass files, JS files, fonts, and SVGs would live here.
- `views/` contains all of your Twig templates. These pretty much correspond 1 to 1 with the PHP files that respond to the WordPress template hierarchy. At the end of each PHP template, you’ll notice a `Timber::render()` function whose first parameter is the Twig file where that data (or `$context`) will be used. Just an FYI.
- `tests/` ... basically don’t worry about (or remove) this unless you know what it is and want to.

## Other Resources

* [This branch](https://github.com/laras126/timber-starter-theme/tree/tackle-box) of the starter theme has some more example code with ACF and a slightly different set up.
* [Twig for Timber Cheatsheet](http://notlaura.com/the-twig-for-timber-cheatsheet/)
* [Timber and Twig Reignited My Love for WordPress](https://css-tricks.com/timber-and-twig-reignited-my-love-for-wordpress/) on CSS-Tricks
* [A real live Timber theme](https://github.com/laras126/yuling-theme).
* [Timber Video Tutorials](http://timber.github.io/timber/#video-tutorials) and [an incomplete set of screencasts](https://www.youtube.com/playlist?list=PLuIlodXmVQ6pkqWyR6mtQ5gQZ6BrnuFx-) for building a Timber theme from scratch.

## Deployment without Composer

This repository is configured for servers where Composer is not available during deployment.

1. Keep `vendor/` in the repository and deploy it together with the theme files.
2. Keep `composer.lock` in the repository to preserve reproducible dependency versions.
3. Deploy the full theme directory as-is (including `vendor/`) to `wp-content/themes/go4taste-recipes-theme/`.
4. Do not run `composer install` on the production server.

Reason: `functions.php` loads `vendor/autoload.php` directly, so missing `vendor/` will cause a fatal error.

## Release Checklist (No Composer on Server)

Before each production deployment:

1. Confirm repository is clean: `git status`.
2. Pull latest changes: `git pull --ff-only`.
3. Verify `vendor/` exists and includes `autoload.php`.
4. Verify `composer.lock` is present in the commit.
5. Smoke test key templates locally (home, archive, single recipe).
6. Push release commit to `main`.
7. Deploy full theme directory, including `vendor/`.
8. After deploy, open one recipe page and confirm no PHP fatal errors.

## Release Notes Template

Use this template for each new tag/release:

```md
# go4taste-recipes-theme vX.Y.Z

Release date: YYYY-MM-DD
Tag: vX.Y.Z

## Summary
- Short description of the release purpose.

## Added
- New feature A
- New feature B

## Changed
- Updated behavior A
- Updated styling B

## Fixed
- Bug fix A
- Bug fix B

## Deployment Notes
- Deployment mode: no Composer on server.
- Confirm `vendor/` and `composer.lock` are included in deployed files.
- Smoke test: home, archive, single recipe.

## Rollback
- Roll back to previous tag: `git checkout <previous-tag>`
```
