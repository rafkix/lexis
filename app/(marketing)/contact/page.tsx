import Link from 'next/link'

export const metadata = { title: 'Contact Us – Lexis.uz' }

export default function ContactPage() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-black text-gray-900 mb-4">Contact Us</h1>
      <p className="text-gray-500 max-w-md mb-8">
        Have a question or feedback? Reach us on Telegram or email and we&apos;ll get back to you shortly.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="https://t.me/lexis_uz"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
        >
          Telegram
        </a>
        <a
          href="mailto:hello@lexis.uz"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          hello@lexis.uz
        </a>
      </div>
    </section>
  )
}
