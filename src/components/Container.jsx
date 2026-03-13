// src/components/Container.jsx
import React from "react";
export default function Container({ children }) {
  return (
    <div className="bg-gray-800 text-gray-950 lg:min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-64 lg:flex-shrink-0">
        {children[0]}
      </div>

      {/* Conteúdo principal (Header + Dashboard) */}
      <div className="flex-1 flex flex-col">
        {children[1]}
        <div className="p-4 sm:p-6 flex-1">{children[2]}</div>
      </div>
    </div>
  );
}