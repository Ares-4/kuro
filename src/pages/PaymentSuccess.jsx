import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// We will add these exports into src/lib/utils.js next
import { scoreReadiness, buildPremiumAddOns } from '@/lib/utils';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [verifying, setVerifying] = useState(true);

  const [payload, setPayload] = useState(null);

  useEffect(() => {
    // Simulate verification (your current approach)
    const timer = setTimeout(() => {
      setVerifying(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [sessionId]);

  useEffect(() => {
    // Load readiness payload saved before Stripe redirect
    try {
      const raw = localStorage.getItem('kuro_readiness_payload');
      if (!raw) return;
      setPayload(JSON.parse(raw));
    } catch {
      setPayload(null);
    }
  }, []);

  const computed = useMemo(() => {
    if (!payload?.answers) return null;
    const scoring = scoreReadiness(payload.answers);
    const premium =
      payload.plan === 'PREMIUM'
        ? buildPremiumAddOns(payload.answers, scoring)
        : null;

    return { scoring, premium };
  }, [payload]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-slate-900 border-slate-800">
        <CardContent className="pt-12 pb-8 px-8 text-center space-y-6">
          {verifying ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
              <h1 className="text-2xl font-bold text-white">Verifying Payment...</h1>
              <p className="text-slate-400">Please wait while we confirm your transaction.</p>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
                <p className="text-slate-400">
                  Thank you for your purchase. We have sent a confirmation email with your receipt and next steps.
                </p>
              </div>

              <div className="bg-slate-800/50 rounded p-4 border border-slate-700 text-left text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="text-slate-300 font-mono">{sessionId?.slice(0, 10)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-green-400 font-medium">Paid</span>
                </div>
              </div>

              {/* READINESS RESULT */}
              <div className="text-left space-y-4">
                {!payload || !computed ? (
                  <div className="bg-slate-800/50 rounded p-4 border border-slate-700 text-sm">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-white font-semibold">Result not found</p>
                        <p className="text-slate-400">
                          We couldn’t load your readiness answers. This usually happens if the browser blocked storage
                          or you opened this page on a different device.
                        </p>
                        <p className="text-slate-400">
                          Please run the readiness check again so your result can be generated.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-800/50 rounded p-4 border border-slate-700 text-sm space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Plan:</span>
                        <span className="text-slate-200 font-semibold">{payload.plan}</span>
                      </div>

                      <div className="space-y-1">
                        <p className="text-slate-500">Verdict:</p>
                        <p className="text-white text-lg font-bold">
                          {computed.scoring.verdict} — {computed.scoring.percent}%
                        </p>
                      </div>

                      {computed.scoring.blockers?.length > 0 && (
                        <div>
                          <p className="text-slate-500 mb-1">Top blockers:</p>
                          <ul className="list-disc pl-5 space-y-1 text-slate-200">
                            {computed.scoring.blockers.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="text-slate-500 text-xs">
                        This is a preliminary informational assessment based on your answers. It is not legal advice and does not guarantee outcomes.
                      </p>
                    </div>

                    {payload.plan === 'PREMIUM' && computed.premium && (
                      <>
                        <div className="bg-slate-800/50 rounded p-4 border border-slate-700 text-sm space-y-2">
                          <p className="text-white font-semibold">Premium Checklist</p>
                          <ul className="list-disc pl-5 space-y-1 text-slate-200">
                            {computed.premium.checklist.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-slate-800/50 rounded p-4 border border-slate-700 text-sm space-y-2">
                          <p className="text-white font-semibold">Risk Flags</p>
                          {computed.premium.risks.length === 0 ? (
                            <p className="text-slate-200">No major risks detected from your answers.</p>
                          ) : (
                            <ul className="list-disc pl-5 space-y-1 text-slate-200">
                              {computed.premium.risks.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="bg-slate-800/50 rounded p-4 border border-slate-700 text-sm space-y-2">
                          <p className="text-white font-semibold">Suggested Timeline</p>
                          <p className="text-slate-200">{computed.premium.suggestedWindow}</p>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link to="/">
                  Return to Home <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;