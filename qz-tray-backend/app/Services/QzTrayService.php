<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Exception;

class QzTrayService
{
    private $privateKeyPath;
    private $certificatePath;
    private $disk;

    public function __construct()
    {
        $this->privateKeyPath = Config::get('qztray.certificates.private_key', 'certs/superfast/key.pem');
        $this->certificatePath = Config::get('qztray.certificates.certificate', 'certs/superfast/cert.pem');
        $this->disk = Storage::disk('local'); // Explicitly use local disk

        Log::info('QzTrayService initialized', [
            'privateKeyPath' => $this->privateKeyPath,
            'certificatePath' => $this->certificatePath,
            'privateKeyExists' => $this->disk->exists($this->privateKeyPath),
            'certificateExists' => $this->disk->exists($this->certificatePath),
            'diskRoot' => $this->disk->path(''),
            'fullPrivateKeyPath' => $this->disk->path($this->privateKeyPath),
            'fullCertificatePath' => $this->disk->path($this->certificatePath)
        ]);
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
            if (!$this->disk->exists($this->privateKeyPath)) {
                Log::error('Private key not found', [
                    'path' => $this->privateKeyPath,
                    'fullPath' => $this->disk->path($this->privateKeyPath),
                    'filesInCertsFolder' => $this->disk->files('certs/superfast')
                ]);
                throw new Exception('Private key not found');
            }

            // Get private key contents
            $privateKey = $this->disk->get($this->privateKeyPath);

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
            Log::error('Error signing data: ' . $e->getMessage());

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
        // List files in the directory for debugging
        $filesInDir = $this->disk->files('certs/superfast');
        Log::info('Files in certs directory', [
            'certificatePath' => $this->certificatePath,
            'filesInDir' => $filesInDir,
            'exists' => $this->disk->exists($this->certificatePath),
            'fullPath' => $this->disk->path($this->certificatePath)
        ]);

        if ($this->disk->exists($this->certificatePath)) {
            return $this->disk->get($this->certificatePath);
        }

        // Try to directly access the file as a fallback
        try {
            $fullPath = $this->disk->path($this->certificatePath);
            if (file_exists($fullPath)) {
                Log::info('Found certificate using file_exists', ['path' => $fullPath]);
                return file_get_contents($fullPath);
            }
        } catch (Exception $e) {
            Log::error('Error accessing certificate directly: ' . $e->getMessage());
        }

        return null;
    }
}
