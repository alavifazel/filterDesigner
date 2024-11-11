"use client"; // This is a client component 👈🏽
import React from 'react';
import { Sidebar } from "./components/Sidebar/Sidebar";
import { ZeroPole } from './components/AppFrame/ZeroPole/ZeroPole';
import { FIRFilterDesign } from './components/AppFrame/FIRFilterDesign/FIRFilterDesign';
import { IIRFilterDesign } from './components/AppFrame/IIRFilterDesign/IIRFilterDesign';

export default function Home() {
  const items = [
    { placeholder: "Zero-pole placement", name: "zero_pole" },
    { placeholder: "FIR Design", name: "fir_filter_design" },
    { placeholder: "IIR Design", name: "iir_filter_design" }
  ];

  const [selectedItem, setSelectedItem] = React.useState(items[0]);

  const addComponent = () => {
    switch (selectedItem.name) {
      case "zero_pole":
        return <ZeroPole />;
      case "fir_filter_design":
        return <FIRFilterDesign />;
      case "iir_filter_design":
        return <IIRFilterDesign />;
    }
  }

  return (
    <main className="flex h-screen">
      <Sidebar items={items} selectedItem={selectedItem} updateSelectedItem={(e) => setSelectedItem((_) => e)} />
      {addComponent()}

    </main>

  )
}
