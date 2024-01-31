'use client'

import { useState } from "react"
import Heading from "./utils/Meta/Heading"
import Header from "./components/Header/Header"
import Hero from "./components/Hero/Hero"



const Page = () => {

  const [open, setOpen] = useState(false)
  const [activeItem, setActivateItem] = useState(0)

  return (
    <div className="px-4 sm:px-6 md:px-10">
      <Heading
        title="Voxify: Learn, Code, and Excel in Programming"
        description="Unlock your coding potential with CodingHub, your ultimate destination for comprehensive programming tutorials, hands-on projects, and expert insights. From beginners to seasoned developers, discover a diverse range of programming languages, frameworks, and best practices to elevate your coding skills"
        keywords="Programming tutorials 
        Coding education 
        Learn coding online
        Developer resources
        Coding projects
        Programming languages
        Web development tutorials
        Software engineering tips
        Coding bootcamp
        Code optimization techniques"
      />
      <Header
        open={open}
        setOpen={setOpen}
        activeItem={activeItem}
      />
      <Hero />
    </div>
  )
}


export default Page