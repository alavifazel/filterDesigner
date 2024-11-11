import React, { useEffect, useState } from 'react'
import { Plot } from '../Common/Plot'
import { Panel } from './Panel';
import { filterDesignMethod, filterType } from './enums';
import { FilterTest } from '../Common/FilterTest';
import { IIREquation } from '../Common/IIREquation';
import { complex } from 'mathjs';
import { convolve, getImpulseResponse, ZeroPad } from '../Common/Utils';
import FFT from 'fft.js';

export const IIRFilterDesign = () => {
    const [trigger, setTrigger] = useState(false);

    const [filterOrder, setFilterOrder] = useState(2);
    const [filterCoefficients, setFilterCoefficients] = useState<{ num: any[]; den: any[] }>({ num: [1], den: [] });
    const [lowCutoff, setLowCutoff] = useState(0.5);
    const [highCutoff, setHighCutoff] = useState(0.9);
    const [chosenFilterType, setChosenFilterType] = useState(filterType.LOWPASS);
    const [chosenDesignMethodType, setChosenDesignMethodType] = useState(filterDesignMethod.BUTTERWORTH);


    const [magnitudeResponse, setMagnitudeResponse] = useState({
        xValues: Array.from({ length: 1024 }, (_, i) => i / 1024 * Math.PI),
        yValues: Array.from({ length: 1024 }, (_, i) => 0)
    });

    const [phaseResponse, setPhaseResponse] = useState({
        xValues: Array.from({ length: 50 }, (_, i) => i / 50 * Math.PI),
        yValues: Array.from({ length: 50 }, (_, i) => 0)
    });

    const getCausalButterworthPoles = (N, Omega_c) => { // N = Filter Order
        let s_k = [];
        for (let k = 0; k < 2 * N; k++) {
            let tmp = (Math.PI) / (2 * N) * (N + 2 * k - 1);
            s_k.push(complex(Omega_c * Math.cos(tmp), Omega_c * Math.sin(tmp)));
        }
        return s_k.filter(e => e.re < 0);
    }

    const H_of_s = (poles, Omega_c) => {
        let convRes = [];
        let tmp = [];
        for (let i = 0; i < poles.length; i++) {
            tmp.push([1, complex(-poles[i].re, -poles[i].im)]);
        }

        let tmp2 = tmp[0];
        for (let i = 1; i < tmp.length; i++) {
            tmp2 = convolve(tmp2, tmp[i]);
        }
        convRes = tmp2;

        let res = [1];
        for (let i = 1; i < convRes.length; i++) {
            res.push(convRes[i].re);
        }
        return { num: [Math.pow(Omega_c, poles.length)], den: res };
    }

    const addArraysFromRight = (arr1, arr2) => {

        let maxLength = arr1.length > arr2.length ? arr1.length : arr2.length;
        let res = Array(maxLength).fill(0);
        let arr1LastIndex = arr1.length - 1;
        let arr2LastIndex = arr2.length - 1;

        for (let i = maxLength - 1; i >= 0; i--) {
            if (arr1LastIndex >= 0) res[i] += arr1[arr1LastIndex--];
            if (arr2LastIndex >= 0) res[i] += arr2[arr2LastIndex--];
        }

        return res;
    };

    const construct_Z_plus_one_or_Z_minus_one_polynomial = (N, diff) => {
        let polynomialCoeffs = [];
        for (let i = 0; i < N - diff; i++)
            polynomialCoeffs.push([1, 1]);

        for (let i = 0; i < diff; i++)
            polynomialCoeffs.push([1, -1]);

        let res = polynomialCoeffs[0];
        for (let i = 1; i < polynomialCoeffs.length; i++) {
            res = convolve(res, polynomialCoeffs[i]);
        }
        return res;
    }

    const aValueTimesElementsOfArray = (K, arr) => {
        let res = [];
        for (let i = 0; i < arr.length; i++) {
            res.push(arr[i] * K);
        }
        return res;
    }

    const bilinearTransform = (coeff: { num: any[]; den: any[] }) => { // Receives transfer function coefficients as an array
        // Necessary to reverse them to make it suitable to apply the next procedures
        coeff.num = coeff.num.reverse();
        coeff.den = coeff.den.reverse();

        const N = Math.max(coeff.num.length, coeff.den.length) - 1;
        const K = 2;
        let tmp = [];
        for (let i = 0; i < coeff.num.length; i++) {
            tmp.push(aValueTimesElementsOfArray(coeff.num[i] * Math.pow(K, i), construct_Z_plus_one_or_Z_minus_one_polynomial(N, i)));
        }

        let resNum = tmp[0];
        for (let i = 1; i < tmp.length; i++)
            resNum = addArraysFromRight(resNum, tmp[i])

        tmp = [];
        for (let i = 0; i < coeff.den.length; i++) {
            tmp.push(aValueTimesElementsOfArray(coeff.den[i] * Math.pow(K, i), construct_Z_plus_one_or_Z_minus_one_polynomial(N, i)));
        }

        let resDen = tmp[0];
        for (let i = 1; i < tmp.length; i++)
            resDen = addArraysFromRight(resDen, tmp[i])

        // Normalize
        let firstCoefBeforeBeingChanged = resDen[0];
        for (let i = 0; i < resDen.length; i++)
            resDen[i] = resDen[i] / firstCoefBeforeBeingChanged;

        for (let i = 0; i < resNum.length; i++)
            resNum[i] = resNum[i] / firstCoefBeforeBeingChanged;

        return { num: resNum, den: resDen };
    }

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
        const h_of_s = H_of_s(poles, Omega_c);
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
            <Plot
                title="Magnitude"
                x_axis_label="w (rad)"
                y_axis_label="|H(jw)|"
                dataToPlot={magnitudeResponse}
                plotColor={"rgba(75, 192, 192, 1)"} />
            <Plot
                title="Phase"
                x_axis_label="w (rad)"
                y_axis_label="Phase (rad)"
                dataToPlot={phaseResponse}
                plotColor={"rgba(200, 130, 35, 1)"}
            />

            <IIREquation filterCoefficients={filterCoefficients} />

        </div>

    )
}
