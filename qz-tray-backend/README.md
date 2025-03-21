# QZ Tray Backend

This Laravel application provides a secure backend for QZ Tray printing operations by moving the private key and signing process from the frontend to a secure backend server.

## Security Benefits

- Private key is stored securely on the server, not exposed in frontend code
- Signing operations are performed server-side
- CORS protection limits which domains can access the signing API
- Environment variables for configuration

## Requirements

- PHP 8.2+
- Composer
- SSL certificates for QZ Tray

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   composer install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
4. Add your QZ Tray certificates:
   - Place your certificate files in the correct directory structure:
     ```bash
     # Create the directories
     mkdir -p storage/app/private/certs/superfast
     
     # Copy your certificates to this directory
     cp /path/to/your/cert.pem storage/app/private/certs/superfast/
     cp /path/to/your/key.pem storage/app/private/certs/superfast/
     ```
   - Make sure the storage directory has proper permissions:
     ```bash
     chmod -R 775 storage
     ```

   > **Important**: The certificates must be placed in `storage/app/private/certs/superfast/` for the storage system to find them correctly.

5. Configure QZ Tray settings in `.env`:
   ```
   QZ_TRAY_PRIVATE_KEY=certs/superfast/key.pem
   QZ_TRAY_CERTIFICATE=certs/superfast/cert.pem
   QZ_TRAY_ALLOWED_ORIGINS=http://localhost:3000,http://your-frontend-domain.com
   ```

6. Start the server:
   ```bash
   php artisan serve
   ```

## API Endpoints

- `GET /api/qz-tray/certificate` - Retrieves the certificate for QZ Tray
- `POST /api/qz-tray/sign` - Signs data for QZ Tray communications
  - Request body: `{ "data": "string-to-sign" }`
  - Response: `{ "success": true, "signature": "base64-signature" }`

## Testing the API

You can test the API endpoints using cURL:

```bash
# Test certificate endpoint
curl -v http://localhost:8000/api/qz-tray/certificate

# Test sign endpoint
curl -v -X POST -H "Content-Type: application/json" \
  -d '{"data":"test data to sign"}' \
  http://localhost:8000/api/qz-tray/sign
```

## Frontend Integration

Update your frontend QZ Tray integration to use the API for certificate retrieval and data signing.

Example frontend code is provided in `src/qz-tray-service-secure.ts` in the main project.

## Troubleshooting

If you encounter "Certificate not found" errors:
1. Check that the certificate files are in the correct path: `storage/app/private/certs/superfast/`
2. Verify file permissions: `chmod 644 storage/app/private/certs/superfast/*.pem`
3. Clear Laravel's cache: `php artisan cache:clear && php artisan config:clear`
4. Check the logs: `tail -f storage/logs/laravel.log`

See `SOLUTION.md` for details on how path-related issues were resolved.

## Production Deployment

For production:

1. Set `APP_ENV=production` and `APP_DEBUG=false` in `.env`
2. Configure a proper database (MySQL, PostgreSQL, etc.) instead of SQLite
3. Set up a web server (Nginx, Apache) with proper SSL certificates
4. Ensure the certificate and private key files are stored securely with appropriate permissions
