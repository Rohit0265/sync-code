//@ts-nocheck

import "./App.css";
import { Editor } from "@monaco-editor/react";
import { useRef, useMemo, useState, useEffect } from "react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io";

function App() {

  const editorRef = useRef(null)
  const usernameRef = useRef(null)
  const [editor, setEditor] = useState(null)
  const [username, setUsername] = useState(() => {
    return new URLSearchParams(window.location.search).get("username") || ""
  });
  const [users, setUsers] = useState([])
  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])


  useEffect(() => {
    if (username && editor) {
      const provider = new SocketIOProvider("http://localhost:3000", "monaco", ydoc, {
        autoConnect: true,
      })

      provider.awareness.setLocalStateField("user", { username });

      provider.awareness.on("change", () => {
        const states = Array.from(provider.awareness.getStates().values())
        setUsers(states.map(state => state.user).filter(user => Boolean(user.username)))
      })

      function handleBeforeUnLoad() {
        provider.awareness.setLocalStateField("user", null);
      }

      window.addEventListener("beforeunload", handleBeforeUnLoad)

      const monacoBinding = new MonacoBinding(
        yText, editor.getModel(),
        new Set([editor]),
        provider.awareness
      )
      return () => {
        monacoBinding.destroy()
        provider.disconnect()
        window.removeEventListener("beforeunload", handleBeforeUnLoad)
      }
    }
  }, [username, editor])

  const handleMOunt = (editorInstance) => {
    editorRef.current = editorInstance
    setEditor(editorInstance)
  }

  const handleJoin = (e) => {
    e.preventDefault()
    setUsername(e.target.username.value)
    window.history.pushState({}, "", `?username=${e.target.username.value}`)
  }

  if (!username) {
    return (
      <form onSubmit={handleJoin}
        className="flex flex-col gap-4"
      >

        <main className="h-screen w-full bg-gray-950 flex gap-4 p-4 items-center justify-center">
          <input
            ref={usernameRef}
            type="text"
            className="w-64 h-10 rounded-lg text-center bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-medium"
            placeholder="Enter Your Username"
            name="username"
            required
          />
          <button className="w-24 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold transition-all cursor-pointer">
            Enter
          </button>
        </main>
      </form>
    )
  }

  return (


    <main
      className="h-screen w-full bg-green-950 flex gap-4 p-2"
    >
      <aside
        className="h-full w-1/3 bg-amber-50 rounded-2xl">
        <div>Users</div>
        {console.log(users)}
        {
          users.map((user) => {
            return (
              <div key={user}>{user.username}</div>
            )
          })
        }
      </aside>
      <section className="w-3/4  bg-neutral-800 rounded-2xl">
        <Editor
          height="90vh"
          defaultLanguage="javascript"
          defaultValue="// some comment"
          theme="vs-dark"
          onMount={handleMOunt}
        />
      </section>

    </main>

  )
}

export default App
