'use client';

import { useState, useEffect } from 'react';

export default function OAuthDebugPage() {
    const [debugInfo, setDebugInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testOAuthFlow = async () => {
        setLoading(true);
        try {
            // Test backend connectivity and OAuth config
            const [oauthResponse, usersResponse] = await Promise.all([
                fetch('http://localhost:8080/api/oauth-test'),
                fetch('http://localhost:8080/api/debug/users')
            ]);

            const oauthData = await oauthResponse.json();
            const usersData = await usersResponse.json();

            setDebugInfo({
                oauth: oauthData,
                users: usersData
            });
        } catch (error) {
            console.error('Debug error:', error);
            setDebugInfo({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const initiateGoogleLogin = () => {
        // Direct redirect to Google OAuth
        window.location.href = 'http://localhost:8080/api/auth/google';
    };

    useEffect(() => {
        testOAuthFlow();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">OAuth Debug Page</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* OAuth Test */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Google OAuth Test</h2>
                        <button
                            onClick={initiateGoogleLogin}
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
                        >
                            🚀 Start Google OAuth Flow
                        </button>

                        <div className="space-y-2 text-sm">
                            <p><strong>Backend URL:</strong> http://localhost:8080</p>
                            <p><strong>OAuth Endpoint:</strong> /api/auth/google</p>
                            <p><strong>Callback:</strong> /api/auth/google/callback</p>
                        </div>
                    </div>

                    {/* Debug Info */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                                {JSON.stringify(debugInfo, null, 2)}
                            </pre>
                        )}
                        <button
                            onClick={testOAuthFlow}
                            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            🔄 Refresh Debug Info
                        </button>
                    </div>

                    {/* Manual Tests */}
                    <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
                        <h2 className="text-xl font-semibold mb-4">Manual Tests</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a
                                href="http://localhost:8080/api/auth/google"
                                target="_blank"
                                className="bg-red-500 text-white px-4 py-2 rounded text-center hover:bg-red-600"
                            >
                                🔗 Direct OAuth Link
                            </a>
                            <a
                                href="http://localhost:8080/api/debug/users"
                                target="_blank"
                                className="bg-green-500 text-white px-4 py-2 rounded text-center hover:bg-green-600"
                            >
                                👥 View Users API
                            </a>
                            <a
                                href="/login"
                                className="bg-purple-500 text-white px-4 py-2 rounded text-center hover:bg-purple-600"
                            >
                                🏠 Back to Login
                            </a>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">🔧 Troubleshooting Steps</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Make sure backend is running on http://localhost:8080</li>
                        <li>Check if Google OAuth credentials are configured in .env</li>
                        <li>Verify the callback URL in Google Console matches: http://localhost:8080/api/auth/google/callback</li>
                        <li>Check browser console for any CORS errors</li>
                        <li>Try the direct OAuth link above</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}