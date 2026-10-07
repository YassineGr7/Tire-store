import React, { useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import {
    IconUser,
    IconBuilding,
    IconBuildingCog,
    IconLock,
    IconCheck,
    IconAlertCircle,
    IconShieldCheck,
} from "@tabler/icons-react";

export default function Settings({ company, preferences }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;

    const [activeTab, setActiveTab] = useState("profile");

    // 1. Profile Form
    const profileForm = useForm({
        name: user?.name || "",
        email: user?.email || "",
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    // 2. Company / Invoice Info Form
    const companyForm = useForm({
        company_name: company?.company_name || "",
        ice_number: company?.ice_number || "",
        phone: company?.phone || "",
        address: company?.address || "",
        invoice_footer: company?.invoice_footer || "",
    });

    // 3. Stock Preferences Form
    const preferencesForm = useForm({
        currency: preferences?.currency || "MAD",
        default_tva: preferences?.default_tva || 20,
        low_stock_threshold: preferences?.low_stock_threshold || 5,
        enable_email_alerts: preferences?.enable_email_alerts || true,
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        profileForm.post("/settings/profile", {
            preserveScroll: true,
            onSuccess: () => {
                profileForm.reset(
                    "current_password",
                    "new_password",
                    "new_password_confirmation",
                );
            },
        });
    };

    const handleCompanySubmit = (e) => {
        e.preventDefault();
        companyForm.post("/settings/company", {
            preserveScroll: true,
        });
    };

    const handlePreferencesSubmit = (e) => {
        e.preventDefault();
        preferencesForm.post("/settings/preferences", {
            preserveScroll: true,
        });
    };

    return (
        <div className="w-full space-y-8">
            <Head title="Paramètres" />

            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Paramètres
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        Gérez votre compte, les coordonnées de votre entreprise
                        et les règles de stock.
                    </p>
                </div>

                {/* Success Alert */}
                {flash?.success && (
                    <div className="flex items-center gap-2 p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <IconCheck size={16} />
                        <span>{flash.success}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Navigation Sidebar */}
                    <div className="space-y-1">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                                activeTab === "profile"
                                    ? "bg-emerald-500 text-white shadow-xs"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <IconUser size={18} />
                            Mon Profil
                        </button>

                        <button
                            onClick={() => setActiveTab("company")}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                                activeTab === "company"
                                    ? "bg-emerald-500 text-white shadow-xs"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <IconBuilding size={18} />
                            Entreprise & Facturation
                        </button>

                        <button
                            onClick={() => setActiveTab("preferences")}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                                activeTab === "preferences"
                                    ? "bg-emerald-500 text-white shadow-xs"
                                    : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                            <IconBuildingCog size={18} />
                            Préférences Stock
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="md:col-span-3 bg-white border border-gray-200 rounded-2xl p-6 shadow-xs">
                        {/* PROFILE TAB */}
                        {activeTab === "profile" && (
                            <form
                                onSubmit={handleProfileSubmit}
                                className="space-y-4"
                            >
                                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                                    <IconUser
                                        size={18}
                                        className="text-emerald-600"
                                    />
                                    Informations Personnelles
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Nom complet
                                        </label>
                                        <input
                                            type="text"
                                            value={profileForm.data.name}
                                            onChange={(e) =>
                                                profileForm.setData(
                                                    "name",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                        {profileForm.errors.name && (
                                            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                                                <IconAlertCircle size={13} />{" "}
                                                {profileForm.errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Adresse E-mail
                                        </label>
                                        <input
                                            type="email"
                                            value={profileForm.data.email}
                                            onChange={(e) =>
                                                profileForm.setData(
                                                    "email",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                        {profileForm.errors.email && (
                                            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                                                <IconAlertCircle size={13} />{" "}
                                                {profileForm.errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 pt-4 flex items-center gap-2">
                                    <IconLock
                                        size={18}
                                        className="text-emerald-600"
                                    />
                                    Modifier le mot de passe
                                </h2>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Mot de passe actuel
                                        </label>
                                        <input
                                            type="password"
                                            value={
                                                profileForm.data
                                                    .current_password
                                            }
                                            onChange={(e) =>
                                                profileForm.setData(
                                                    "current_password",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                        {profileForm.errors
                                            .current_password && (
                                            <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                                                <IconAlertCircle size={13} />{" "}
                                                {
                                                    profileForm.errors
                                                        .current_password
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Nouveau mot de passe
                                            </label>
                                            <input
                                                type="password"
                                                value={
                                                    profileForm.data
                                                        .new_password
                                                }
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        "new_password",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            />
                                            {profileForm.errors
                                                .new_password && (
                                                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                                                    <IconAlertCircle
                                                        size={13}
                                                    />{" "}
                                                    {
                                                        profileForm.errors
                                                            .new_password
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Confirmer le mot de passe
                                            </label>
                                            <input
                                                type="password"
                                                value={
                                                    profileForm.data
                                                        .new_password_confirmation
                                                }
                                                onChange={(e) =>
                                                    profileForm.setData(
                                                        "new_password_confirmation",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={profileForm.processing}
                                        className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                                    >
                                        {profileForm.processing
                                            ? "Enregistrement..."
                                            : "Enregistrer les modifications"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* COMPANY TAB */}
                        {activeTab === "company" && (
                            <form
                                onSubmit={handleCompanySubmit}
                                className="space-y-4"
                            >
                                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                                    <IconBuilding
                                        size={18}
                                        className="text-emerald-600"
                                    />
                                    Coordonnées d'impression des Factures PDF
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Nom de la société
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                companyForm.data.company_name
                                            }
                                            onChange={(e) =>
                                                companyForm.setData(
                                                    "company_name",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Numéro ICE / Identifiant Fiscal
                                        </label>
                                        <input
                                            type="text"
                                            value={companyForm.data.ice_number}
                                            onChange={(e) =>
                                                companyForm.setData(
                                                    "ice_number",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Téléphone
                                        </label>
                                        <input
                                            type="text"
                                            value={companyForm.data.phone}
                                            onChange={(e) =>
                                                companyForm.setData(
                                                    "phone",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Adresse
                                        </label>
                                        <input
                                            type="text"
                                            value={companyForm.data.address}
                                            onChange={(e) =>
                                                companyForm.setData(
                                                    "address",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Pied de page des factures
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={companyForm.data.invoice_footer}
                                        onChange={(e) =>
                                            companyForm.setData(
                                                "invoice_footer",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                    />
                                </div>

                                <div className="pt-3 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={companyForm.processing}
                                        className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                                    >
                                        {companyForm.processing
                                            ? "Enregistrement..."
                                            : "Mettre à jour l'entreprise"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* PREFERENCES TAB */}
                        {activeTab === "preferences" && (
                            <form
                                onSubmit={handlePreferencesSubmit}
                                className="space-y-4"
                            >
                                <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                                    <IconBuildingCog
                                        size={18}
                                        className="text-emerald-600"
                                    />
                                    Règles & Alertes de Gestion
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Devise principale
                                        </label>
                                        <select
                                            value={
                                                preferencesForm.data.currency
                                            }
                                            onChange={(e) =>
                                                preferencesForm.setData(
                                                    "currency",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                                        >
                                            <option value="MAD">
                                                MAD (DH)
                                            </option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="USD">USD ($)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Taux TVA par défaut (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={
                                                preferencesForm.data.default_tva
                                            }
                                            onChange={(e) =>
                                                preferencesForm.setData(
                                                    "default_tva",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Seuil Alerte Stock Bas
                                        </label>
                                        <input
                                            type="number"
                                            value={
                                                preferencesForm.data
                                                    .low_stock_threshold
                                            }
                                            onChange={(e) =>
                                                preferencesForm.setData(
                                                    "low_stock_threshold",
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="alerts"
                                        checked={
                                            preferencesForm.data
                                                .enable_email_alerts
                                        }
                                        onChange={(e) =>
                                            preferencesForm.setData(
                                                "enable_email_alerts",
                                                e.target.checked,
                                            )
                                        }
                                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                    />
                                    <label
                                        htmlFor="alerts"
                                        className="text-xs text-gray-700 font-medium cursor-pointer"
                                    >
                                        Recevoir une notification en cas de
                                        stock critique
                                    </label>
                                </div>

                                <div className="pt-3 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={preferencesForm.processing}
                                        className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
                                    >
                                        {preferencesForm.processing
                                            ? "Enregistrement..."
                                            : "Sauvegarder les règles"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
