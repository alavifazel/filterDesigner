// import MathJax from 'better-react-mathjax/MathJax'
import React, { useEffect, useState } from 'react'

export const IIREquation = ({ filterCoefficients }) => {
  const [filterEquation, setFilterEquation] = useState('');

  const constructFilterEquationString = (filterCoefficients) => {
    if(filterCoefficients.num.length == 0 && filterCoefficients.den.length == 0) return "y[n] = x[n]";
    let output = "y[n] = ";
    for (let i = 0; i < filterCoefficients.num.length; i++) {
      if (filterCoefficients.num[i] == 1)
        output += "x[n]";
      else output += String(Math.abs(Number(filterCoefficients.num[i])).toFixed(2)) + "x[n" + (i != 0 ? "-" + String(i) + "]" : "]");
      if (i < filterCoefficients.num.length - 1 && filterCoefficients.num.length > 1)
        if (filterCoefficients.num[i + 1] > 0)
          output += " + ";
        else
          output += " - ";
    }
    if (filterCoefficients.num.length > 0 && (filterCoefficients.den.length > 0 && filterCoefficients.den[1])) {
      output += " + ";
    }

    for (let i = 1; i < filterCoefficients.den.length; i++) {


      if (filterCoefficients.den[i] != 0) {
        output += String(Math.abs(Number(filterCoefficients.den[i])).toFixed(2)) + "y[n" + ("-" + String(i) + "]" )
      }
      if (i != filterCoefficients.den.length - 1)
        if (filterCoefficients.den[i + 1] > 0)
          output += " + ";
        else
          output += " - ";
    }
    return output;
  }

  useEffect(() => {
      if(filterCoefficients) setFilterEquation(() => constructFilterEquationString(filterCoefficients));
  }, [filterCoefficients]);

  return (
    <div className="overflow-x-scroll bg-gray-50 p-2 my-5 mx-2 rounded-2xl shadow-md" style={{ height: '168px', width: '550px'}}>
      <div className="p-4" style={{ height: '150px', width: '500px'}}>
        <div className="font-bold">
          Filter equation:
        </div>
        {filterEquation ? filterEquation : "Empty"}
      </div>
    </div >
  )
}
