import React from "react";
import { Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Desert Sands Luxury</h1>
        <p className="mt-4">Client SPA mode — basic entry. Convert routes as needed.</p>
        <p className="mt-4"><a href="/packages" className="text-primary underline">Packages</a></p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">Page not found</div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
