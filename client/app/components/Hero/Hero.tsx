'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { CiSearch } from "react-icons/ci";



const Hero = () => {


    const { theme, setTheme } = useTheme()

    return (
        <div className="relative flex items-center justify-between sm:pt-14 lg:pt-20 font-Poppins">

            <div className="lg:relative lg:flex lg:justify-between lg:items-center lg:w-full lg:px-10">
                <div className="w-full mb-[30px] flex flex-col lg:text-center">
                    <h1 className="font-semibold text-[40px] text-slate-700 dark:text-slate-200 md:leading-[68px] text-center md:text-start md:text-[50px] leading-[48px] md:mb-[8px]">
                        Welcome to Voxify: Where Code Meets Creativity
                    </h1>
                    <p
                        className="md:text-start md:text-[20px] md:leading-[32px] my-[40px] text-slate-700 dark:text-slate-200 text-center text-[16px]"
                    >
                        Join our coding community and embark on a journey of endless possibilities
                    </p>

                    <div className='relative pt-2 hidden md:block'>
                        <input
                            type="search" name="search" placeholder="Search"
                            className="hidden sm:flex items-center w-full text-left space-x-3 px-4 h-12 bg-white ring-1 ring-slate-900/10 hover:ring-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm rounded-lg text-slate-400 dark:bg-slate-800 dark:ring-0 dark:text-slate-300 dark:highlight-white/5 dark:hover:bg-slate-700"
                        />
                        <button type="submit" className="absolute right-0 top-0 mt-5 mr-4">
                            <CiSearch
                                size={25}
                            />
                        </button>
                    </div>
                </div>

                <div className="w-full flex md:justify-end justify-center items-center md:mb-80px mb-30px" id="right">
                    <Image
                        src={require(`../../assets/img/${theme === 'light' ? 'banner-white.png' : 'banner-dark.png'}`)}
                        className="w-full h-full lg:max-w-[600px] lg:max-h-[600px] md:max-w-[600px] md:max-h-[600px] max-w-[380px] max-h-[380px] lg:justify-end "
                        alt="Education banner"
                    />
                </div>
            </div>


        </div>
    )
}

export default Hero;
