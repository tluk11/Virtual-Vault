"use client";

import Header from "@/components/Header";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Header />
      <section className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-6">
          Welcome to <span className="text-blue-600">Virtual Vault</span>
        </h1>
        <p className="text-lg sm:text-2xl text-gray-700 max-w-2xl mb-8">
          Securely store, organize, and share your most important documents in the cloud. Your digital safety deposit box—accessible anywhere, anytime.
        </p>
        <Link href="/vault">
          <button className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow hover:bg-blue-700 transition">
            Go to Your Vault
          </button>
        </Link>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl w-full">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">🔒</span>
            <h3 className="font-bold text-lg mb-1">Secure Storage</h3>
            <p className="text-gray-500 text-sm">All your files are encrypted and safely stored in the cloud.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">🤝</span>
            <h3 className="font-bold text-lg mb-1">Easy Sharing</h3>
            <p className="text-gray-500 text-sm">Share documents with others and control their access permissions.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">📱</span>
            <h3 className="font-bold text-lg mb-1">Access Anywhere</h3>
            <p className="text-gray-500 text-sm">Access your vault from any device, anytime you need it.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
