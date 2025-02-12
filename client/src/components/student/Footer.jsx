import React from 'react';
import { assets } from '../../assets/assets';

const Footer = () => {
  return (
    <footer className='bg-green-500/70 md:px-36 text-left w-full mt-10'>
      <div className='flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30'>
        {/* Logo & Description */}
        <div className='flex flex-col md:items-start items-center w-full'>
          <img src={assets.logo_dark} alt='logo' className='w-32' />
          <p className='mt-6 text-center md:text-left text-xl text-black/80'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Reprehenderit sint ipsam et sapiente numquam a maiores.
          </p>
        </div>

        {/* Company Links */}
        <div className='flex flex-col md:items-start items-center w-full'>
          <h2 className='font-bold text-black text-xl mb-5'>Company</h2>
          <ul className='flex md:flex-col w-full justify-between text-xl text-black space-y-2 md:space-y-0'>
            <li><a href='#'>Home</a></li>
            <li><a href='#'>About us</a></li>
            <li><a href='#'>Contact us</a></li>
            <li><a href='#'>Privacy policy</a></li>
          </ul>
        </div>

        {/* Newsletter Subscription */}
        <div className='hidden md:flex flex-col items-start w-full'>
          <h2 className='font-bold text-black text-xl mb-5'>Subscribe to our newsletter</h2>
          <p className='text-xl text-black/80'>
            The latest news, articles, and resources, sent to your inbox weekly.
          </p>
          <div className='flex items-center gap-2 pt-4'>
            <input 
              type='email' 
              placeholder='Enter your email' 
              className='border border-gray-500 bg-white text-gray-500 placeholder-gray-500 outline-none w-64 h-9 rounded text-sm px-2'
            />
            <button className='bg-white w-24 h-9 text-black rounded hover:bg-gray-200'>
              Subscribe
            </button>
          </div>
        </div>
      </div>
      {/* Copyright */}
      <p className='py-4 text-center text-xl md:text-sm text-black/60'>
        Copyright 2025 @Salman. All Rights Reserved.
      </p>
    </footer>
  );
};

export default Footer;
