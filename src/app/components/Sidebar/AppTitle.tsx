import React from 'react'

export const AppTitle = () => {
    return (
        <div className="my-4 pb-4 border-b border-gray-300">
            <div className="flex">
                <div>
                    <button className="p-1 rounded transition-colors hover:bg-gray-200"
                    >
                    </button>
                </div>
                <div className="flex">
                    <img
                        src="../../../../images/logo2.png"
                        alt="logo"
                        className="size-9"
                    />
                    <div className="ml-2">
                        <p className="text-sm font-bold">FilterDesigner</p>
                        <p className="text-xs text-stone-500">Version 0.1</p>
                    </div>
                </div>
            </div>
        </div>

    )
}
