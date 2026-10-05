import { Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function BrandEdit({ brand }) {
    const { data, setData, put, errors, processing } = useForm({
        name: brand.name || '',
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        put(`/brands/${brand.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link 
                        href="/brands"
                        className="text-blue-500 hover:text-blue-700 font-medium mb-4 inline-block"
                    >
                        ← Back to Brands
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900">Edit Brand</h1>
                </div>

                {/* Form */}
                <div className="bg-white shadow-md rounded-lg p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="name" className="block text-gray-700 font-bold mb-2">
                                Brand Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter brand name"
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded"
                            >
                                {processing ? 'Updating...' : 'Update Brand'}
                            </button>
                            <Link
                                href="/brands"
                                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded text-center"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
