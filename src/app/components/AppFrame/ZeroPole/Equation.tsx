// import MathJax from 'better-react-mathjax/MathJax'
import React, { useEffect, useState } from 'react'

export const Equation = ({ filterEquation, maxWidth, maxHeight }) => {
  const [equationToRender, setEquationToRender] = useState('');

  const computePollZeroLocation = (point) => {
    let omega = Math.atan((point.y - 200) / (point.x - 200)).toFixed(6);
    return `e^{${omega}j}`;
  }

  useEffect(() => {
    const generateLatexString = () => {
      setEquationToRender(filterEquation());
    }
  }, [filterEquation]);

  return (
    <div className="overflow-auto bg-gray-50 p-2 m-5 rounded-2xl shadow-md">
      <div className="p-4" style={{ height: '150px', width: '500px', position: 'relative' }}>
        <div className="font-bold">
            Filter equation:
        </div>
        {filterEquation ? filterEquation : "Empty"}
      </div>
    </div >
  )
}
