"use client"; // This is a client component 👈🏽

import { Sidebar } from "./components/Sidebar/Sidebar";
import { ZeroPole } from './components/AppFrame/ZeroPole/ZeroPole';
export default function Home() {
  return (
    <main className="grid grid-cols-[250px_1fr] px-4">
        <Sidebar />
        <ZeroPole />
    </main>
  )
}
