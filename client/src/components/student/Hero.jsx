import React from "react";
import SearchBar from "./SearchBar";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full pt-20 md:pt-36 px-7 md:px-0 text-center bg-gradient-to-b from-green-100/70">
      <h1 className="text-home-heading-small md:text-home-heading-large font-bold text-gray-800 max-w-3xl mx-auto">
        Empower your future with the courses designed to 
        <span className="text-green-600"> fit your choice.</span>
      </h1>
      
      <p className="hidden md:block text-gray-500 max-w-2xl mx-auto mt-4">
        We bring together world-class instructors, interactive content, and a supportive community to help you achieve your personal and professional goals.
      </p>
      
      <p className="md:hidden text-gray-500 max-w-sm mx-auto mt-3 mb-10">
        We bring together world-class instructors, interactive content, and a supportive community to help you achieve your personal and professional goals.
      </p>
      <br />
      <SearchBar />
    </div>
  );
};

export default Hero;
