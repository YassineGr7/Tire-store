import { Link, router, useForm } from '@inertiajs/react';
import { IconArrowLeft } from '@tabler/icons-react';
import { useState } from 'react';

export default function BrandCreate() {
  const { data, setData, post, errors, processing } = useForm({
    name: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    post('/brands');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.visit("/brands")}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-emerald-600 transition mb-2"
          >
            <IconArrowLeft size={13} /> Retour aux brands
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Create New Brand</h1>
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
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
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
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition shadow-sm"
              >
                {processing ? 'Creating...' : 'Create Brand'}
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
