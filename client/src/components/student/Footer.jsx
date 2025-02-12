import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div>
      <footer className='bg-yellow-500/70 md:px-36 text-left w-full mt-10'>
        <div className='flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30'>
          <div className='flex flex-col md:items-start items-center w-full'>
            <img src={assets.logo_dark} alt="logo" />
            <p className='mt-6 text-center md:text-left text-sm text-black/80'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit sint ipsam et sapiente numquam a maiores</p>
          </div>
          <div className='flex flex-col md:items-start items-center w-full'>
            <h2 className='font-semibold text-black mb-5'>Company</h2>
            <ul className='flex md:flex-col w-full justify-between text-sm text-black'>
              <li><a href="#">Home</a></li>
              <li><a href="#">About us</a></li>
              <li><a href="#">Contact us</a></li>
              <li><a href="#">Privacy policy</a></li>
            </ul>
          </div>
          <div className='hidden md:flex flex-col items-start w-full'>
            <h2 className='font-semibold text-black mb-5'>Subscribe to our newsletter</h2>
            <p className='text-sm text-black/80'>The latest news, articles, adn resources, sent to your inbox weekly.</p>
            <div className='flex items-center gap-2 pt-4'>
              <input type="email" placeholder='Enter your email' className='border border-greey-500 bg-white text-gray-500 placeholder-gray-500 outline-none w-64 h-9 rounded text-sm'/>
              <button className='bg-white w-24 h-9 text-black rounded'>Subscribe</button>
            </div>
          </div>
        </div>
        <p className='py-4 text-center text-xs md:text-sm text-black/60'>Copyright 2025 @Salman. All Right Reserved</p>
      </footer>
    </div>
  )
}

export default Footer