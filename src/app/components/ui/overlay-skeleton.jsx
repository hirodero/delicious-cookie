'use client'
import { motion } from "framer-motion"
export const Overlay = ({items}) => {
    return(
        <motion.div 
        initial={{opacity:0}}
        animate={{opacity:1}}
        exit={{opacity:0}}
        className="flex fixed inset-0 text-white [-webkit-text-stroke:0.4px_black] [text-shadow:4px_4px_0_#000] justify-center items-center backdrop-blur-xs backdrop-brightness-120">
            {items}
        </motion.div>
    )
}
export const Placeholder = () => {
    return(
        <>
            <div className="w-full h-[10%] shadow-2xl"/>
            <div className="flex flex-col items-center justify-center w-full h-full gap-2">
                <motion.div 
                initial={{opacity:0, x:-100}}
                animate={{opacity:1, x:0}}
                transition={{duration:1}}
                className="flex flex-col justify-center w-full h-[10%] p-4 pl-[10%] text-6xl text-white bg-linear-to-r via-transparent from-green-700/70 to-transparent [-webkit-text-stroke:0.4px_black] [text-shadow:4px_4px_0_#000]"/>
                <motion.div 
                initial={{opacity:0}}
                animate={{opacity:1}}
                transition={{duration:0.4, type:'tween'}}
                className="w-[80%] h-[70%] p-4 text-white text-2xl bg-green-800/70 rounded-2xl [-webkit-text-stroke:0.3px_green] outline-3 font-extralight shadow-2xl"/>
            </div>
        </>
    )
}