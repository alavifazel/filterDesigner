import React, { useEffect } from 'react'
import { useState } from 'react';
import { useRef } from 'react'
import { Plot } from './Plot';

export const ZPlane = ({ points, updatePoint, updateMagnitudeResponse, updatePhaseResponse }) => {
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [option, setOption] = useState("graphical")
    const [poleSelected, setPollSelected] = useState(true);
    const [poleZeroOption, setpoleZeroOption] = useState("zero");
    const [poleZeroUserEntered, setPoleZeroUserEntered] = useState("");

    const changepoleZeroOption = (e) => {
        setpoleZeroOption(e.target.value);
    };

    const handlePoleZeroUserEntered = (e) => {
        setPoleZeroUserEntered(e.target.value)
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            setCtx(context);
            drawBackground(context); // Draw background initially
        }
    }, []);

    const drawBackground = (context) => {
        context.lineWidth = 2;
        context.fillStyle = "bg-blue-100"
        // Drawing the circle
        context.beginPath();
        context.arc(200, 200, 200, 0, 5 * Math.PI);
        context.stroke();

        // Y-Axis                
        context.beginPath();
        context.moveTo(200, 0);
        context.lineTo(200, 400);
        context.stroke();

        // X-Axis                
        context.beginPath();
        context.moveTo(0, 200);
        context.lineTo(400, 200);
        context.stroke();
    };

    const drawPoint = (ctx, x, y, pollOrZero) => {
        if (!pollOrZero) {
            const radius = 5;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.closePath();
        } else {
            const size = 10; 
            ctx.beginPath();
            ctx.moveTo(x - size, y - size);
            ctx.lineTo(x + size, y + size);
            ctx.moveTo(x - size, y + size);
            ctx.lineTo(x + size, y - size);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();
        }
    };

    const handleCanvasClick = (e) => {
        const { x, y } = getMousePos(canvasRef.current, e);

        if (Math.abs(y - 200) > 5) {
            const y_conj = y + 2 * (200 - y);
            drawPoint(ctx, x, y, poleSelected);
            drawPoint(ctx, x, y_conj, poleSelected);
            updatePoint({ poleSelected: poleSelected, point: { x: x, y: y } });
            updatePoint({ poleSelected: poleSelected, point: { x: x, y: y_conj } });
        } else {
            updatePoint({ poleSelected: poleSelected, point: { x: x, y: 200 } });
            drawPoint(ctx, x, 200, poleSelected);
        }
    };

    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    const addPoleZeroUserEntered = () => {
        const realNumberPattern = /[-+]?[0-9]*\.?[0-9]*/;
        const complexNumberPattern = /([-+]?[0-9]*\.?[0-9]*)\s*(\+)\s*([-+]?[0-9]*\.?[0-9]*)j/;
        const matchReal = poleZeroUserEntered.match(realNumberPattern);
        const matchComplex = poleZeroUserEntered.match(complexNumberPattern);
        const isPoleSelected = poleZeroOption === "pole" ? true : false;
        if (matchComplex) {
            const realPart = parseFloat(matchComplex[1]);
            const imaginaryPart = parseFloat(matchComplex[3]);

            const x = 200 + realPart * 200;
            const y = 200 - imaginaryPart * 200;
            const y_conj = 200 + imaginaryPart * 200;

            drawPoint(ctx, x, y, isPoleSelected);
            drawPoint(ctx, x, y_conj, isPoleSelected);
            updatePoint({ poleSelected: isPoleSelected, point: { x: x, y: y } });
            updatePoint({ poleSelected: isPoleSelected, point: { x: x, y: y_conj } });

        } else if (matchReal) {
            const number = parseFloat(matchReal[0]);
            const x = 200 + number * 200;
            const y = 200;
            drawPoint(ctx, x, y, isPoleSelected);
            updatePoint({ poleSelected: isPoleSelected, point: { x: x, y: y } });
        } else {
            // TODO: Show the error message on the front-end UI
            console.error("ERROR: NO MATCH!");
        }
    }

    const pollSelected = () => {
        setPollSelected(true);
    }
    const zeroSelected = () => {
        setPollSelected(false);
    }

    const getCoordinateOfUnitCircle = (omega) => {
        return { x: Math.cos(omega), y: Math.sin(omega) };
    }

    const getNormalizedCoordinate = (point) => {
        return { x: (point.x - 200) / 200, y: (point.y - 200) / 200 };
    }

    const distanceBetweenTwoEuclideanCoordinates = (p1, p2) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    const phaseDifferenceBetweenTwoPoints = (p1, p2) => {
        return Math.atan2((p2.y - p1.y), (p2.x - p1.x));
    }

    const generateResponse = () => {
        // Calculate the magnitude of the frequency response
        const resolution = 100;
        const xValues = Array.from({ length: resolution }, (i, j) => j / resolution * Math.PI); // x from -10 to 10
        let yValues = [];
        for (let i = 0; i < xValues.length; i++) {
            let num = 1;
            let den = 1;
            for (let j = 0; j < points.length; j++) {
                let p1 = getCoordinateOfUnitCircle(xValues[i]);
                let p2 = getNormalizedCoordinate(points[j].point);
                if (points[j].poleSelected)
                    den *= distanceBetweenTwoEuclideanCoordinates(p1, p2);
                else
                    num *= distanceBetweenTwoEuclideanCoordinates(p1, p2);
            }
            yValues.push(num / den);
        }
        updateMagnitudeResponse({ xValues: xValues, yValues: yValues });

        // Calculate the phase of the frequency response
        yValues = [];
        for (let i = 0; i < xValues.length; i++) {
            let num = 0;
            let den = 0;
            for (let j = 0; j < points.length; j++) {
                let p1 = getCoordinateOfUnitCircle(xValues[i]);
                let p2 = getNormalizedCoordinate(points[j].point);
                if (points[j].poleSelected)
                    den += phaseDifferenceBetweenTwoPoints(p1, p2);
                else
                    num += phaseDifferenceBetweenTwoPoints(p1, p2);
            }
            yValues.push(num - den);
        }
        updatePhaseResponse({ xValues: xValues, yValues: yValues });
    }

    const resetSelected = () => {
        updatePoint(null);
        const canvas = canvasRef.current;
        const context = ctx;
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
        drawBackground(context);
        updateMagnitudeResponse({
            xValues: Array.from({ length: 50 }, (_, i) => i / 50 * Math.PI),
            yValues: Array.from({ length: 50 }, (_, i) => 1)
        });
        updatePhaseResponse({
            xValues: Array.from({ length: 50 }, (_, i) => i / 50 * Math.PI),
            yValues: Array.from({ length: 50 }, (_, i) => 0)
        });
        setPoleZeroUserEntered('');
    }

    const onOptionSelect = (e) => {
        setOption(e.target.value)
    }

    return (
        <div className="bg-gray-50 p-2 m-5 rounded-2xl shadow-md">
            <div>
                <button onClick={pollSelected} className="h-12 my-2 mx-2 px-7 bg-indigo-700 text-white text-lg rounded-lg hover:bg-blue-800">Pole</button>
                <button onClick={zeroSelected} className="h-12 my-2 mx-2 px-7 bg-indigo-700 text-white text-lg rounded-lg hover:bg-blue-800">Zero</button>
                <button onClick={resetSelected} className="h-12 my-2 mx-2 px-7 bg-gray-200 text-black text-lg rounded-lg hover:bg-gray-300">Reset</button>
            </div>
            <div>
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={400}
                    onClick={handleCanvasClick}
                    style={{ backgroundColor: '#F8FAFC', border: '1px solid black', cursor: 'crosshair' }}
                ></canvas>
                
                <button
                    onClick={() => {
                    }}
                >
                </button>
            </div>

            <div className="flex place-items-center">
                <input type="text" value={poleZeroUserEntered} onChange={handlePoleZeroUserEntered} className="mr-1 outline outline-slate-300 outline-1 outline-offset-2 rounded-lg block w-full p-2.5 dark:text-white" placeholder="Complex Number" required />
                <button onClick={addPoleZeroUserEntered} className="h-10 px-6 m-1 text-lg text-indigo-100 bg-black rounded-lg focus:shadow-outline hover:bg-gray-800">Add</button>
            </div>
            <div className="flex mt-3 mb-3">
                <div className="flex justify-center flex-1 m-3">
                    <label className="mr-4 text-sm font-bold text-gray-900 dark:text-gray-300">
                        Zero
                    </label>
                    <input
                        className="w-4"
                        type="radio"
                        value="zero"
                        checked={poleZeroOption === 'zero'}
                        onChange={changepoleZeroOption}
                    />
                </div>

                <div className="flex items-center flex-1 m-3">
                    <label className="mr-4 text-sm font-bold text-gray-900 dark:text-gray-300">
                        Pole
                    </label>
                    <input
                        className="w-4"
                        type="radio"
                        value="pole"
                        checked={poleZeroOption === 'pole'}
                        onChange={changepoleZeroOption}
                    />
                </div>
            </div>

            <div className="flex">
                <button onClick={generateResponse} className="flex-grow h-12 my-2 mx-2 px-7 bg-indigo-700 text-white text-lg rounded-lg hover:bg-blue-800">Frequency Response</button>
            </div>
        </div>
    )
}
