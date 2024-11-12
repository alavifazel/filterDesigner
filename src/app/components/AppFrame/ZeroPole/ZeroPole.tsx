import React, { useState } from 'react'
import { ZPlane } from './ZPlane'
import { IIREquation } from '../Common/IIREquation'
import { Plot } from '../Common/Plot'
import { FilterTest } from '../Common/FilterTest'

export const ZeroPole = () => {
  const [points, setPoints] = useState([]);
  const [filterCoefficients, setFilterCoefficients] = useState<{ num: any[]; den: any[] }>({ num: [], den: [] });

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
      <div className="flex flex-1 items-stretch justify-center">
        <div className="flex flex-col items-center">
          <ZPlane
            points={points}
            updatePoint={(e) => setPoints(e ? (prev) => [...prev, e] : [])}
            updateMagnitudeResponse={(e) => setMagnitudeResponse(e ? (_) => e : null)}
            updatePhaseResponse={(e) => setPhaseResponse(e ? (_) => e : null)}
            updateFilterCoefficients={(e) => setFilterCoefficients((_) => e)}
          />
        </div>

        <div className="flex flex-col">
          <Plot
            title="Magnitude"
            x_axis_label="w (rad)"
            y_axis_label="|H(jw)|"
            dataToPlot={magnitudeResponse}
            plotColor={"rgba(75, 192, 192, 1)"}
          />
          <Plot
            title="Phase"
            x_axis_label="w (rad)"
            y_axis_label="Phase (rad)"
            dataToPlot={phaseResponse}
            plotColor={"rgba(200, 130, 35, 1)"}
          />
        </div>

        <div className="flex flex-col">
          <IIREquation filterCoefficients={filterCoefficients} />
          <FilterTest filterCoefficients={filterCoefficients} />
        </div>
      </div>
    </>
  )
}
