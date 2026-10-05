import { useState, useEffect } from 'react';
import { Link, router, usePage, useForm } from '@inertiajs/react';
import {
  IconUpload,
  IconPlus,
  IconSearch,
  IconFileTypeCsv,
  IconCircleCheck,
} from '@tabler/icons-react';

export default function Index({ tires, brands, filters }) {
  const { flash } = usePage();
  const { data, setData, post, processing, errors, reset } = useForm({
    brand_id: '',
    width: '',
    aspect_ratio: '',
    diameter: '',
    load_index: '',
    speed_index: 'V',
    construction: 'R',
  });

  const [search, setSearch] = useState(filters.search || '');
  const [showMessage, setShowMessage] = useState(false);


  const { data: importData, setData: setImportData, post: postImport, processing: importProcessing } = useForm({
    file: null,
  });

  const handleImportSubmit = (e) => {
    e.preventDefault();
    postImport('tires/import', {
      onSuccess: () => {
        alert('Importation terminée !');
        setImportData('file', null); // Reset file input
        router.visit('/tires', { preserveState: false }); // Force full reload
      },
      onError: (errors) => {
        console.error('Import errors:', errors);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/tires', { onSuccess: () => reset() });
  };

  useEffect(() => {
    if (search === (filters.search || '')) return;
    const t = setTimeout(() => {
      router.get('/tires', { search }, { preserveState: true, replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [search, filters.search]);

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
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* PAGE HEADER */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-1">Gestion du stock</p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Catalogue de pneus</h1>
        </div>
        <span className="text-sm text-gray-400">{tires.data.length} référence(s) affichée(s)</span>
      </div>

      {/* Success Message */}
      {showMessage && flash.message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {flash.message}
        </div>
      )}


      {/* IMPORT CARD */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
            <IconFileTypeCsv size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Importation en masse</h2>
            <p className="text-xs text-gray-400">Format CSV : Marque, Largeur, Série, Diamètre, Charge, Vitesse</p>
          </div>
        </div>
        <form onSubmit={handleImportSubmit} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-gray-50 border border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 transition rounded-xl px-4 py-2.5 text-sm text-gray-500 hover:text-emerald-700">
            <IconUpload size={16} />
            <span>{importData.file ? importData.file.name : 'Choisir un fichier CSV'}</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={e => setImportData('file', e.target.files[0])}
            />
          </label>
          <button
            type="submit"
            disabled={importProcessing || importData.file == null}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 px-5 rounded-xl transition disabled:opacity-50"
          >
            <IconCircleCheck size={16} />
            {importProcessing ? 'Importation...' : "Lancer l'importation"}
          </button>
        </form>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* FORM CARD */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <IconPlus size={18} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">Ajouter une référence</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Marque */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Marque</label>
              <select
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                value={data.brand_id}
                onChange={e => setData('brand_id', e.target.value)}
              >
                <option value="">Choisir une marque...</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              {errors.brand_id && <p className="text-red-500 text-xs">{errors.brand_id}</p>}
            </div>

            {/* Largeur / Série */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Largeur', placeholder: '205', key: 'width', error: errors.width },
                { label: 'Série', placeholder: '55', key: 'aspect_ratio', error: errors.aspect_ratio },
              ].map(({ label, placeholder, key, error }) => (
                <div key={key} className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                  <input
                    type="number"
                    min={0}
                    placeholder={placeholder}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                    value={data[key]}
                    onChange={e => setData(key, e.target.value)}
                  />
                  {error && <p className="text-red-500 text-xs">{error}</p>}
                </div>
              ))}
            </div>

            {/* Diamètre / Charge / Vitesse */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Diam.', placeholder: '16', key: 'diameter', type: 'number' },
                { label: 'Charge', placeholder: '91', key: 'load_index', type: 'number' },
                { label: 'Vitesse', placeholder: 'V', key: 'speed_index', type: 'text' },
              ].map(({ label, placeholder, key, type }) => (
                <div key={key} className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                  <input
                    type={type}
                    min={type === 'number' ? 0 : undefined}
                    placeholder={placeholder}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
                    value={data[key]}
                    onChange={e => setData(key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 mt-3 rounded-xl transition text-sm disabled:opacity-50"
            >
              {processing ? 'Enregistrement...' : 'Enregistrer au catalogue'}
            </button>
          </form>
        </div>

        {/* TABLE CARD */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col gap-4">

          {/* Search */}
          <div className="relative">
            <IconSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par marque, largeur, diamètre..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Marque</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Référence complète</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tires.data.map(tire => (
                  <tr key={tire.id} className="hover:bg-gray-50 transition group">
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-gray-900">{tire.brand?.name}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-mono font-medium text-gray-500 group-hover:text-emerald-600 transition">{tire.reference}</span>
                    </td>
                  </tr>
                ))}
                {tires.data.length === 0 && (
                  <tr>
                    <td colSpan="2" className="px-5 py-12 text-center text-gray-300 text-sm">
                      Aucun pneu ne correspond à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {tires.links.map((link, index) => (
              <Link
                key={index}
                href={link.url || '#'}
                dangerouslySetInnerHTML={{ __html: link.label }}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition ${link.active
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                onClick={e => !link.url && e.preventDefault()}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}