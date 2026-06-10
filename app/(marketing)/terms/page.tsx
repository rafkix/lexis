export const metadata = { title: 'Terms of Service – Lexis.uz' }

export default function TermsPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-24">
      <h1 className="text-4xl font-black text-gray-900 mb-6">Terms of Service</h1>
      <p className="text-gray-500 mb-4">Last updated: June 2025</p>
      <p className="text-gray-600 leading-relaxed">
        By using Lexis.uz you agree to our terms of service. Full terms will be published here soon.
        For any questions contact{' '}
        <a href="mailto:hello@lexis.uz" className="text-indigo-600 hover:underline">
          hello@lexis.uz
        </a>.
      </p>
    </section>
  )
}
