"use client"; // This is a client component 👈🏽

import { Sidebar } from "./components/Sidebar/Sidebar";
import { ZeroPole } from './components/AppFrame/ZeroPole/ZeroPole';
export default function Home() {

  return (
        <main className="flex h-screen">
        <Sidebar />
        <ZeroPole />

        </main>

  )
}
