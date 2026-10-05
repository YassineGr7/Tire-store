import { Link, usePage, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { IconSquareRoundedPlus } from '@tabler/icons-react';

export default function BrandIndex({ brands }) {
  const { flash } = usePage();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const { delete: destroy } = useForm();

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      destroy(`/brands/${id}`, {
        onSuccess: () => {
          setConfirmDelete(null);
        }
      });
    }
  };

  useEffect(() => {
    if (flash.message) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [flash.message]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Brands Management</h1>
          <button
            onClick={() => router.visit("/brands/create")}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2.5 px-5 rounded-xl transition shadow-sm"
          >
            <IconSquareRoundedPlus className="mr-2" />
            Nouvelle Brand
          </button>
        </div>

        {/* Success Message */}
        {showMessage && flash.message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {flash.message}
          </div>
        )}

        {/* Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {brands.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {brand.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {brand.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(brand.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/brands/${brand.id}/edit`}
                        className="text-blue-500 hover:text-blue-700 font-medium mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="text-red-500 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500 text-lg">No brands found. <Link href="/brands/create" className="text-blue-500 hover:underline">Create one</Link></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
