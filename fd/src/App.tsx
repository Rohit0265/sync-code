//@ts-nocheck

import "./App.css";
import { Editor } from "@monaco-editor/react";
import { useRef, useMemo } from "react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs"
import { SocketIOProvider } from "y-socket.io";

function App() {

  const editorRef = useRef(null)

  const ydoc = useMemo(() => new Y.Doc(), [])
  const yText = useMemo(() => ydoc.getText("monaco"), [ydoc])





  const handleMOunt = (editor) => {
    editorRef.current = editor
    const provider = new SocketIOProvider("http://localhost:3000", "monaco", ydoc,{
      autoConnect:true,
      
    })
    const monacoBinding = new MonacoBinding(
      yText, editorRef.current.getModel(),
      new Set([editorRef.current]),
  provider.awareness
    )
  }

  return (


    <main
      className="h-screen w-full bg-green-950 flex gap-4 p-2"
    >
      <aside
        className="h-full w-1/3 bg-amber-50 rounded-2xl">

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
