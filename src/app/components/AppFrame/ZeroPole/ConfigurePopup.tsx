import React, { useEffect, useState } from 'react'

export const ConfigurePopup = ({ isOpen, onClose, peak, noiseMean, noiseSd, updatePeak, updateMean, updateSd}) => {
    const [localPeak, setLocalPeak] = useState(peak);
    const [localNoiseMean, setLocalNoiseMean] = useState(noiseMean);
    const [localNoiseSd, setLocalNoiseSd] = useState(noiseSd);
    
    const handleSet = () => {
        updatePeak(localPeak);
        updateMean(localNoiseMean);
        updateSd(localNoiseSd);
        onClose();
    };

    useEffect(() => {
        if (isOpen) {
            setLocalPeak(peak);
            setLocalNoiseMean(noiseMean);
            setLocalNoiseSd(noiseSd);
        }
    }, [isOpen, peak, noiseMean, noiseSd]);
    
    if (!isOpen) return null;
    return (
        <div className="fixed">
            <div className="bg-white p-5 rounded shadow-lg">
                <label>
                    Peak: <input onChange={(e) => setLocalPeak(e.target.value)} type="number" autoComplete="off" className="shadow-sm m-2 p-1" name="peak" value={localPeak} />
                </label>
                <br />
                <label>
                    Noise mean: <input onChange={(e) => setLocalNoiseMean(e.target.value)} type="number" autoComplete="off" className="shadow-sm m-2 p-1" name="noiseMean" value={localNoiseMean} />
                </label>
                <br />
                <label>
                    Noise SD: <input  onChange={(e) => setLocalNoiseSd(e.target.value)} type="number" autoComplete="off" className="shadow-sm m-2 p-1" name="noiseSD" value={localNoiseSd} />
                </label>      
                <button className="h-10 my-2 mx-2 px-7 bg-indigo-700 text-white text-sm rounded-lg hover:bg-blue-800" onClick={handleSet}>Set</button>
            </div>
        </div>
    )
}
