"use client";

import Head from 'next/head';
import { FaDownload } from 'react-icons/fa';
import { apkInfoData } from '@/data/store-data';

export function StorePageContent({ versionName, fileSize }) {
  const apkInfo = {
    ...apkInfoData,
    version: versionName || 'N/A',
    fileSize: fileSize || 'N/A',
  };

  return (
    <>
      <Head>
        <title>Download DomAI for Android</title>
        <meta name="description" content="Get the official DomAI application for Android." />
      </Head>

      <main className="min-h-screen aurora-background">
        <div className="container mx-auto px-4 py-12">

          <header className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-white mb-2">
            Download DomAI Now
            </h1>
            <p className="text-lg text-gray-300">
              Get the latest version for Android instantly.
            </p>
          </header>

          <div className="flex justify-center">
            <div
              key={apkInfo.name}
              className="bg-gray-800 bg-opacity-40 backdrop-blur-lg rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out overflow-hidden max-w-md w-full"
            >
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <img src={apkInfo.icon} alt={`${apkInfo.name} icon`} className="w-20 h-20 mr-6 rounded-lg shadow-md" />
                  <div>
                    <h2 className="text-3xl font-bold text-white">{apkInfo.name}</h2>
                    <p className="text-md text-gray-400">Version {apkInfo.version}</p>
                    <span className="mt-2 inline-block bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      Android Exclusive
                    </span>
                  </div>
                </div>

                <p className="text-gray-300 mb-6">
                  {apkInfo.description}
                </p>

                <div className="text-sm text-gray-400 space-y-2 mb-8 border-t border-gray-700 pt-6">
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <strong>{apkInfo.lastUpdated}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <strong>{apkInfo.fileSize}</strong>
                  </div>
                   <div className="flex justify-between">
                    <span>Platform:</span>
                    <strong>{apkInfo.platform}</strong>
                  </div>
                </div>

                <a
                  href={apkInfo.downloadLink}
                  download
                  className="w-full flex items-center justify-center bg-purple-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 text-center text-lg transform hover:scale-105"
                >
                  <FaDownload className="mr-3" />
                  Download APK
                </a>

                <div className="text-xs text-gray-500 mt-6 text-center">
                  <p>
                    You may need to enable "Install from unknown sources" in your Android settings to install the APK.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
