// src/components/Sidebar.jsx
import React, { useState } from "react";
import img1 from "../logo_lifemar.png"
import {
  HomeIcon,
  UserIcon,
  ShoppingCartIcon,
  CubeIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { Link, NavLink } from "react-router";

export default function Sidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggle = () => setMenuOpen(!menuOpen);

  return (
    <>
      {/* Botão Hamburger fixo no mobile */}
      <button
        onClick={toggle}
        className="lg:hidden fixed top-12 left-4 z-50 text-2xl text-white border border-blue-500 p-2 rounded-full hover:scale-110 transition-all duration-300 z-50 "
      >
        {menuOpen==false?(
       <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 transition-all duration-300"
        >
      
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>):(<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
        
        )}
      </button>

      {/* Overlay escuro no mobile */}
      {menuOpen && (
        <div
          onClick={toggle}
          className="fixed inset-0 bg-black/50 lg:hidden transition-opacity duration-500 z-30"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-gradient-to-b from-gray-900 to-blue-950 text-gray-200 shadow-lg
          fixed h-full top-0 left-0  w-64 transform transition-transform duration-500 ease-in-out z-40
          ${menuOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static lg:w-64`}
      >
        {/* Logo */}
        <div className="px-6 py-4  w-50 text-xl font-bold border-b border-gray-700">
          
          <img src={img1}></img>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2 divide-y divide-gray-700/40">
            {[
              { name: "Dashboard", icon: HomeIcon, to: "/" },
              { name: "Clientes", icon: UserIcon, to: "/clientes" },
              { name: "Mercadorias", icon: ShoppingCartIcon, to: "/mercadorias" },
              { name: "Vendas", icon: CubeIcon, to: "/vendas" },
              { name: "Stock", icon: CubeIcon, to: "/stock" },
              // { name: "Configurações", icon: CogIcon, to: "#" },
            ].map((item, idx) => (
              <li key={idx} className="group py-2">
                {item.to.startsWith("/") ? (
                  <NavLink
                    to={item.to}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </NavLink>
                ) : (
                  <a
                    href={item.to}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </a>
                )}
                <div className="h-[2px] w-0 bg-cyan-500 group-hover:w-full transition-all duration-300 mx-auto mt-1" />
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}