import React from 'react';
import { Helmet } from 'react-helmet';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Kuro Educational Consultancy</title>
        <meta
          name="description"
          content="Privacy Policy for Kuro Educational Consultancy (Zimbabwe) including GDPR notice, GA4 analytics, and payment processing transparency."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <BackButton to="/" label="Back to Home" />

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
            <p className="text-slate-400">
              Last updated: <span className="text-slate-300">December 14, 2025</span>
            </p>
            <p className="text-slate-500 mt-2 text-sm">
              Effective Date: <span className="text-slate-400">December 14, 2025</span>
            </p>
            <p className="text-slate-500 mt-2 text-sm">
              Note: Update the dates above whenever you publish changes.
            </p>
          </div>

          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Kuro Educational Consultancy ("we," "us," or "our") respects your privacy and is committed
                to protecting your personal data. This privacy policy explains how we collect, use, store,
                and protect your personal data when you visit our website (regardless of where you visit
                it from) and when you use our services.
              </p>
              <p>
                This policy is aligned with the <strong>Cyber and Data Protection Act [Chapter 12:07]</strong> of Zimbabwe
                and other applicable Zimbabwean laws regarding data privacy and protection.
              </p>
            </CardContent>
          </Card>

          {/* GDPR NOTICE */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">2. GDPR Notice (EU/EEA Users)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you are located in the European Union or European Economic Area (EU/EEA), or if we process your
                personal data in connection with EU/EEA-related services, the <strong>General Data Protection Regulation
                  (EU) 2016/679 (“GDPR”)</strong> may apply to our processing of your personal data.
              </p>
              <p>
                We process EU/EEA personal data on the following legal bases where applicable:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contract performance:</strong> to deliver paid services (e.g., Basic/Premium reports) and support you.</li>
                <li><strong>Legitimate interests:</strong> to operate, secure, and improve our website and services.</li>
                <li><strong>Consent:</strong> where required (e.g., certain marketing communications or cookie preferences).</li>
                <li><strong>Legal obligation:</strong> where required by law (e.g., accounting/tax obligations).</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">3. Data Controller and Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                The data controller is <strong>Kuro Educational Consultancy</strong>, a company registered in Zimbabwe.
                If you have questions about this privacy policy or want to exercise your rights, contact our privacy
                contact at:
              </p>
              <div className="mt-2 p-4 bg-slate-950 rounded border border-slate-800 space-y-1">
                <p><strong>Email:</strong> support@kuroeduconsultancy.com</p>
                <p><strong>Address:</strong> Kuro Educational Consultancy, Harare, Zimbabwe</p>
                <p><strong>Phone:</strong> +48783042776</p>
              </div>
            </CardContent>
          </Card>

          {/* DATA WE COLLECT */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">4. The Data We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may collect, use, store, and transfer different kinds of personal data. We separate this into:
                (A) data collected through the website and (B) data you may provide later for consultancy/application support.
              </p>

              <div className="space-y-2">
                <p className="text-white font-semibold">A) Website data (typical)</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Identity Data:</strong> name and basic identifiers you submit via forms.</li>
                  <li><strong>Contact Data:</strong> email address, phone number, country of residence.</li>
                  <li><strong>Readiness Check Data:</strong> answers you submit to eligibility/readiness questions.</li>
                  <li><strong>Transaction Data:</strong> payment status and transaction references for services purchased.</li>
                  <li><strong>Technical & Usage Data:</strong> IP address, device/browser information, pages visited, interactions.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-white font-semibold">B) Consultancy/application support (only if you choose to provide it)</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Documentary Data:</strong> passport copy, educational certificates/transcripts, and related documents required for university applications.</li>
                  <li><strong>Additional Profile Data:</strong> information you voluntarily provide for admissions/visa preparation (only when necessary).</li>
                </ul>
              </div>

              <p className="text-slate-400">
                We do not intentionally collect unnecessary sensitive data. Please avoid submitting irrelevant sensitive information.
              </p>
            </CardContent>
          </Card>

          {/* PAYMENTS */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">5. Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We accept payments for certain services directly through this website. Payment processing is handled through
                third-party payment providers.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>We may store:</strong> transaction reference, payment status, purchased service, and basic billing-related records required for support and accounting.
                </li>
                <li>
                  <strong>We do not store:</strong> full payment card details on our servers (these are handled by payment providers).
                </li>
              </ul>
              <p className="text-slate-400">
                Optional but recommended: name your payment provider(s) here once finalized (e.g., Stripe/PayNow/PayPal) for maximum transparency.
              </p>
            </CardContent>
          </Card>

          {/* HOW WE USE DATA */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">6. How We Use Your Personal Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>We will only use your personal data when the law allows us to. We commonly use your personal data to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Provide services:</strong> readiness checks, reports, consulting support, customer support.</li>
                <li><strong>Process payments:</strong> confirm and fulfil purchased services.</li>
                <li><strong>Comply with legal obligations:</strong> including tax/accounting obligations (e.g., ZIMRA reporting, where applicable).</li>
                <li><strong>Improve the site:</strong> analytics, performance, and security monitoring.</li>
                <li><strong>Marketing (where permitted):</strong> communications about our services; you can opt out at any time.</li>
              </ul>
            </CardContent>
          </Card>

          {/* DISCLOSURES */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">7. Disclosures of Your Personal Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>We may share your personal data with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Universities and educational institutions you are applying to (local or international), where necessary.</li>
                <li>Service providers acting as processors who provide hosting, IT, and system administration services.</li>
                <li>Professional advisers (lawyers, auditors, insurers) where necessary.</li>
                <li>Regulators and authorities where reporting is required by law.</li>
                <li>Payment providers to process transactions.</li>
              </ul>
            </CardContent>
          </Card>

          {/* GA4 */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">8. Cookies and Google Analytics 4 (GA4)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our website uses cookies and similar technologies to distinguish you from other users and to improve your experience.
              </p>
              <p>
                We use <strong>Google Analytics 4 (GA4)</strong> to understand how users interact with our website (for example: page views,
                session events, device/browser details, and interaction events). This helps us improve performance and content.
              </p>
              <p>
                You can control cookies through your browser settings. If you prefer to opt out of analytics tracking, you may also use
                browser-based tools or Google’s analytics opt-out mechanisms where available.
              </p>
            </CardContent>
          </Card>

          {/* INTERNATIONAL TRANSFERS */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">9. International Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Due to the nature of our business (international education consultancy), your data may be transferred to
                universities and institutions outside Zimbabwe and may be accessed by us while operating internationally.
              </p>
              <p>
                Where required, we take reasonable steps to ensure appropriate safeguards are applied for cross-border transfers
                in line with applicable law, including the Cyber and Data Protection Act [Chapter 12:07] and GDPR where applicable.
              </p>
            </CardContent>
          </Card>

          {/* SECURITY */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">10. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                We have appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed
                in an unauthorised way, altered, or disclosed. Access is limited to employees/agents/contractors who need it for
                business purposes and who are subject to confidentiality obligations.
              </p>
            </CardContent>
          </Card>

          {/* RETENTION */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">11. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                We retain personal data only for as long as necessary to fulfil the purposes we collected it for, including legal,
                accounting, or reporting requirements.
              </p>
              <p>
                Where required by Zimbabwean law and accounting practices, we may retain certain customer and transaction records
                for a reasonable period for tax and compliance purposes.
              </p>
            </CardContent>
          </Card>

          {/* RIGHTS */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">12. Your Legal Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Under the Cyber and Data Protection Act [Chapter 12:07], you have rights in relation to your personal data, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Request access to your personal data.</li>
                <li>Request correction of your personal data.</li>
                <li>Request erasure of your personal data (where applicable).</li>
                <li>Object to processing of your personal data.</li>
                <li>Request restriction of processing your personal data.</li>
                <li>Request data portability (where applicable).</li>
              </ul>

              <p className="pt-2">
                <strong>EU/EEA users (GDPR):</strong> You may also have the right to withdraw consent at any time (where processing is based on consent)
                and to lodge a complaint with a supervisory authority.
              </p>

              <p>
                To exercise your rights, contact: <strong>support@kuroeduconsultancy.com</strong>
              </p>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;