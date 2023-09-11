"use client";
import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

import Particles from "react-particles";
import { loadFull } from "tsparticles";
import { useCallback } from "react";

const navigation = [
	{ name: "Contact", href: "/contact" },
	{ name: "Resume", href: "/resume" },
	{ name: "Blog", href: "/blog" },
	{ name: "Interview Tips", href: "/interview" },
	{ name: "Gallery", href: "/gallery" },
];

export default function Home() {
	const options = {
		particles: {
			number: {
				value: 50,
				density: {
					enable: true,
					// area: 1000,
				},
			},
			color: {
				value: ["#000000"],
			},
			shape: {
				type: "circle",
			},
			opacity: {
				value: 1,
			},
			size: {
				value: { min: 1, max: 3 },
			},
			links: {
				enable: true,
				distance: 150,
				color: "rgb(221,255,170)",
				opacity: 10,
				width: 1,
			},
			move: {
				enable: true,
				speed: 2,
			},
		},
		interactivity: {
			events: {
				onHover: {
					enable: true,
					mode: "grab",
				},
				onClick: {
					enable: true,
					mode: "push",
				},
			},
			modes: {
				grab: {
					distance: 140,
					links: {
						opacity: 1,
					},
				},
				push: {
					quantity: 6,
				},
			},
		},
	};

	// rome-ignore lint/suspicious/noExplicitAny: <explanation>
	const particlesInit = useCallback(async (engine: any) => {
		await loadFull(engine);
	}, []);

	const emailBimal = () => {
		(window as Window).location =
			"mailto:find.bimal@gmail.com?subject=Reaching out from bimalpaul.dev!";
		return;
	};

	return (
		<div className="flex flex-col items-center justify-center w-screen h-screen bg-black">
			<Particles options={options} init={particlesInit} />
			<motion.div
				initial={{ scale: 0 }}
				animate={{ rotate: 0, scale: 1 }}
				transition={{
					type: "spring",
					stiffness: 260,
					
					damping: 20,
				}}
			>
				<img
					src="/biml.jpeg"
					className="w-32 h-32 rounded-full z-50"
					alt="bimal's face"
				/>
				<h1 className="my-5 text-center text-xl text-gray-50">Bimal Paul</h1>
			</motion.div>
			
			<motion.button
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				className="animate-fade-in bg-sky-100 p-2 rounded text-violet-700 z-50"
				onClick={emailBimal}
			>
				Email me!
			</motion.button>
			<div className="my-16 text-center animate-fade-in">
				<h2 className="text-sm z-50 text-white">
					Hi, my name is Bimal. I build world class engineering teams.
				</h2>
			</div>
		</div>
	);
}
