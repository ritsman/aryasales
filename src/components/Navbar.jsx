import React, { useState, useEffect } from "react";
import { FaHome, FaBars, FaTimes } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const navLinks = [
  { name: "home", icon: <FaHome />,path: "/" },
  { name: "dashboard" },
  { name: "scheduler" },
  { name: "gallery",path: "/gallery" },
  { name: "sales" },
  { name: "workorder" },
  { name: "material" },
  { name: "inventory",path: "/inventory" },
  { name: "finance" },
  { name: "master",path: "/master" },
  { name: "shipment" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    // Function to check screen width and set state
    const checkScreenSize = () => {
      const isLarge = window.innerWidth >= 768; // md breakpoint for Tailwind
      setIsLargeScreen(isLarge);
      if (isLarge) {
        setMenuOpen(true); // Show menu on large screens by default
      } else {
        setMenuOpen(false); // Hide menu on small screens initially
      }
    };

    checkScreenSize(); // Initial check

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  return (
    <nav className="bg-white shadow-md" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
        {/* Logo or title can go here */}

        {/* Hamburger button for small screens */}
        {!isLargeScreen && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="text-gray-800 focus:outline-none text-2xl"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        )}
      </div>

      {/* Navigation Links */}
      {menuOpen && (
        <div className="px-4 pb-4 md:flex md:space-x-6 md:px-8 md:pb-0">
          {navLinks.map(({ name, path, icon }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                `flex items-center space-x-2 py-2 md:py-0 font-medium transition-colors capitalize ${
                  isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                }`
              }
              onClick={() => !isLargeScreen && setMenuOpen(false)} // Close menu on small screen after click
            >
              {icon && <span className="text-lg">{icon}</span>}
              <span>{name}</span>
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;