<?php

namespace App\Http\Controllers;

use App\Services\QzTrayService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Exception;

class QzTrayController extends Controller
{
    protected $qzTrayService;

    public function __construct(QzTrayService $qzTrayService)
    {
        $this->qzTrayService = $qzTrayService;
    }

    /**
     * Get the certificate for QZ Tray
     *
     * @return JsonResponse
     */
    public function getCertificate(): JsonResponse
    {
        try {
            $certificate = $this->qzTrayService->getCertificate();

            if (!$certificate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Certificate not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'certificate' => $certificate
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving certificate: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sign data for QZ Tray
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function signData(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'data' => 'required|string'
            ]);

            $data = $request->input('data');
            $signature = $this->qzTrayService->signData($data);

            return response()->json([
                'success' => true,
                'signature' => $signature
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error signing data: ' . $e->getMessage()
            ], 500);
        }
    }
}
