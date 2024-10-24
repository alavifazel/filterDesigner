import React, { useState } from 'react'
import { ZPlane } from './ZPlane'
import { Equation } from './Equation'
import { Plot } from './Plot'
import { FilterTest } from './FilterTest'

export const ZeroPole = () => {
  const [points, setPoints] = useState([]);
  const [filterEquation, setFilterEquation] = useState('');

  const [magnitudeResponse, setMagnitudeResponse] = useState({
    xValues: Array.from({ length: 50 }, (_, i) => i / 50 * Math.PI),
    yValues: Array.from({ length: 50 }, (_, i) => 1)
  });

  const [phaseResponse, setPhaseResponse] = useState({
    xValues: Array.from({ length: 50 }, (_, i) => i / 50 * Math.PI),
    yValues: Array.from({ length: 50 }, (_, i) => 0)
  });

  return (
    <>
      <div className="flex items-stretch flex-1 justify-between bg-grey-100">
        <div className="flex flex-col flex-grow items-center">
          <ZPlane points={points}
            updatePoint={(e) => setPoints(e ? (prev) => [...prev, e] : [])}
            updateMagnitudeResponse={(e) => setMagnitudeResponse(e ? (prev) => e : null)} 
            updatePhaseResponse={(e) => setPhaseResponse(e ? (prev) => e : null) }
            />
        </div>

        <div className="flex flex-col flex-grow">
          <div className="flex items-stretch overflow-hidden">
            <Plot title="Magnitude" x_axis_label="w (rad)" y_axis_label="|H(jw)|" dataToPlot={magnitudeResponse} plotColor={"rgba(75, 192, 192, 1)"} />
          </div>

          <div className="flex items-stretch overflow-hidden">
            <Plot title="Phase" x_axis_label="w (rad)" y_axis_label="Phase (rad)" dataToPlot={phaseResponse} plotColor={"rgba(200, 130, 35, 1)"} />
          </div>
        </div>
        <div className="flex flex-col flex-grow">
          <div className="flex items-stretch overflow-hidden">
            <Equation filterEquation={filterEquation} maxWidth={500} maxHeight={500} />
          </div>
          <div className="flex items-stretch overflow-hidden">
            <FilterTest polesAndZeroes={points} title="Phase" magnitudeResponse={magnitudeResponse} 
                        filterEquation={filterEquation} updateFilterEquation={(e) => setFilterEquation(() => e)} />
          </div>
        </div>
      </div>
    </>
  )
}
