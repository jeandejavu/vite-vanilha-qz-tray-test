<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Config;
use Exception;

class QzTrayService
{
    private $privateKeyPath;
    private $certificatePath;

    public function __construct()
    {
        $this->privateKeyPath = Config::get('qztray.certificates.private_key', 'certs/superfast/key.pem');
        $this->certificatePath = Config::get('qztray.certificates.certificate', 'certs/superfast/cert.pem');
    }

    /**
     * Sign data using the private key
     *
     * @param string $data The data to sign
     * @return string Base64 encoded signature
     * @throws Exception If signing fails
     */
    public function signData(string $data): string
    {
        try {
            // Check if private key exists
            if (!Storage::exists($this->privateKeyPath)) {
                throw new Exception('Private key not found');
            }

            // Get private key contents
            $privateKey = Storage::get($this->privateKeyPath);

            // Create signature
            $signature = null;
            $privateKeyResource = openssl_pkey_get_private($privateKey);

            if (!$privateKeyResource) {
                throw new Exception('Unable to load private key: ' . openssl_error_string());
            }

            // Create signature
            $signSuccess = openssl_sign($data, $signature, $privateKeyResource, OPENSSL_ALGO_SHA1);

            // Free the key resource
            openssl_free_key($privateKeyResource);

            if (!$signSuccess) {
                throw new Exception('Failed to create signature: ' . openssl_error_string());
            }

            // Return base64 encoded signature
            return base64_encode($signature);
        } catch (Exception $e) {
            // Log the error
            logger()->error('Error signing data: ' . $e->getMessage());

            // Re-throw for controller to handle
            throw $e;
        }
    }

    /**
     * Get the certificate content
     *
     * @return string|null Certificate content or null if not found
     */
    public function getCertificate(): ?string
    {
        if (Storage::exists($this->certificatePath)) {
            return Storage::get($this->certificatePath);
        }

        return null;
    }
}
