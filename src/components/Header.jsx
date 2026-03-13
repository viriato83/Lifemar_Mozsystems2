
import React from "react";
import { useAuth } from "../context/authContext";

export default function Header() {
  const Usuario= sessionStorage.getItem("login")
    const { user, logout } = useAuth();
  return (
    <header className= "bg-gradient-to-r  from-gray-900 to-blue-950   text-white px-6 py-4 flex items-center transition-all duration-200 justify-between shadow-md  ">
      {/* Logo ou Nome do Sistema */}
      <div className="text-xl font-bold tracking-wide">
        Mozsystems
      </div>

      
  

      {/* Perfil / Bem-vindo */}
      <div className="flex items-center gap-3">
        <span className="text-sm sm:text-xl">Bem-vindo, {Usuario}!</span>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
</svg>

      <button className="cursor-pointer bg-gray-800 w-20 rounded-xl shadow-blue-700 " onClick={()=>{
        sessionStorage.clear(),
         logout ,
         window.location.reload()

      }}>
        Sair
      </button>

      </div>
    </header>
  );
}
