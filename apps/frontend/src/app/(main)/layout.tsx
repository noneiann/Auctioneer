import Header from "@/components/Header";
import Navbar from "@/components/Navbar";

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
