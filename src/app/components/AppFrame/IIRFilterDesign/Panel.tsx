import React, { useState } from 'react'
import { filterDesignMethod, filterType } from './enums';

export const Panel = ({ trigger, updateTrigger,
    chosenFilterType, updateChoosenFilterType,
    chosenMethod, updateChosenMethod,
    filterOrder, updateFilterOrder,
    lowCutoff, highCutoff,
    updateLowCutoff, updateHighCutoff
}) => {

    const [fitlerTypeDropdownIsOpen, setFitlerTypeDropdownIsOpen] = useState(false);
    const [windowTypeDropdownIsOpen, setWindowTypeDropdownIsOpen] = useState(false);

    const toggleFilterTypeDropdown = () => setFitlerTypeDropdownIsOpen(!fitlerTypeDropdownIsOpen);
    const toggleWindowTypeDropdown = () => setWindowTypeDropdownIsOpen(!windowTypeDropdownIsOpen);

    return (
        <div className="flex flex-col justify-between h-screen h-48 bg-gray-50 p-2 my-5 mx-2 rounded-2xl shadow-md" style={{ height: '322px', width: '515px' }}>

            <div className="mx-4 my-5">
                <div id="content">
                    <div className="flex items-center">
                        <label>Filter Type: </label>
                        <div className="relative mx-2">
                            <button onClick={toggleFilterTypeDropdown} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-gray-700">
                                {chosenFilterType}
                            </button>

                            {fitlerTypeDropdownIsOpen && (
                                <div className="absolute flex flex-col bg-white p-3 shadow  rounded-lg z-10">
                                    <a id="chooseFilterType" onClick={() => updateChoosenFilterType(filterType.LOWPASS)} className="my-0.5 w-24 cursor-pointer">Low-pass</a>
                                    <a id="chooseFilterType" onClick={() => updateChoosenFilterType(filterType.HIGHPASS)} className="my-0.5 w-24 cursor-pointer">High-pass</a>
                                    {/* <a id="chooseFilterType" onClick={() => updateChoosenFilterType(filterType.HIGHPASS)} className="my-0.5 w-24 cursor-pointer">High-pass</a>
                                    <a id="chooseFilterType" onClick={() => updateChoosenFilterType(filterType.BANDPASS)} className="my-0.5 w-24 cursor-pointer">Band-pass</a> */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center mt-5">
                    <label>Design Method: </label>
                    <div className="relative mx-2">
                        <button onClick={toggleWindowTypeDropdown} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-gray-700 w-32">
                            {chosenMethod}
                        </button>
                        {windowTypeDropdownIsOpen && (
                            <div className="absolute flex flex-col bg-white p-3 shadow  rounded-lg">
                                <a className="z-0 my-0.5 w-24 cursor-pointer" onClick={() => updateChosenMethod(filterDesignMethod.BUTTERWORTH)}>Butterworth</a>
                                {/* <a id="chooseFilterType" onClick={() => updateChosenWindowType(windowType.BARTLETT)} className="my-0.5 w-24 cursor-pointer">Bartlett</a> */}
                            </div>
                        )}
                    </div>
                </div>
                {chosenFilterType == "Low-pass" &&
                    <div className="mt-2">
                        <label>Cuttoff Freq:</label>
                        <input className="rounded-lg shadow p-1 my-3 w-32 mx-1" onChange={(e) => updateLowCutoff(Number(e.target.value))} value={lowCutoff} placeholder="Rad/Samples" type="number" step="0.01" max="3.14" min="0"></input>
                    </div>
                }

                {chosenFilterType == "High-pass" &&
                    <div className="mt-2">
                        <label>Cuttoff Freq:</label>
                        <input className="rounded-lg shadow p-1 my-3 w-32 mx-1" onChange={(e) => updateLowCutoff(Number(e.target.value))} value={lowCutoff} placeholder="Rad/Samples" type="number" step="0.01" max="3.14" min="0"></input>
                    </div>
                }

                {chosenFilterType == "Band-pass" &&
                    <div className="mt-2">
                        <label>Low freq:</label>
                        <input className="rounded-lg shadow p-1 my-3 w-32 mx-1 mr-5" onChange={(e) => updateLowCutoff(Number(e.target.value))} value={lowCutoff} placeholder="Rad/Samples" type="number" step="0.01" max="3.14" min="0"></input>
                        <label>High freq:</label>
                        <input className="rounded-lg shadow p-1 my-3 w-32 mx-1" onChange={(e) => updateHighCutoff(Number(e.target.value))} value={highCutoff} placeholder="Rad/Samples" type="number" step="0.01" max="3.14" min="0"></input>

                    </div>
                }

                <div>
                    <label>Filter Order:</label>
                    <input className="rounded-lg shadow p-1 my-2 w-32 mx-1" onChange={(e) => updateFilterOrder(Number(e.target.value))} value={filterOrder} placeholder="Number" type="number" min="1"></input>
                </div>


            </div>

            <div className="text-center text-lg pb-4">
                <button onClick={() => updateTrigger(!trigger)} className={`h-10 text-sm mx-2 px-6 bg-blue-500 rounded-lg text-white p-2 hover:bg-gray-400`}>Design Filter</button>
            </div>
        </div >
    )
}
