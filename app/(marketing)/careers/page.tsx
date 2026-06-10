export const metadata = { title: 'Careers – Lexis.uz' }

export default function CareersPage() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-4xl font-black text-gray-900 mb-4">Careers</h1>
      <p className="text-gray-500 max-w-md">
        We&apos;re a small, passionate team building the best AI-powered English learning platform for Uzbekistan.
        No open roles right now — but we&apos;d love to hear from you.
      </p>
      <p className="mt-6 text-gray-500">
        Send your CV to{' '}
        <a href="mailto:jobs@lexis.uz" className="text-indigo-600 hover:underline">
          jobs@lexis.uz
        </a>
      </p>
    </section>
  )
}
