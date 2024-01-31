'use client'

import ThemeSwitcher from "@/app/utils/ThemeSwitcher/ThemeSwitcher";
import Link from "next/link";
import { FC, useState } from "react";
import { FiMenu } from "react-icons/fi";
import { MdClose } from "react-icons/md";
import { motion, useAnimation } from 'framer-motion';
import { BiMoon, BiSun } from "react-icons/bi";
import { useTheme } from "next-themes";
import { IoIosArrowDown } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";



const navItems = [
    { name: 'Home', href: '/home' },
    { name: 'Courses', href: '/courses' },
    { name: 'About', href: '/about' },
    { name: 'Policy', href: '/policy' },
    { name: 'FAQ', href: '/faq' },
];

type Props = {
    open: boolean;
    setOpen: (open: boolean) => void;
    activeItem: number;
}

const variants = {
    open: { opacity: 1, translateX: 0 },
    closed: { opacity: 0, translateX: '-100%' },
};

const Header: FC<Props> = (props) => {

    const [toggle, setToggle] = useState(false)
    const [selectedTheme, setSelectedTheme] = useState('light');
    const { theme, setTheme } = useTheme()
    const controls = useAnimation();

    const handleThemeChange = (event: { target: { value: any; }; }) => {
        const selectedValue = event.target.value;
        setTheme(selectedValue);
        setSelectedTheme(selectedValue);
    };

    return (
        <div>
            <div className="w-full h-20 relative flex justify-between items-center mx-auto md:pt-8 pt-6 font-Poppins dark:text-slate-200 lg:px-10">

                <div className="justify-start">
                    <a className="font-semibold text-[30px]">Voxify</a>
                </div>

                <div className="flex items-center">

                    <button className="md:hidden text-slate-500 hover:text-slate-600 dark:text-slate-400 hover:dark:text-slate-300">
                        <FiMenu
                            size={30}
                            onClick={() => setToggle(true)}
                        />
                    </button>


                    <div className="hidden md:flex items-center text-lg font-semibold">
                        <ul className="flex items-center gap-x-8">
                            {
                                navItems?.map((item, index) => (
                                    <li key={index}>
                                        <Link href={item.href} className="hover:text-sky-500 dark:hover:text-sky-400">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))
                            }
                        </ul>

                        <div className="flex items-center justify-between border-l border-slate-200 ml-6 pl-6 dark:border-slate-800">
                            <ThemeSwitcher />
                            <button className="ml-6 block text-state-400 hover:text-slate-500 dark:hover:text-slate-300">
                                <FaUserCircle
                                    className="cursor-pointer"
                                    size={25}
                                />
                            </button>

                        </div>
                    </div>

                    {
                        toggle && (
                            <div className="fixed z-50 inset-0 md:hidden">
                                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm dark:bg-slate-900/80" id="headlessui-dialog-overlay-:r8:" aria-hidden="true" data-headlessui-state="open"></div>
                                <motion.div
                                    className="fixed right-0 w-full h-full max-w-sm bg-white rounded-lg shadow-lg p-6 font-semibold text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:highlight-white/5 font-Poppins text-lg"
                                    variants={variants}
                                >
                                    <button className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-600 dark:text-slate-400 hover:dark:text-slate-300">
                                        <MdClose
                                            size={30}
                                            onClick={() => setToggle(false)}
                                        />
                                    </button>
                                    <div className="space-y-6">
                                        <ul className="flex flex-col gap-8 list-none w-full h-full">
                                            {
                                                navItems?.map((item, index) => (
                                                    <li key={index}>
                                                        <Link href={item.href} className="hover:text-sky-500 dark:hover:text-sky-400">
                                                            {item.name}
                                                        </Link>
                                                    </li>
                                                ))
                                            }

                                        </ul>
                                    </div>

                                    <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-200/10">

                                        <Link
                                            href="/login"
                                            className="flex items-center justify-center p-2 rounded-md bg-sky-500 dark:bg-slate-600">
                                            <FaUserCircle
                                                className="cursor-pointer text-slate-200"
                                                size={25}
                                                onClick={() => setTheme("dark")}
                                            />
                                            <span className="ml-2 mr-2 text-slate-200">Login</span>

                                        </Link>

                                    </div>
                                    <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-200/10">

                                        <div className="flex items-center justify-between">
                                            <label htmlFor="theme" className="text-slate-700 font-normal dark:text-slate-400">Switch theme</label>
                                            <div className="relative flex items-center ring-1 ring-slate-900/10 rounded-lg shadow-sm p-2 text-slate-700 font-semibold dark:bg-slate-600 dark:ring-0 dark:highlight-white/5 dark:text-slate-200">
                                                {
                                                    theme !== "light" ? (
                                                        <div className="flex items-center justify-between p-1">
                                                            <BiMoon
                                                                className="cursor-pointer text-slate-700  dark:text-slate-400"
                                                                size={25}
                                                                onClick={() => setTheme("dark")}
                                                            />
                                                            <span className="ml-2 mr-2">Dark Mode</span>
                                                            <IoIosArrowDown
                                                                className="cursor-pointer text-slate-700  dark:text-slate-400"
                                                                size={25}
                                                            />
                                                        </div>
                                                    ) : (

                                                        <div className="flex items-center justify-between p-1">
                                                            <BiSun
                                                                className="cursor-pointer text-slate-700  dark:text-slate-400"
                                                                size={25}
                                                                onClick={() => setTheme("light")}
                                                            />
                                                            <span className="ml-2 mr-2">Light Mode</span>
                                                            <IoIosArrowDown
                                                                className="cursor-pointer text-slate-700  dark:text-slate-400"
                                                                size={25}
                                                            />
                                                        </div>
                                                    )
                                                }
                                                <select
                                                    onChange={handleThemeChange}
                                                    value={selectedTheme}
                                                    id="theme" className="absolute inset-0 appearance-none opacity-0 h-full w-full">
                                                    <option value="light">Light</option>
                                                    <option value="dark">Dark</option>
                                                </select>
                                            </div>
                                        </div>

                                    </div>

                                </motion.div>
                            </div>

                        )
                    }

                </div>




            </div>
        </div>
    )
}

export default Header;