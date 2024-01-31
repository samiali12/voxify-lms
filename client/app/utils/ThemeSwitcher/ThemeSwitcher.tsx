"use client"

import { useState, useEffect } from "react";
import { BiMoon, BiSun } from "react-icons/bi";
import { useTheme } from "next-themes";


const ThemeSwitcher = () => {

    const [mounted, setMounted] = useState(false);
    const {theme, setTheme} = useTheme();

    useEffect(() => setMounted(true), [])

    if(!mounted){
        return null;
    }

    return (
        <div className="flex items-center justify-between">
            {
                theme === "light" ? (
                    <BiMoon
                    className="cursor-pointer text-sky-500"
                    size={25}
                    onClick={() => setTheme("dark")}
                     />
                ) : (
                    <BiSun 
                    className="cursor-pointer text-sky-500"
                    size={25}
                    onClick={() => setTheme("light")}
                    />
                )
            }
        </div>
    )
}

export default ThemeSwitcher;