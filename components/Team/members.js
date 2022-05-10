import React from 'react';
import Image from 'next/image';

const LinkedinIcon = () => (
	<Image
		src="/images/icons/linkedin-rounded-grey.svg"
		alt="linkedin"
		width={24}
		height={24}
		layout="responsive"
	/>
);

export const MEMBERS = [
    {
        name: "Bakhtiyar Mamedov",
        position: "Chief financial officer",
        link: "https://www.linkedin.com/in/bakhtiyar-mamedov-2175329/",
        image: "Bakhtiyar.jpg",
    },
    {
        name: "Jeff Smith",
        position: "VP of Product",
        link: "",
        image: "Jeff.jpeg",
    },
    {
        name: "Anastasiia Bobeshko",
        position: "Head of Marketing",
        link: "https://www.linkedin.com/in/anastasiiabobeshko/",
        image: "Anastasiia.jpg",
    },
    {
        name: "Stanislav Liutenko",
        position: "Sales Manager",
        link: "https://www.linkedin.com/in/liutenkos/",
        image: "30.jpg",
    },
    {
        name: "Steve Vansimpsen",
        position: "Risk Manager",
        link: "https://www.linkedin.com/in/steve-vansimpsen-465982101/",
        image: "Steve.jpg",
    },
    {
        name: "Oleksandr Koliadych",
        position: "Business Analyst",
        link: "https://www.linkedin.com/in/oleksandrkoliadych/",
        image: "4.jpg",
    },
    {
        name: "Oleksandr Kovalov",
        position: "Designer",
        link: "https://www.linkedin.com/in/yakaspectrum/",
        image: "5.jpg",
    },
    {
        name: "Mariia Bohinska",
        position: "Deputy COO",
        link: "https://www.linkedin.com/in/maria-boginska-977a4a99/",
        image: "1.jpg",
    },
    {
        name: "Valentyn Shatravenko",
        position: "Cloud Team Lead",
        link: "https://www.linkedin.com/in/valentine-shatravenko-7b9a70130/",
        image: "3.jpg",
    },
    {
        name: "Ivan Osypchuk",
        position: "Business Analyst",
        link: "",
        image: "23.jpg",
    },
    {
        name: "Hoan My Tran",
        position: "Account Manager",
        link: "https://www.linkedin.com/in/hoan-my-tran/",
        image: "33.jpg",
    },
    {
        name: "Viktor Yatskin",
        position: "Product Manager",
        link: "https://www.linkedin.com/in/viktor-yatskin-b1b797160/",
        image: "6.jpg",
    },
    {
        name: "Eugene Makarenko",
        position: "CEO of Attirer",
        link: "https://www.linkedin.com/in/eugene-makarenko/",
        image: "2.jpg",
    },
    {
        name: "Nicolas Caiserman",
        position: "Product Manager",
        link: "https://www.linkedin.com/in/nicolascaiserman/",
        image: "7.jpg",
    },
    {
        name: "Yevhen Treiher",
        position: "Designer",
        link: "https://www.linkedin.com/in/yevhen-treiher-9b0225137/",
        image: "10.jpg",
    },
    {
        name: "Kateryna Prykhodko",
        position: "HR Manager",
        link: "https://www.linkedin.com/in/kateprykhodko/",
        image: "11.jpg",
    },
    {
        name: "Pavlo Kucherenko",
        position: "QA / Lead",
        link: "https://www.linkedin.com/in/pkucherekno/",
        image: "12.jpg",
    },
    {
        name: "Sean Lee",
        position: "Software Engineer",
        link: "https://www.linkedin.com/in/sean-sunwoo-lee-60aab026/",
        image: "14.jpg",
    },
    {
        name: "Bohdan Shpak",
        position: "Illustrator",
        link: "",
        image: "15.jpg",
    },
    {
        name: "Damien Soudant",
        position: "AM",
        link: "https://www.linkedin.com/in/damien-soudant-a3b469105/",
        image: "17.jpg",
    },
    {
        name: "Narupon Srisantithum / Tee",
        position: "Senior Software Engineer",
        link: "",
        image: "18.jpg",
    },
    {
        name: "Danylo Patsora",
        position: "Team Lead",
        link: "https://www.linkedin.com/in/danila-patsiora-b62036153/",
        image: "19.jpg",
    },
    {
        name: "Andrii Kushniruk",
        position: "Team Lead",
        link: "https://www.linkedin.com/in/akushniruk/",
        image: "20.jpg",
    },
    {
        name: "Zhanna Kravchuk",
        position: "Sales Manager",
        link: "https://www.linkedin.com/in/zhanna-kravchuk-0a719a1a7/",
        image: "24.jpg",
    },
    {
        name: "Tatiana Tolstykh",
        position: "UI/UX Desiner",
        link: "",
        image: "26.jpg",
    },
    {
        name: "Andrii Peresada",
        position: "Software Engineer",
        link: "https://www.linkedin.com/in/andrii-peresada-a29b411b4/",
        image: "28.jpg",
    },
    {
        name: "Aleksandr Khlopiachyi",
        position: "Software Engineer",
        link: "https://www.linkedin.com/in/oleksandr-khlopiachyi-46218a148/",
        image: "31.jpg",
    },
    {
        name: "Nadia Chumak",
        position: "Software Engineer",
        link: "https://www.linkedin.com/in/nadia-chumak-574239151/",
        image: "32.jpg",
    },
    {
        name: "Stanislav Borisov",
        position: "Legal & Compliance Manager",
        link: "",
        image: "34.jpg",
    },
    {
        name: "Marvin Fangre",
        position: "Business Operation Specialist",
        link: "",
        image: "35.jpg",
    },
    {
        name: "Maksym Valevatyi",
        position: "Technical Writer",
        link: "https://www.linkedin.com/in/maksym-valevatyi/",
        image: "36.jpg",
    },
    {
        name: "Maksym Naichuk",
        position: "Team Lead",
        link: "https://www.linkedin.com/in/maksim-naichuk/",
        image: "37.jpg",
    },
    {
        name: "Danil Sizov",
        position: "Product Manager",
        link: "https://www.linkedin.com/in/danil-sizov/",
        image: "38.jpg",
    },
    {
        name: "Vicharinee Saengthong / Fern",
        position: "Crypto operations manager / Market making",
        link: "",
        image: "39.jpg",
    },
    {
        name: "Wittawat Patcharinsak / Jeng",
        position: "Product Manager",
        link: "",
        image: "41.jpg",
    },
    {
        name: "Vee Jirapongcharoenlarb",
        position: "Software Engineer",
        link: "https://www.linkedin.com/in/vee-jirapong/",
        image: "42.jpg",
    },
    {
        name: "Sunattha Saeheng / Aae",
        position: "",
        link: "",
        image: "43.jpg",
    },
    {
        name: "Mariia Novikova",
        position: "HR Manager",
        link: "",
        image: "44.jpg",
    },
    {
        name: "Viktoria Melnychuk",
        position: "Account Manager",
        link: "https://www.linkedin.com/in/darkalien/",
        image: "45.jpg",
    },
    {
        name: "Dhanuwat Panyakom / Dump",
        position: "Software Engineer",
        link: "https://www.linkedin.com/in/dhanuwat-panyakom-01196899/",
        image: "47.jpg",
    },
];

