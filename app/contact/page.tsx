"use client";
import { Github, Mail, Twitter } from "lucide-react";
import Link from "next/link";

const socials = [
	{
		icon: <Mail size={20} />,
		href: "mailto:find.bimal@gmail.com",
		label: "Email",
		handle: "find.bimal@gmail.com",
	},
	{
		icon: <Github size={20} />,
		href: "https://github.com/bimalbp",
		label: "Github",
		handle: "bimalbp",
	},
];

export default function Example() {
	return (
		<div>
			<div>
				<div>
					{socials.map((s) => (
						<Link href={s.href} target="_blank">
							<span aria-hidden="true" />
							<span>{s.icon}</span>{" "}
							<div>
								<span>{s.handle}</span>
								<span>{s.label}</span>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
