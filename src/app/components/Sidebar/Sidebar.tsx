// src/Sidebar.tsx
import React from 'react';

export const Sidebar = ({ items, selectedItem, updateSelectedItem }) => {
  return (
    <div className="flex flex-col px-5 py-4 border-r border-slate-200">
      {items.map((item, index) => (
        item.name === "prompt" ? (
          <div className="mt-auto" key={`prompt-${item.name}-${index}`}>
            <button
              className={`flex mt-auto h-10 p-2 text-sm rounded w-48 
                ${selectedItem.name === item.name ? "bg-white hover:bg-gray-50 shadow" : "hover:white"}`}
              onClick={() => updateSelectedItem(item)}
            >
              <p className="font-bold">{item.placeholder}</p>
            </button>
          </div>
        ) : (
          <button
            key={`item-${item.name}-${index}`}
            className={`flex h-10 p-2 text-sm rounded
              ${selectedItem.name === item.name ? "bg-white hover:bg-gray-50 shadow" : "hover:white"}`}
            onClick={() => updateSelectedItem(item)}
          >
            <p>{item.placeholder}</p>
          </button>
        )
      ))}
    </div>
  );
};

export default Sidebar;
