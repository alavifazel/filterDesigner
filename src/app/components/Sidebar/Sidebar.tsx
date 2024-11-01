// src/Sidebar.js
import React from 'react';

const items = ["Zero-pole placement"];

export const Sidebar = () => {
  const [selectedItem, setSelectedItem] = React.useState(items[0]);

  return (
    <div className="w-64 px-5 py-4 border-r border-slate-200">      
      {items.map((item) => (
        <button
          key={item}
          className={`flex p-2 text-sm rounded w-full 
              ${selectedItem === item ? "bg-white hover:bg-gray-100 shadow" : "hover:bg-gray-100"}`}
          onClick={() => setSelectedItem(item)}
        >
          <p>{item}</p>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;
