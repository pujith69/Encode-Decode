"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [operation, setOperation] = useState("encode");
  const [loading, setLoading] = useState(false);
  const [outputFormat, setOutputFormat] = useState("txt");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("operation", operation);
    formData.append("outputFormat", outputFormat);

    const res = await fetch("/api/process", {
      method: "POST",
      body: formData,
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = file.name + (operation === "encode" ? ".b64" : `_decoded.${outputFormat}`);
    a.click();

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">

      {/* Navbar */}
      <div className="w-full bg-white shadow-sm py-4 px-6 flex justify-between">
        <h1 className="text-xl font-bold text-red-500">ENCODE & DECODE</h1>
        <span className="text-gray-500 text-sm">Encode & Decode Base64</span>
      </div>

      {/* Main Card */}
      <div className="flex flex-1 items-center justify-center w-full p-6">
        <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-xl text-center">

          <h2 className="text-2xl font-semibold mb-6">
            {operation === "encode" ? "Encode File to Base64" : "Decode Base64 File"}
          </h2>

          {/* Upload Area */}
          <label className="border-2 border-dashed border-gray-300 rounded-xl p-10 block cursor-pointer hover:border-red-400 transition">
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
            />
            {file ? (
              <p className="text-gray-700 font-medium">{file.name}</p>
            ) : (
              <p className="text-gray-400">
                Drag & drop a file here <br /> or click to upload
              </p>
            )}
          </label>

          {/* Operation Toggle */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={() => setOperation("encode")}
              className={`px-6 py-2 rounded-full ${operation === "encode"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700"
                }`}
            >
              Encode
            </button>

            <button
              type="button"
              onClick={() => setOperation("decode")}
              className={`px-6 py-2 rounded-full ${operation === "decode"
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700"
                }`}
            >
              Decode
            </button>
          </div>

          {/* Output Format Selector (only for decode) */}
          {operation === "decode" && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="txt">Text (.txt)</option>
                <option value="jpg">Image - JPEG (.jpg)</option>
                <option value="png">Image - PNG (.png)</option>
                <option value="pdf">PDF (.pdf)</option>
                <option value="mp4">Video - MP4 (.mp4)</option>
                <option value="mp3">Audio - MP3 (.mp3)</option>
                <option value="zip">Archive (.zip)</option>
                <option value="json">JSON (.json)</option>
                <option value="xml">XML (.xml)</option>
              </select>
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Process File"}
          </button>

        </div>
      </div>
    </div>
  );
}
