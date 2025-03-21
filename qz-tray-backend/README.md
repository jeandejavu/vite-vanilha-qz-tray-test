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
   - Place your certificate files in the `storage/app/certs/superfast/` directory:
     - `cert.pem` - The public certificate
     - `key.pem` - The private key
   - Make sure the storage directory has proper permissions:
     ```bash
     chmod -R 775 storage
     ```

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

## Frontend Integration

Update your frontend QZ Tray integration to use the API for certificate retrieval and data signing.

Example frontend code is provided in `src/qz-tray-service-secure.ts` in the main project.

## Production Deployment

For production:

1. Set `APP_ENV=production` and `APP_DEBUG=false` in `.env`
2. Configure a proper database (MySQL, PostgreSQL, etc.) instead of SQLite
3. Set up a web server (Nginx, Apache) with proper SSL certificates
4. Ensure the certificate and private key files are stored securely with appropriate permissions
