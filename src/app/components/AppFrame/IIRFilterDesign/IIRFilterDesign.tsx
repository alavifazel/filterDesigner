import React, { useEffect, useState } from 'react'
import { Plot } from '../Common/Plot'
import { Panel } from './Panel';
import { FilterTest } from '../Common/FilterTest';
import { IIREquation } from '../Common/IIREquation';
import { bilinearTransform, convolve, getCausalButterworthPoles, getImpulseResponse, H_of_s, ZeroPad } from '../Common/Utils';
import FFT from 'fft.js';
import { filterType, IIRfilterDesignMethod } from '../Common/enums';

export const IIRFilterDesign = () => {
    const [trigger, setTrigger] = useState(false);

    const [filterOrder, setFilterOrder] = useState(2);
    const [filterCoefficients, setFilterCoefficients] = useState<{ num: any[]; den: any[] }>({ num: [1], den: [] });
    const [lowCutoff, setLowCutoff] = useState(0.5);
    const [highCutoff, setHighCutoff] = useState(0.9);
    const [chosenFilterType, setChosenFilterType] = useState(filterType.LOWPASS);
    const [chosenDesignMethodType, setChosenDesignMethodType] = useState(IIRfilterDesignMethod.BUTTERWORTH);


    const [magnitudeResponse, setMagnitudeResponse] = useState({
        xValues: Array.from({ length: 1024 }, (_, i) => i / 1024 * Math.PI),
        yValues: Array.from({ length: 1024 }, (_, i) => 0)
    });

    const [phaseResponse, setPhaseResponse] = useState({
        xValues: Array.from({ length: 50 }, (_, i) => i / 50 * Math.PI),
        yValues: Array.from({ length: 50 }, (_, i) => 0)
    });

    const computeMagnitudeAndFreqOfTheFrequencyResponse = (h_of_z, FFTSize = 1024) => {
        let outPlotMag = {
            xValues: Array.from({ length: FFTSize / 2 }, (_, i) => i / FFTSize * 2 * Math.PI),
            yValues: Array.from({ length: FFTSize / 2 }, (_, i) => 0)
        };

        let x = getImpulseResponse(h_of_z);
        const fft = new FFT(FFTSize);
        const spectrum = fft.createComplexArray();
        fft.realTransform(spectrum, ZeroPad(x, FFTSize));

        // Compute magnitude of the freq. response
        const magnitude = new Array(FFTSize / 2);
        for (let i = 0; i < FFTSize / 2; i++) {
            magnitude[i] = Math.sqrt(Math.pow(spectrum[i * 2], 2) + Math.pow(spectrum[i * 2 + 1], 2));
        }
        outPlotMag.yValues = magnitude;
        setMagnitudeResponse(() => outPlotMag)

        // Compute phase of the freq. response
        const phase = new Array(FFTSize / 2);
        let outPlotPhase = {
            xValues: Array.from({ length: FFTSize / 2 }, (_, i) => i / FFTSize * 2 * Math.PI),
            yValues: Array.from({ length: FFTSize / 2 }, (_, i) => 0)
        };
        for (let i = 0; i < FFTSize / 2; i++) {
            phase[i] = Math.atan2(spectrum[2 * i + 1], spectrum[2 * i]);
        }
        outPlotPhase.yValues = phase;
        setPhaseResponse(() => outPlotPhase)
    }


    useEffect(() => {
        // Steps:
        // 1. Convert the discrete freq. to cont. freq. via the formula: Omega = 2*tan(w/2)
        // 2. Design an analog filter
        // 3. Convert the analog filter to digital filter (bilinear transform)

        // 1:
        const Omega_c = 2 * Math.tan(highCutoff / 2);
        // 2: 
        let poles = getCausalButterworthPoles(filterOrder, Omega_c);
        const h_of_s = H_of_s(poles, Omega_c, chosenFilterType);
        // 3. 
        const h_of_z = bilinearTransform(h_of_s);
        setFilterCoefficients(() => h_of_z);
        computeMagnitudeAndFreqOfTheFrequencyResponse(h_of_z)

    }, [trigger]);

    return (
        <div className="flex flex-1 items-stretch justify-center">
            <div className="flex flex-col">
                <Panel
                    trigger={trigger} updateTrigger={(e) => setTrigger(e)}
                    chosenFilterType={chosenFilterType} updateChoosenFilterType={(e) => setChosenFilterType(e)}
                    chosenMethod={chosenDesignMethodType} updateChosenMethod={(e) => setChosenDesignMethodType(e)}
                    filterOrder={filterOrder} updateFilterOrder={(e) => setFilterOrder(e)}
                    lowCutoff={lowCutoff} updateLowCutoff={(e) => setLowCutoff(e)}
                    highCutoff={highCutoff} updateHighCutoff={(e) => setHighCutoff(e)}
                />
                <FilterTest filterCoefficients={filterCoefficients} />
            </div>
            <div className="flex flex-col">
                <Plot
                    title="Magnitude"
                    x_axis_label="w (rad)"
                    y_axis_label="|H(jw)|"
                    dataToPlot={magnitudeResponse}
                    plotColor={"rgba(75, 192, 192, 1)"} />
                <IIREquation filterCoefficients={filterCoefficients} />
            </div>

            <Plot
                title="Phase"
                x_axis_label="w (rad)"
                y_axis_label="Phase (rad)"
                dataToPlot={phaseResponse}
                plotColor={"rgba(200, 130, 35, 1)"}
            />
        </div>

    )
}
