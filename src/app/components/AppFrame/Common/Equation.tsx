import React from 'react'

export const Equation = ({ filterCoefficients }) => {
  return (
    <div className="flex flex-col justify-between h-screen bg-gray-50 p-2 mx-2 my-5 rounded-2xl shadow-md p-5 overflow-auto" style={{ height: '320px', width: '500px' }}>

      <div>
        <p className="text-lg text-gray-900 font-bold my-5">Filter Coefficients:</p>

      </div>
      <div className="flex-grow overflow-auto">
        {filterCoefficients}
      </div>
      <div className="mt-5">
        <button onClick={() => {navigator.clipboard.writeText(filterCoefficients)}} className="p-2 bg-slate-800 text-white rounded-lg hover:bg-gray-700 w-32">Copy</button>

      </div>
    </div>


  )
}
