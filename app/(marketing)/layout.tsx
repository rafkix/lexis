import Header from '@/components/layout/HeaderCTA'
import Footer from '@/components/layout/FooterCTA'

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="relative min-h-screen overflow-hidden bg-white">
            <div className="relative z-10 flex flex-col min-h-screen">
                <Header />

                <main className="flex-1">
                    {children}
                </main>

                <Footer />
            </div>

        </div>
    )
}