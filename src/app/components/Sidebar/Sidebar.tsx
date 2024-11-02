// src/Sidebar.js
import React from 'react';


export const Sidebar = ({items, selectedItem, updateSelectedItem}) => {
  
  return (
    <div className="w-64 px-5 py-4 border-r border-slate-200">      
      {items.map((item) => (
        <button
          key={item.name}
          className={`flex p-2 text-sm rounded w-full 
              ${selectedItem.name === item.name ? "bg-white hover:bg-gray-50 shadow" : "hover:white"}`}
          onClick={() => updateSelectedItem(item)}
        >
          <p>{item.placeholder}</p>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
