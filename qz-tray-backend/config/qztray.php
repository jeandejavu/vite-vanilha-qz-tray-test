<?php

return [
    /*
    |--------------------------------------------------------------------------
    | QZ Tray Settings
    |--------------------------------------------------------------------------
    |
    | This file contains configurations for QZ Tray service.
    |
    */

    // Certificate paths relative to storage/app/
    'certificates' => [
        'private_key' => env('QZ_TRAY_PRIVATE_KEY', 'certs/superfast/key.pem'),
        'certificate' => env('QZ_TRAY_CERTIFICATE', 'certs/superfast/cert.pem'),
    ],

    // CORS settings - domains allowed to access the signing API
    'allowed_origins' => array_filter(explode(',', env('QZ_TRAY_ALLOWED_ORIGINS', ''))),
];
