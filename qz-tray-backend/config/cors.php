<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // In development, you might want to allow all origins
    'allowed_origins' => ['*'],

    // Or if you want to be more specific (use this in production)
    'allowed_origins' => array_merge(
        ['http://localhost:3000', 'http://localhost:8000', 'http://127.0.0.1:5173', 'http://localhost:5173'],
        config('qztray.allowed_origins', [])
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false, // Set to false if you're not using cookies or authentication for API

];
