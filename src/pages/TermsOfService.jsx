import React from 'react';
import { Helmet } from 'react-helmet';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - Kuro Educational Consultancy</title>
        <meta
          name="description"
          content="Terms of Service for Kuro Educational Consultancy (Zimbabwe) including Basic/Premium readiness reports and payment terms."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <BackButton to="/" label="Back to Home" />

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-slate-400">Last updated: December 14, 2025</p>
            <p className="text-slate-500 mt-2 text-sm">Effective Date: December 14, 2025</p>
          </div>

          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">1. Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity
                ("you") and Kuro Educational Consultancy ("we," "us" or "our"), a company registered in Zimbabwe, concerning your access to
                and use of the Kuro Educational Consultancy website and related services (collectively, the "Site").
              </p>
              <p className="font-semibold">
                By accessing the Site, you confirm you have read, understood, and agree to be bound by these Terms of Service. If you do not
                agree, you must discontinue use immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">2. Nature of Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>2.1 Educational consultancy only:</strong> We are a private educational consultancy firm registered in Harare, Zimbabwe.
                We are not a government agency, university admission office, or visa granting authority.
              </p>
              <p>
                <strong>2.2 No guarantee of admission:</strong> Admission decisions are made solely by the relevant institution. We do not
                and cannot guarantee admission.
              </p>
              <p>
                <strong>2.3 No guarantee of visa:</strong> Visa issuance is at the sole discretion of the relevant embassy or consulate.
                We provide guidance based on available information, but we cannot guarantee outcomes.
              </p>
              <p className="text-slate-400">
                Any readiness checks or reports provided via the Site are preliminary informational assessments based on the information you
                submit, and are not legal advice.
              </p>
            </CardContent>
          </Card>

          {/* ADD: DIGITAL PRODUCTS DEFINITION */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">3. Digital Products (Readiness Checks & Reports)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Site may offer digital services such as a readiness check and related reports, including (where offered) a Basic Report
                and a Premium Report (“Digital Products”).
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Basic Report:</strong> a summary readiness result based on your submitted answers (e.g., readiness score, key blockers,
                  and general next steps).
                </li>
                <li>
                  <strong>Premium Report:</strong> a more detailed output which may include additional tailored guidance, checklists, risk flags,
                  timelines, and recommendations.
                </li>
              </ul>
              <p>
                Digital Products are generated based on the information you provide. You are responsible for the accuracy and completeness
                of your submissions.
              </p>
              <p className="text-slate-400">
                We may deliver Digital Products on-screen, by email, via downloadable files, or via your user session, depending on the product.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">4. User Responsibilities & Representations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>By using the Site and our services, you represent and warrant that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All information you submit will be true, accurate, current, and complete.</li>
                <li>You will maintain the accuracy of such information and promptly update it as necessary.</li>
                <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                <li>You will not use the Site for any illegal or unauthorized purpose.</li>
                <li>
                  <strong>Document authenticity:</strong> You warrant that documents you provide are genuine and authentic. If we reasonably
                  suspect fraud or falsification, we may terminate services immediately without refund and may report the matter to relevant
                  authorities or institutions where required or appropriate.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* UPDATED FEES/REFUNDS FOR DIGITAL PRODUCTS */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">5. Fees and Refunds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                <strong>5.1 Fees:</strong> Fees for our services are described on the Site or in your service agreement. Fees may be quoted in USD.
                Where applicable, payments may be made in ZWL/ZWG at the prevailing rate on the day of payment, subject to local banking regulations.
              </p>

              <p><strong>5.2 Refund policy:</strong></p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Digital Products (e.g., Basic/Premium reports):</strong> non-refundable once delivered or made available to you.</li>
                <li><strong>Consultation fees:</strong> non-refundable once the consultation has taken place.</li>
                <li><strong>Service/processing fees:</strong> non-refundable once the service has commenced (e.g., document review has started).</li>
                <li>
                  <strong>University application fees:</strong> paid to universities (directly or via us on your behalf) and are subject to the
                  university’s policies and are typically non-refundable.
                </li>
              </ul>

              <p className="text-slate-400">
                If you believe a payment was made in error or a Digital Product was not delivered, contact support promptly so we can investigate.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">6. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software,
                website designs, text, and graphics on the Site (collectively, the "Content") and the trademarks and logos contained therein
                (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws of Zimbabwe
                and applicable international conventions.
              </p>
              <p>
                You are granted a limited license to access and use the Site and to download or print a copy of any portion of the Content
                to which you have properly gained access solely for your personal, non-commercial use.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                To the maximum extent permitted by applicable law, in no event will we or our directors, employees, or agents be liable to you
                or any third party for any indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit,
                lost revenue, loss of data, or other damages arising from your use of the Site, even if we have been advised of the possibility
                of such damages.
              </p>
              <p>
                We are specifically not liable for:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Visa rejections by any embassy or consulate.</li>
                <li>Admission rejections by any university or educational institution.</li>
                <li>Changes in immigration laws or university admission policies after an application has been submitted.</li>
                <li>Delays caused by third parties, including courier services, government bodies, or institutions.</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">8. Dispute Resolution and Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                These Terms shall be governed by and defined following the laws of Zimbabwe. You and Kuro Educational Consultancy irrevocably
                consent that the courts of Zimbabwe shall have exclusive jurisdiction to resolve any dispute which may arise in connection with
                these Terms.
              </p>
              <p>
                <strong>Informal negotiations:</strong> To expedite resolution and control cost, the parties agree to first attempt to resolve any
                dispute informally for at least thirty (30) days before initiating litigation, except where urgent injunctive relief is required.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader>
              <CardTitle className="text-white text-2xl">9. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                To resolve a complaint regarding the Site or to receive further information regarding use of the Site, contact us at:
              </p>
              <div className="mt-4 p-4 bg-slate-950 rounded border border-slate-800">
                <p><strong>Kuro Educational Consultancy</strong></p>
                <p>Harare, Zimbabwe</p>
                <p>Phone: +48783042776</p>
                <p>Email: <strong>support@kuroeduconsultancy.com</strong></p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
};

export default TermsOfService;