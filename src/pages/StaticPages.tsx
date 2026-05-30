import { Link } from '../lib/router';
import { GraduationCap, Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About SkillForge</h1>
      <div className="prose prose-gray max-w-none">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-8 mb-8 border border-teal-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            SkillForge is on a mission to make quality IT education accessible to everyone. We believe that cost should never be a barrier to learning. That's why our course content is completely free, and we charge only a small registration fee to cover assessment and certification costs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Free Training</h3>
            <p className="text-sm text-gray-500">All course content is free to access. Learn at your own pace without any upfront cost.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Verified Certificates</h3>
            <p className="text-sm text-gray-500">Every certificate comes with a unique ID and QR code for instant online verification.</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Affordable Fees</h3>
            <p className="text-sm text-gray-500">Registration fees start at just ₹199. Pay only for assessment and certification.</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-3">What Makes Us Different</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Unlike expensive bootcamps or subscription-based platforms, SkillForge offers a transparent pricing model. The course content is free for everyone. You only pay a small registration fee when you're ready to get certified. This means you can start learning immediately without any financial commitment.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          Our certificates are verifiable online through a unique certificate ID and QR code. Employers and institutions can verify the authenticity of any certificate instantly, giving your credentials real value.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Courses</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          We offer courses across three tiers: Beginner (₹199–₹299), Intermediate (₹299–₹599), and Advanced (₹599–₹999). Topics range from HTML/CSS and Python fundamentals to DevOps, Cloud Computing, and Cybersecurity.
        </p>

        <div className="mt-8 text-center">
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-700 shadow-lg shadow-teal-500/25 transition-all"
          >
            Explore Our Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
          <p>By accessing and using SkillForge, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Service Description</h2>
          <p>SkillForge provides online IT courses with certification. Course content is provided free of charge. A registration fee is charged for enrollment, which covers assessment and certification costs.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Registration Fee</h2>
          <p>The registration fee is a one-time payment per course enrollment. This fee covers the cost of assessment, certificate generation, and platform maintenance. The fee varies by course tier (Beginner: ₹199–₹299, Intermediate: ₹299–₹599, Advanced: ₹599–₹999). The registration fee is clearly displayed before enrollment and is non-recurring.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Certificates</h2>
          <p>Certificates are issued upon successful completion of course assessments. Each certificate includes a unique certificate number and QR code for online verification. SkillForge reserves the right to revoke certificates found to be obtained through fraudulent means.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">5. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and to update it as necessary.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Intellectual Property</h2>
          <p>All course content, materials, and certificates are the property of SkillForge. You may not reproduce, distribute, or create derivative works without written permission.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Limitation of Liability</h2>
          <p>SkillForge provides educational content on an "as is" basis. We do not guarantee employment or career outcomes as a result of completing our courses.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Changes to Terms</h2>
          <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
        </section>
        <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">Last updated: May 2026</p>
      </div>
    </div>
  );
}

export function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Refund Policy</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6 text-sm text-gray-600 leading-relaxed">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800">
          <strong>Important:</strong> Since course content is free and the registration fee covers assessment and certification costs, refunds are handled on a case-by-case basis.
        </div>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Eligibility for Refund</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Refund requests must be made within 7 days of enrollment.</li>
            <li>The course progress must be less than 25% at the time of refund request.</li>
            <li>No certificate has been issued for the course.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Non-Refundable Cases</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Course progress exceeds 25%.</li>
            <li>A certificate has already been issued.</li>
            <li>More than 7 days have passed since enrollment.</li>
            <li>Coupon-discounted enrollments (partial refunds only).</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">How to Request a Refund</h2>
          <p>To request a refund, please contact us at support@skillforge.io with your enrollment details and reason for the refund request. Refunds are processed within 5-7 business days.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Refund Method</h2>
          <p>Refunds will be processed through the original payment method. If payment was made via Razorpay, the refund will be credited back to the same account.</p>
        </section>
        <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">Last updated: May 2026</p>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-gray-600 mb-6">Have questions about our courses, certificates, or enrollment? We'd love to hear from you.</p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Email</div>
                <div className="text-sm text-gray-500">support@skillforge.io</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Phone</div>
                <div className="text-sm text-gray-500">+91 98765 43210</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Office</div>
                <div className="text-sm text-gray-500">Bangalore, Karnataka, India</div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Send us a message</h2>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent! We will get back to you soon.'); }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea rows={4} required className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-emerald-700 transition-all">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
