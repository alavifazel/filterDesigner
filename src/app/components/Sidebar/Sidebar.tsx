import React from 'react'
import { AppTitle } from './AppTitle'
import { RouteSelect } from './RouteSelect'

export const Sidebar = () => {
  return (
    <div>
        <div className="overflow-y-scroll px-1 h-screen">
            <AppTitle />
            <RouteSelect />
        </div>
    </div>
  )
}
