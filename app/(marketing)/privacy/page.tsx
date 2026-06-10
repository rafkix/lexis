export const metadata = { title: 'Privacy Policy – Lexis.uz' }

export default function PrivacyPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-24">
      <h1 className="text-4xl font-black text-gray-900 mb-6">Privacy Policy</h1>
      <p className="text-gray-500 mb-4">Last updated: June 2025</p>
      <p className="text-gray-600 leading-relaxed">
        Lexis.uz collects only the data necessary to provide and improve our service.
        We never sell your personal information. Full policy details will be published here soon.
        For any privacy questions, contact us at{' '}
        <a href="mailto:privacy@lexis.uz" className="text-indigo-600 hover:underline">
          privacy@lexis.uz
        </a>.
      </p>
    </section>
  )
}
