"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card } from "@/components/ui/card";

function SettingsContent() {
  const params = useSearchParams();
  const connected = params.get("connected") === "true";
  const error = params.get("error");

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-slate-100 mb-8">Configurações</h1>

        {connected && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-3 text-emerald-400 text-sm">
            Conta do Facebook conectada com sucesso!
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
            Erro ao conectar: {error.replace(/_/g, " ")}
          </div>
        )}

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-100 mb-1">
                Facebook Ads
              </h2>
              <p className="text-sm text-slate-500">
                Conecte sua conta de anúncios para sincronizar dados de performance.
              </p>
            </div>
            <a
              href="/api/facebook/connect"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Conectar Facebook
            </a>
          </div>
        </Card>

        <div className="mt-6">
          <Card>
            <h2 className="text-base font-semibold text-slate-100 mb-1">Webhook Hotmart</h2>
            <p className="text-sm text-slate-500 mb-4">
              Configure a URL abaixo nas configurações de webhook da Hotmart.
            </p>
            <code className="block bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-indigo-300 font-mono">
              {typeof window !== "undefined" ? window.location.origin : "https://seudominio.com"}/api/webhook/hotmart
            </code>
            <p className="mt-3 text-xs text-slate-500">
              Eventos: <code className="text-slate-400">PURCHASE_APPROVED</code>,{" "}
              <code className="text-slate-400">PURCHASE_COMPLETE</code>,{" "}
              <code className="text-slate-400">PURCHASE_REFUNDED</code>
            </p>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <h2 className="text-base font-semibold text-slate-100 mb-1">Webhook Hubla</h2>
            <p className="text-sm text-slate-500 mb-4">
              Configure a URL abaixo nas configurações de webhook da Hubla.
            </p>
            <code className="block bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-indigo-300 font-mono">
              {typeof window !== "undefined" ? window.location.origin : "https://seudominio.com"}/api/webhook/hubla
            </code>
            <p className="mt-3 text-xs text-slate-500">
              Eventos: <code className="text-slate-400">sale.approved</code>,{" "}
              <code className="text-slate-400">sale.refunded</code>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
