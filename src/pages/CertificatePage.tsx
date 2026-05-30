import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Certificate } from '../lib/types';
import { Award, Search, ShieldCheck, QrCode } from 'lucide-react';

export function CertificateVerifyPage({ certificateNumber }: { certificateNumber?: string }) {
  const [searchCode, setSearchCode] = useState(certificateNumber || '');
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function verify() {
    if (!searchCode.trim()) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_number', searchCode.trim())
      .maybeSingle();
    setCertificate(data);
    setLoading(false);
  }

  useEffect(() => {
    if (certificateNumber) verify();
  }, [certificateNumber]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Verification</h1>
          <p className="mt-2 text-gray-500">Enter a certificate ID to verify its authenticity</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && verify()}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
              placeholder="e.g. SF-M1X2Y3-ABCD"
            />
            <button
              onClick={verify}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Verify
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          )}

          {!loading && searched && certificate && (
            <div className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckMark />
                </div>
                <div>
                  <div className="font-semibold text-emerald-800">Certificate Verified</div>
                  <div className="text-xs text-emerald-600">This certificate is authentic</div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-5 border border-emerald-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 text-xs mb-0.5">Certificate ID</div>
                    <div className="font-mono font-medium text-gray-900">{certificate.certificate_number}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-0.5">Student Name</div>
                    <div className="font-medium text-gray-900">{certificate.user_name}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-0.5">Course</div>
                    <div className="font-medium text-gray-900">{certificate.course_name}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-0.5">Issued On</div>
                    <div className="font-medium text-gray-900">{new Date(certificate.issued_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600">
                <QrCode className="w-3.5 h-3.5" />
                Scan the QR code on the certificate to verify online
              </div>
            </div>
          )}

          {!loading && searched && !certificate && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-red-400" />
              </div>
              <p className="font-medium text-gray-900 mb-1">Certificate Not Found</p>
              <p className="text-sm text-gray-500">The certificate ID you entered could not be verified. Please check and try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckMark() {
  return (
    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
