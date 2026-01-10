import Header from "@/components/layout/Header";
import Navbar from "@/components/layout/Navbar";

export default function MainLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<div className=''>
				<Header />
				<Navbar />
			</div>
			{children}
		</>
	);
}