export const TEAM_HEADLINERS = [
    {
        name: "Alexis Yellow",
        position: "Executive Chairman",
        description:
            "Alexis started his career in avionics before moving to the European Space Center, where he worked on software surrounding Ariane space rockets. He later co-founded market maker GSR and became a crypto investor and Blockchain opinion leader. For the last years, Alexis has made it his mission to support emerging crypto and blockchain projects, founding Yellow to bring the Blockchain communities together.",
        photo: "Alexis.png",
        socials: [
            { img: <LinkedinIcon />, link: "https://www.linkedin.com/in/sirkia/" },
        ],
    },
    {
        name: "Louis Bellet",
        position: "CEO",
        description:
            "Louis is a software architect and serial entrepreneur in the fintech, crypto & blockchain spaces. For the past ten years, he has been hands-on in the crypto industry, founding Openware, the world's leading crypto exchange software provider. Now, with Yellow, Louis plans to solve the problem of fragmented liquidity and make Blockchain more accessible and secure for the public.",
        photo: "Louis.png",
        socials: [
            { img: <LinkedinIcon />, link: "https://www.linkedin.com/in/louisbellet/" },
        ],
    },
    {
        name: "Camille Meulien",
        position: "CTO - Architect",
        description:
            "As a software architect, Camille is a known authority in the FinTech development circles. He has over 15 years of experience in FinTech security, distributed systems, Big Data, and high-traffic systems. He is a problem-solver and highly skilled in aligning technical solutions with business goals.",
        photo: "Camille.png",
        socials: [{ img: <LinkedinIcon />, link: "https://www.linkedin.com/in/camillemeulien/" }],
    },
    {
        name: "Sergii Kashchenko",
        position: "COO",
        description:
            "Ex-R&D Director of Bitfury and startup COO/Co-Founder with 16 years track record of engineering leadership in software companies. With Bitfury, Sergii implemented processes for efficient and transparent project delivery of the ASIC miner products. As a COO, he executed a strategic startup transformation and achieved 216% YoY revenue growth. Holds an Executive MBA degree from London Business School.",
        photo: "Sergii.png",
        socials: [{ img: <LinkedinIcon />, link: "https://www.linkedin.com/in/kashchenko/" }],
    },
];
