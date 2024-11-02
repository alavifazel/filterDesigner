import React, { useState } from 'react'
import { ZPlane } from './ZPlane'
import { Equation } from '../Common/Equation'
import { Plot } from '../Common/Plot'
import { FilterTest } from '../Common/FilterTest'

export const ZeroPole = () => {
  const [points, setPoints] = useState([]);
  const [filterEquation, setFilterEquation] = useState('');
  const [filterCoefficients, setFilterCoefficients] = useState<{ num: any[]; den: any[] }>({ num: [1], den: [] });

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
            filterCoefficients={filterCoefficients}
            updateMagnitudeResponse={(e) => setMagnitudeResponse(e ? (_) => e : null)} 
            updatePhaseResponse={(e) => setPhaseResponse(e ? (_) => e : null) }
            updateFilterCoefficients={(e) => setFilterCoefficients((_) => e)}
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
            <Equation filterCoefficients={filterCoefficients} />
          </div>
          <div className="flex items-stretch overflow-hidden">
            <FilterTest polesAndZeroes={points} title="Phase" trigger={magnitudeResponse} 
                        filterCoefficients={filterCoefficients} updateFilterEquation={(e) => setFilterEquation(() => e)} />
          </div>
        </div>
      </div>
    </>
  )
}
