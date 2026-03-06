"use client";
import React, { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Loader2, AlertTriangle, Globe, ArrowRight,
  FileText, Upload, CheckCircle, Key, Lock, Unlock
} from 'lucide-react';

interface FrameContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

const FrameContainer = ({ children, className = "", delay = 0 }: FrameContainerProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.7, delay, ease: "easeOut" }}
    className={`relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur-xl shadow-2xl ${className}`}
  >
    <div className="absolute inset-0 pointer-events-none bg-scanline opacity-30" />
    {children}
  </motion.div>
);

const GoogleVideoAd: React.FC = () => (
  <FrameContainer className="max-w-5xl my-16">
    <div className="p-10 text-center">
      <h4 className="text-3xl font-extrabold bg-gradient-to-r from-cyan-300 to-indigo-400 bg-clip-text text-transparent">Protect Your Digital Identity</h4>
      <p className="text-slate-300 mt-4">Advanced protection against profile leaks and footprint tracking.</p>
    </div>
  </FrameContainer>
);

export default function SentinelEcosystem() {
  const [text, setText] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // ECC State
  const [keys, setKeys] = useState<{private_key: string, public_key: string} | null>(null);
  const [token, setToken] = useState("");
  const [inputToken, setInputToken] = useState("");

  const API_BASE = "http://127.0.0.1:8000";

  // ECC Functions
  const handleGenerateKeys = async () => {
    const res = await fetch(`${API_BASE}/generate-keys`);
    const data = await res.json();
    setKeys(data);
    alert("ECC Pair Generated Locally");
  };

  const handleCreateToken = async () => {
    if (!text || !keys) return alert("Generate keys first and ensure workspace has text!");
    const res = await fetch(`${API_BASE}/secure-lock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text, public_key: keys.public_key }),
    });
    const data = await res.json();
    setToken(data.token);
  };

  // Logic to Decrypt and update workspace
  const handleDecryptToken = async () => {
    if (!inputToken || !keys) return alert("Need Private Key and Token!");
    try {
      const res = await fetch(`${API_BASE}/secure-unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: inputToken, private_key: keys.private_key }),
      });
      const data = await res.json();
      if(data.decrypted_text) {
          // Update the workspace text first
          setText(data.decrypted_text);
          // Show alert after update
          alert("Identity Decrypted Successfully!");
      }
    } catch {
      alert("Decryption Failed: Keys do not match this token.");
    }
  };

  // Original Handlers
  const handleUrlScan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analyze-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: socialUrl }),
      });
      const data = await res.json();
      setText(data.extracted_text || "");
      setResult(data);
    } catch { alert("Backend Offline"); } finally { setLoading(false); }
  };

  const handleAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      setResult(await res.json());
    } catch { alert("Backend offline!"); } finally { setLoading(false); }
  };

  const handleFileUpload = async (e: any) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      setText(data.extracted_text || "");
      setResult(data);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-12">
      <style jsx global>{`.bg-scanline { background: repeating-linear-gradient(to bottom, transparent 0px, rgba(0, 240, 255, 0.04) 1px, transparent 2px); animation: scan-move 12s linear infinite; } @keyframes scan-move { 0% { background-position: 0 0; } 100% { background-position: 0 200px; } }`}</style>
      
      <div className="max-w-7xl mx-auto space-y-12">
        <FrameContainer className="p-8 flex justify-between items-center">
            <h1 className="text-4xl font-black text-cyan-400">SENTINEL OSINT</h1>
            <div className="px-4 py-2 border border-green-500/50 rounded-full text-green-400 text-sm animate-pulse">SYSTEM ONLINE</div>
        </FrameContainer>

        <div className="grid md:grid-cols-2 gap-8">
            <FrameContainer className="p-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Globe className="text-cyan-400"/> Social Scanner</h2>
                <input className="w-full bg-slate-900 border border-slate-700 p-4 rounded-xl mb-4" placeholder="URL..." value={socialUrl} onChange={(e)=>setSocialUrl(e.target.value)} />
                <button onClick={handleUrlScan} className="w-full bg-cyan-600 p-4 rounded-xl font-bold">SCAN PROFILE</button>
            </FrameContainer>

            <FrameContainer className="p-8">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Upload className="text-purple-400"/> Document Audit</h2>
                <input type="file" onChange={handleFileUpload} className="text-sm text-slate-400" />
            </FrameContainer>
        </div>

        <div className="flex justify-center">
            <button onClick={handleAudit} className="px-12 py-6 bg-emerald-600 rounded-full font-black text-xl shadow-xl shadow-emerald-900/20">EXECUTE HARDENING</button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
            <FrameContainer className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-cyan-300 flex items-center gap-2"><FileText/> Identity Workspace</h3>
                    <div className="flex gap-2">
                        <button onClick={handleGenerateKeys} className="p-2 bg-slate-800 rounded hover:bg-slate-700" title="Gen Keys"><Key size={18}/></button>
                        <button onClick={handleCreateToken} className="p-2 bg-slate-800 rounded hover:bg-slate-700" title="Encrypt"><Lock size={18}/></button>
                    </div>
                </div>
                <textarea className="w-full h-80 bg-black/40 p-4 rounded border border-slate-700 font-mono" value={text} onChange={(e)=>setText(e.target.value)} />
                
                {token && (
                    <div className="mt-4 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded text-xs break-all font-mono">
                        <p className="text-emerald-400 font-bold mb-1">SECURE TOKEN:</p>
                        {token}
                    </div>
                )}
            </FrameContainer>

            <FrameContainer className="p-8">
                <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-2"><Unlock/> Decryption Vault</h3>
                <p className="text-slate-400 text-sm mb-4">Paste an encrypted Sentinel token to restore identity data.</p>
                <textarea className="w-full h-40 bg-black/40 p-4 rounded border border-slate-700 font-mono mb-4" placeholder="Paste Token..." value={inputToken} onChange={(e)=>setInputToken(e.target.value)} />
                <button onClick={handleDecryptToken} className="w-full py-4 bg-slate-800 rounded-xl font-bold text-emerald-400 border border-emerald-500/20">DECRYPT TO WORKSPACE</button>
            </FrameContainer>
        </div>

        {result && (
            <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <FrameContainer className="p-8 text-center"><p className="text-slate-500">Risk</p><h2 className="text-6xl font-black text-red-500">{result.risk_score}%</h2></FrameContainer>
                    <FrameContainer className="p-8 text-center"><p className="text-slate-500">Safety</p><h2 className="text-6xl font-black text-emerald-500">{result.market_score}%</h2></FrameContainer>
                </div>
                {result.safe_text && (
                    <FrameContainer className="p-8 bg-emerald-950/10">
                        <h3 className="text-emerald-400 font-bold mb-4">Anonymized Output</h3>
                        <div className="text-xl italic">"{result.safe_text}"</div>
                    </FrameContainer>
                )}
            </div>
        )}

        <GoogleVideoAd />
      </div>
    </div>
  );
}