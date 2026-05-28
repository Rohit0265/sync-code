//@ts-nocheck

import "./App.css";
import { Editor } from "@monaco-editor/react";
import { useRef, useMemo, useState, useEffect } from "react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";
import { SocketIOProvider } from "y-socket.io";

function App() {
  const editorRef = useRef(null);
  const usernameRef = useRef(null);
  const [editor, setEditor] = useState(null);
  
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || "";
  });
  
  const [users, setUsers] = useState([]);
  const ydoc = useMemo(() => new Y.Doc(), []);
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc]);

  useEffect(() => {
    if (username && editor) {
      const provider = new SocketIOProvider("/", "monaco", ydoc, {
        autoConnect: true,
      });

      provider.awareness.setLocalStateField("user", { username });

      const updateUsersList = () => {
        const states = Array.from(provider.awareness.getStates().values());
        setUsers(
          states
            .map((state) => state.user)
            .filter((user) => Boolean(user && user.username))
        );
      };

      provider.awareness.on("change", updateUsersList);

      function handleBeforeUnLoad() {
        provider.awareness.setLocalStateField("user", null);
      }

      window.addEventListener("beforeunload", handleBeforeUnLoad);

      const monacoBinding = new MonacoBinding(
        yText,
        editor.getModel(),
        new Set([editor]),
        provider.awareness
      );

      return () => {
        monacoBinding.destroy();
        provider.disconnect();
        window.removeEventListener("beforeunload", handleBeforeUnLoad);
      };
    }
  }, [username, editor, ydoc, yText]);

  const handleMount = (editorInstance) => {
    editorRef.current = editorInstance;
    setEditor(editorInstance);
  };

  const handleJoin = (e) => {
    e.preventDefault();
    const name = e.target.username.value.trim();
    if (!name) return;
    setUsername(name);
    window.history.pushState({}, "", `?username=${encodeURIComponent(name)}`);
  };

  if (!username) {
    return (
      <main className="h-screen w-full bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Futuristic glowing atmospheric ambient elements */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-10000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-7000"></div>

        <form onSubmit={handleJoin} className="relative z-10 w-full max-w-md">
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-7">
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-white tracking-tight bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                SyncCode
              </h1>
              <p className="text-sm text-slate-400 mt-2 font-medium">Real-time collaborative developer workspace</p>
            </div>

            <div className="w-full flex flex-col gap-2.5">
              <label htmlFor="username" className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                Choose a Username
              </label>
              <input
                ref={usernameRef}
                type="text"
                id="username"
                name="username"
                autoComplete="off"
                required
                className="w-full h-12 bg-slate-950 border border-slate-800/80 rounded-xl px-5 text-center text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-lg"
                placeholder="Enter your username..."
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-950/45 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Launch Workspace</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="h-screen w-full bg-slate-950 flex gap-4 p-4 font-sans text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Sidebar for Users */}
      <aside className="h-full w-80 bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-5 flex flex-col gap-5 shrink-0 shadow-2xl relative z-10">
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">Collaborators</h2>
          </div>
          <span className="bg-slate-800/80 text-[10px] px-2.5 py-1 rounded-full font-bold border border-slate-700/50 text-slate-300">
            {users.length} active
          </span>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 scrollbar-thin">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500 text-sm">
              <svg className="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Syncing workspace...</span>
            </div>
          ) : (
            users.map((u, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-slate-900/50 border border-slate-800/40 px-3.5 py-3 rounded-xl transition-all duration-200 hover:bg-slate-800/30 hover:border-slate-700/40 hover:shadow-md"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/10 to-emerald-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-300 shadow-inner">
                  {u.username ? u.username.charAt(0).toUpperCase() : "?"}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-200">{u.username}</span>
                  {u.username === username ? (
                    <span className="text-[10px] text-emerald-400 font-bold tracking-wider uppercase flex items-center gap-1 mt-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-400"></span> You
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide flex items-center gap-1 mt-0.5">
                      <span className="w-1 h-1 rounded-full bg-slate-500"></span> Connected
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-800/60 pt-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SyncCode Node</span>
          </div>
          <span className="text-[10px] font-mono text-slate-600">v1.0.0</span>
        </div>
      </aside>

      {/* Editor Container */}
      <section className="flex-1 h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative z-10">
        <header className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/25 shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-400 font-extrabold tracking-widest uppercase">
              JS
            </span>
            <div>
              <h1 className="text-sm font-bold text-slate-200">workspace.js</h1>
              <p className="text-[10px] text-slate-500 font-medium">Real-time collaborative playground</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Connected</span>
          </div>
        </header>

        <div className="flex-1 w-full bg-slate-950 p-3">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue="// Code changes sync instantly with all active collaborators"
            theme="vs-dark"
            onMount={handleMount}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              padding: { top: 12, bottom: 12 },
              roundedSelection: true,
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              renderWhitespace: "selection",
              folding: true,
              automaticLayout: true,
            }}
          />
        </div>
      </section>
    </main>
  );
}

export default App;
