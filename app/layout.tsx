import "../global.css";
import { Inter } from "@next/font/google";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: {
		default: "Bimal Paul",
		template: "%s | Bimal Paul",
	},
	description: "Engineering Manager at Capital One",
	openGraph: {
		title: "bimalpaul.dev",
		description:
			"Engineering Manager at Capital One",
		url: "https://bimalpaul.dev",
		siteName: "bimalpaul.dev",
		images: [
			{
				url: "https://bimalpaul.dev/og.png",
				width: 1920,
				height: 1080,
			},
		],
		locale: "en-US",
		type: "website",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	twitter: {
		title: "bimalpaul.dev",
		card: "summary_large_image",
	},
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
