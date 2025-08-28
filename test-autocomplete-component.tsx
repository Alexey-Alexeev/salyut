/**
 * Test page for Address Autocomplete
 * 
 * Add this to your pages to test autocomplete functionality:
 * 1. Create app/test-autocomplete/page.tsx with this content
 * 2. Navigate to /test-autocomplete in browser
 * 3. Try typing "Москва" or "Балашиха"
 */

'use client'

import { useState } from 'react'
import { AddressAutocomplete } from '@/components/ui/address-autocomplete'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAutocompletePage() {
    const [address, setAddress] = useState('')

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Address Autocomplete Test</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Test the autocomplete:</h3>
                        <AddressAutocomplete
                            value={address}
                            onChange={setAddress}
                            placeholder="Начните вводить адрес (например: Москва, Балашиха, Люберцы)..."
                        />
                    </div>

                    {address && (
                        <div>
                            <h4 className="font-medium mb-2">Selected address:</h4>
                            <p className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                {address}
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h4 className="font-medium">Debug Information:</h4>

                        <div className="space-y-2 text-sm">
                            <p>
                                <strong>API Key Status:</strong> {' '}
                                <span className={process.env.NEXT_PUBLIC_YANDEX_API_KEY ? 'text-green-600' : 'text-red-600'}>
                                    {process.env.NEXT_PUBLIC_YANDEX_API_KEY ? 'Configured ✓' : 'Missing ✗'}
                                </span>
                            </p>

                            <p>
                                <strong>API Key (first 10 chars):</strong> {' '}
                                <code className="bg-gray-100 px-1 rounded">
                                    {process.env.NEXT_PUBLIC_YANDEX_API_KEY?.substring(0, 10) || 'Not set'}...
                                </code>
                            </p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h5 className="font-medium mb-2">Testing Instructions:</h5>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>Type at least 3 characters</li>
                                <li>Wait for suggestions to appear</li>
                                <li>Use arrow keys to navigate</li>
                                <li>Press Enter or click to select</li>
                                <li>Check browser console for any errors</li>
                            </ol>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <h5 className="font-medium mb-2">If not working:</h5>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>Check browser console for errors</li>
                                <li>Verify NEXT_PUBLIC_YANDEX_API_KEY is set</li>
                                <li>Restart the development server</li>
                                <li>Try typing "Москва" or "Балашиха"</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}