export const metadata = { title: 'Refund Policy – Lexis.uz' }

export default function RefundPage() {
  return (
    <section className="max-w-3xl mx-auto px-4 py-24">
      <h1 className="text-4xl font-black text-gray-900 mb-6">Refund Policy</h1>
      <p className="text-gray-500 mb-4">Last updated: June 2025</p>
      <p className="text-gray-600 leading-relaxed">
        We offer a 7-day refund policy on all paid subscriptions. If you are not satisfied,
        contact us within 7 days of purchase at{' '}
        <a href="mailto:billing@lexis.uz" className="text-indigo-600 hover:underline">
          billing@lexis.uz
        </a>{' '}
        and we will process a full refund.
      </p>
    </section>
  )
}
