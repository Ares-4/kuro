import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { createCheckoutSession } from '@/lib/paymentService';
import { supabase } from '@/lib/customSupabaseClient';
import { calculateLeadScore } from '@/lib/leadScoringService';

const ReadinessCheckModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    plan: 'basic',
    educationLevel: '',
    budget: '',
    destination: '',
    email: '',
    phone: '',
    passportMonthsRemaining: '',
    documentsReady: '',
    intakeTimeline: '',
    englishLevel: '',
    bachelorOnlyConfirm: false,
    residence: '',
  });

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateStep = () => {
    if (step === 1) return true;
    if (step === 2) {
      if (!formData.educationLevel) return "Please select your education level.";
      if (!formData.destination) return "Please select your preferred destination.";
      return true;
    }
    if (step === 3) {
      if (!formData.budget) return "Please select your budget range.";
      if (!formData.passportMonthsRemaining) return "Please select passport validity.";
      if (!formData.documentsReady) return "Please select documents readiness.";
      if (!formData.intakeTimeline) return "Please select your timeline.";
      if (!formData.englishLevel) return "Please select your English level.";
      if (!formData.residence || formData.residence.trim().length < 2) return "Please enter your country of residence.";
      if (formData.bachelorOnlyConfirm !== true) return "You must confirm Bachelor programs only (current offering).";
      return true;
    }
    if (step === 4) {
      if (!formData.email || !formData.email.includes('@')) return "Please enter a valid email address.";
      if (!formData.phone || formData.phone.trim().length < 6) return "Please enter a valid WhatsApp number.";
      return true;
    }
    return true;
  };

  const handleNext = () => {
    const valid = validateStep();
    if (valid !== true) {
      toast({ title: "Missing information", description: valid, variant: "destructive" });
      return;
    }
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 1. Calculate Score BEFORE insert (Async now)
      const scoringResult = await calculateLeadScore({
        destination: formData.destination,
        budget: formData.budget,
        intakeTimeline: formData.intakeTimeline,
        educationLevel: formData.educationLevel,
        residence: formData.residence,
        email: formData.email,
        phone: formData.phone
      });

      // Save readiness payload locally
      localStorage.setItem(
        "kuro_readiness_payload",
        JSON.stringify({
          plan: formData.plan === "premium" ? "PREMIUM" : "BASIC",
          answers: { ...formData },
          score: scoringResult.score,
          tier: scoringResult.tier,
          createdAt: new Date().toISOString(),
        })
      );

      // 2. Save lead with Score
      const { error: leadError } = await supabase.from('leads').insert({
        email: formData.email,
        name: 'Student',
        whatsapp: formData.phone,
        goal: `readiness_check_${formData.plan}`,
        target_destination: formData.destination,
        budget_range: formData.budget,
        study_level: formData.educationLevel,
        intake_month: formData.intakeTimeline,
        origin_country: formData.residence,
        score: scoringResult.score,
        tier: scoringResult.tier,
        scored_at: scoringResult.scored_at,
        intake_form: JSON.stringify(formData)
      });

      if (leadError) console.error('Lead save error:', leadError);

      // Payment Logic
      const applicationId = crypto.randomUUID();
      const successUrl = `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/?payment=cancelled`;

      let checkoutData = {
        applicationId,
        amount: formData.plan === "premium" ? 19 : 2.99,
        programName: formData.plan === "premium" ? "Premium Visa Risk Report" : "Basic Readiness Check",
        successUrl,
        cancelUrl,
        currency: "eur",
      };

      const session = await createCheckoutSession(checkoutData);

      if (session?.url) {
        window.location.href = session.url;
        return;
      }

      toast({ title: "Payment error", description: "Could not start checkout.", variant: "destructive" });

    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to process request.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-950 border-slate-800 text-white sm:max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-center">
          <h2 className="text-xl font-bold text-white">Readiness Check</h2>
          <p className="text-blue-100 text-sm mt-1">Assess your admission & visa eligibility</p>
        </div>

        <div className="p-6">
          <div className="w-full bg-slate-900 h-2 rounded-full mb-6">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Label className="text-base font-semibold text-white">Choose your analysis level</Label>
                <RadioGroup
                  defaultValue="basic"
                  onValueChange={(val) => updateField('plan', val)}
                  className="grid gap-4"
                >
                  <div>
                    <RadioGroupItem value="basic" id="basic" className="peer sr-only" />
                    <Label
                      htmlFor="basic"
                      className="flex flex-col items-start justify-between rounded-md border-2 border-slate-800 bg-slate-900 p-4 hover:bg-slate-800 peer-data-[state=checked]:border-slate-500 cursor-pointer"
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="font-semibold text-white">Basic Check</span>
                        <span className="font-bold text-slate-400">€2.99</span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">Instant automated score</span>
                    </Label>
                  </div>

                  <div>
                    <RadioGroupItem value="premium" id="premium" className="peer sr-only" />
                    <Label
                      htmlFor="premium"
                      className="flex flex-col items-start justify-between rounded-md border-2 border-slate-800 bg-slate-900 p-4 hover:bg-slate-800 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-900/10 cursor-pointer"
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">Premium Report</span>
                          <Badge className="bg-blue-600 text-[10px] h-5 px-1">Rec</Badge>
                        </div>
                        <span className="font-bold text-blue-400">€19</span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">
                        Expert review + Visa Risk Analysis + Roadmap
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label>Current Education Level</Label>
                  <Select onValueChange={(val) => updateField('educationLevel', val)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue placeholder="Select your qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highschool">High School / O-Level</SelectItem>
                      <SelectItem value="alevel">A-Level / Diploma</SelectItem>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Destination</Label>
                  <Select onValueChange={(val) => updateField('destination', val)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue placeholder="Where do you want to study?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poland">Poland</SelectItem>
                      <SelectItem value="germany">Germany</SelectItem>
                      <SelectItem value="cyprus">Cyprus</SelectItem>
                      <SelectItem value="undecided">Not sure yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 mb-1">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                    <p className="text-sm text-slate-300">
                      Your answers affect the result. If you lie here, the “score” is worthless.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estimated Annual Budget (Tuition + Living)</Label>
                  <Select onValueChange={(val) => updateField('budget', val)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Under €3,000</SelectItem>
                      <SelectItem value="medium">€3,000 - €7,000</SelectItem>
                      <SelectItem value="high">€7,000 - €12,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Passport validity (months remaining)</Label>
                  <Select onValueChange={(val) => updateField('passportMonthsRemaining', val)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue placeholder="Select months remaining" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">0–3 months</SelectItem>
                      <SelectItem value="6">4–6 months</SelectItem>
                      <SelectItem value="12">7–12 months</SelectItem>
                      <SelectItem value="24">12+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Documents readiness</Label>
                  <Select onValueChange={(val) => updateField('documentsReady', val)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YES_ALL">All key documents ready</SelectItem>
                      <SelectItem value="SOME">Some documents missing</SelectItem>
                      <SelectItem value="NO">Not ready</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>When do you want to start?</Label>
                  <Select onValueChange={(val) => updateField('intakeTimeline', val)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0_3">0–3 months</SelectItem>
                      <SelectItem value="3_6">3–6 months</SelectItem>
                      <SelectItem value="6_12">6–12 months</SelectItem>
                      <SelectItem value="12_PLUS">12+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>English level (self-declared)</Label>
                  <Select onValueChange={(val) => updateField('englishLevel', val)}>
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B2_PLUS">B2+ (strong)</SelectItem>
                      <SelectItem value="B1">B1 (intermediate)</SelectItem>
                      <SelectItem value="A2_OR_LOWER">A2 or lower</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Country of residence</Label>
                  <Input
                    placeholder="e.g., Zimbabwe"
                    className="bg-slate-900 border-slate-700"
                    value={formData.residence}
                    onChange={(e) => updateField('residence', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bachelor programs only (current offering)</Label>
                  <RadioGroup
                    value={formData.bachelorOnlyConfirm ? "yes" : "no"}
                    onValueChange={(val) => updateField('bachelorOnlyConfirm', val === "yes")}
                    className="grid gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="bachelor_yes" />
                      <Label htmlFor="bachelor_yes">Yes, Bachelor only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="bachelor_no" />
                      <Label htmlFor="bachelor_no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  {formData.plan === 'premium' ? (
                    <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                  ) : (
                    <CheckCircle2 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  )}
                  <h3 className="font-bold">Almost there!</h3>
                  <p className="text-sm text-slate-400">
                    Where should we send your {formData.plan === 'premium' ? 'Premium Report' : 'Basic Score'}?
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    placeholder="you@example.com"
                    className="bg-slate-900 border-slate-700"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input
                    placeholder="+263..."
                    className="bg-slate-900 border-slate-700"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                className="text-slate-400"
                disabled={loading}
              >
                Back
              </Button>
            )}

            <Button
              onClick={handleNext}
              className={`bg-blue-600 hover:bg-blue-700 ml-auto ${step === 1 ? 'w-full' : ''}`}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading
                ? 'Processing...'
                : step === 4
                  ? `Pay €${formData.plan === 'premium' ? '19' : '2.99'} & Get Result`
                  : 'Next Step'}
              {!loading && step !== 4 && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReadinessCheckModal;