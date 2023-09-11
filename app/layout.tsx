import "../global.css";
import { Inter } from "@next/font/google";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: {
		default: "Bimal Paul",
		template: "%s | Bimal Paul",
	},
	description: "Engineering Manager at Capital One",
	icons: {
		shortcut: "/favicon.ico",
	},
};
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});



export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={[inter.variable].join(" ")}>
			<head />
			<body>
				{children}
			</body>
		</html>
	);
}
