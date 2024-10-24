import React from 'react'

export const RouteSelect = () => {
  return (
    <div>
        <Route selected={true} title="Zero-Poll Placement" />
    </div>
  )
};

const Route = ({selected, title}) => {
    return (
        <button
            className={`flex items-center justify-start text-sm rounded w-full p-2 
                ${ selected ? "bg-white hover:bg-gray-100 shadow" : "hover:bg-gray-200" }`}>
            <p>{title}</p>
        </button>
    );
}
