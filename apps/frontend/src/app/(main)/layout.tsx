import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Navigation />
			<main className='min-h-screen'>{children}</main>
			<Footer />
		</>
	);
}
