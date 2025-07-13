<?php

/**
 * Returns the importmap for this application.
 *
 * - "path" is a path inside the asset mapper system. Use the
 *     "debug:asset-map" command to see the full list of paths.
 *
 * - "entrypoint" (JavaScript only) set to true for any module that will
 *     be used as an "entrypoint" (and passed to the importmap() Twig function).
 *
 * The "importmap:require" command can be used to add new entries to this file.
 */
return [
    'app' => [
        'path' => './assets/app.js',
        'entrypoint' => true,
    ],
    '@hotwired/stimulus' => [
        'version' => '3.2.2',
    ],
    '@symfony/stimulus-bundle' => [
        'path' => './vendor/symfony/stimulus-bundle/assets/dist/loader.js',
    ],
    '@hotwired/turbo' => [
        'version' => '7.3.0',
    ],
    'sortablejs' => [
        'version' => '1.15.6',
    ],
    '@material-tailwind/html' => [
        'version' => '3.0.0-beta.7',
    ],
    '@atlaskit/pragmatic-drag-and-drop/element/adapter' => [
        'version' => '1.7.4',
    ],
    '@babel/runtime/helpers/slicedToArray' => [
        'version' => '7.27.6',
    ],
    '@babel/runtime/helpers/defineProperty' => [
        'version' => '7.27.6',
    ],
    '@babel/runtime/helpers/toConsumableArray' => [
        'version' => '7.27.6',
    ],
    'bind-event-listener' => [
        'version' => '3.0.0',
    ],
    'raf-schd' => [
        'version' => '4.0.3',
    ],
    'react' => [
        'version' => '18.2.0',
    ],
    'react-dom' => [
        'version' => '18.2.0',
    ],
    'scheduler' => [
        'version' => '0.23.2',
    ],
    '@symfony/ux-react' => [
        'path' => './vendor/symfony/ux-react/assets/dist/loader.js',
    ],
    '@material-tailwind/react' => [
        'version' => '2.1.10',
    ],
    'classnames' => [
        'version' => '2.3.2',
    ],
    'tailwind-merge' => [
        'version' => '1.8.1',
    ],
    'prop-types' => [
        'version' => '15.8.1',
    ],
    'deepmerge' => [
        'version' => '4.2.2',
    ],
    'framer-motion' => [
        'version' => '6.5.1',
    ],
    'material-ripple-effects' => [
        'version' => '2.0.1',
    ],
    '@floating-ui/react' => [
        'version' => '0.19.0',
    ],
    'tslib' => [
        'version' => '2.4.0',
    ],
    'hey-listen' => [
        'version' => '1.0.8',
    ],
    'style-value-types' => [
        'version' => '5.0.0',
    ],
    'popmotion' => [
        'version' => '11.0.3',
    ],
    'framesync' => [
        'version' => '6.0.1',
    ],
    '@motionone/dom' => [
        'version' => '10.12.0',
    ],
    'aria-hidden' => [
        'version' => '1.2.2',
    ],
    'tabbable' => [
        'version' => '6.0.1',
    ],
    '@floating-ui/react-dom' => [
        'version' => '1.2.2',
    ],
    '@floating-ui/dom' => [
        'version' => '1.7.2',
    ],
    '@motionone/types' => [
        'version' => '10.12.0',
    ],
    '@motionone/utils' => [
        'version' => '10.12.0',
    ],
    '@motionone/animation' => [
        'version' => '10.12.0',
    ],
    '@motionone/generators' => [
        'version' => '10.12.0',
    ],
    '@floating-ui/core' => [
        'version' => '1.7.2',
    ],
    '@floating-ui/utils' => [
        'version' => '0.2.10',
    ],
    '@floating-ui/utils/dom' => [
        'version' => '0.2.10',
    ],
    '@motionone/easing' => [
        'version' => '10.12.0',
    ],
];
