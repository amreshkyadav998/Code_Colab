"use client"

import { useEffect } from "react"
import Prism from "prismjs"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-python"
import "prismjs/components/prism-json"
import "prismjs/components/prism-css"
import "prismjs/components/prism-scss"
import "prismjs/components/prism-sql"
import "prismjs/components/prism-markdown"
import "prismjs/plugins/line-numbers/prism-line-numbers"
import "prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard"

interface CodeBlockProps {
  code: string
  language: string
  theme?: "github-light" | "github-dark"
  showLineNumbers?: boolean
  enableCopy?: boolean
  className?: string
}

export function CodeBlock({
  code,
  language,
  theme = "github-light",
  showLineNumbers = true,
  enableCopy = true,
  className = "",
}: CodeBlockProps) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      Prism.highlightAll()
    }
  }, [code, language, theme])

  // Map common language names to Prism's language classes
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "jsx",
    ts: "typescript",
    tsx: "tsx",
    py: "python",
    python: "python",
    bash: "bash",
    sh: "bash",
    shell: "bash",
    css: "css",
    scss: "scss",
    html: "html",
    json: "json",
    md: "markdown",
    markdown: "markdown",
    sql: "sql",
  }

  const prismLanguage = languageMap[language.toLowerCase()] || "javascript"
  const lineNumbersClass = showLineNumbers ? "line-numbers" : ""
  const themeClass = theme === "github-dark" ? "dark" : "light"

  return (
    <div className={`code-block-wrapper ${themeClass} ${className}`}>
      <style jsx>{`
        .code-block-wrapper {
          position: relative;
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .code-block-wrapper.dark pre {
          background-color: #0d1117;
          color: #e6edf3;
        }
        
        .code-block-wrapper.light pre {
          background-color: #f6f8fa;
          color: #24292e;
        }
        
        .code-block-wrapper pre {
          margin: 0;
          padding: 1rem;
          overflow-x: auto;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          tab-size: 2;
        }
        
        /* Line Numbers */
        .code-block-wrapper.line-numbers pre {
          padding-left: 3.8rem;
        }
        
        .code-block-wrapper .line-numbers-rows {
          position: absolute;
          pointer-events: none;
          top: 1rem;
          left: 1rem;
          width: 2.5rem;
          font-size: 0.875rem;
          line-height: 1.5;
          border-right: 1px solid rgba(128, 128, 128, 0.2);
          user-select: none;
        }
        
        .code-block-wrapper.dark .line-numbers-rows > span:before {
          color: rgba(230, 237, 243, 0.3);
        }
        
        .code-block-wrapper.light .line-numbers-rows > span:before {
          color: rgba(36, 41, 46, 0.3);
        }
        
        /* Token colors - Light Theme */
        .code-block-wrapper.light .token.comment,
        .code-block-wrapper.light .token.prolog,
        .code-block-wrapper.light .token.doctype,
        .code-block-wrapper.light .token.cdata {
          color: #6a737d;
        }
        
        .code-block-wrapper.light .token.punctuation {
          color: #24292e;
        }
        
        .code-block-wrapper.light .token.property,
        .code-block-wrapper.light .token.tag,
        .code-block-wrapper.light .token.boolean,
        .code-block-wrapper.light .token.number,
        .code-block-wrapper.light .token.constant,
        .code-block-wrapper.light .token.symbol {
          color: #005cc5;
        }
        
        .code-block-wrapper.light .token.selector,
        .code-block-wrapper.light .token.attr-name,
        .code-block-wrapper.light .token.string,
        .code-block-wrapper.light .token.char,
        .code-block-wrapper.light .token.builtin {
          color: #032f62;
        }
        
        .code-block-wrapper.light .token.operator,
        .code-block-wrapper.light .token.entity,
        .code-block-wrapper.light .token.url,
        .code-block-wrapper.light .language-css .token.string,
        .code-block-wrapper.light .style .token.string {
          color: #d73a49;
        }
        
        .code-block-wrapper.light .token.atrule,
        .code-block-wrapper.light .token.attr-value,
        .code-block-wrapper.light .token.keyword {
          color: #d73a49;
        }
        
        .code-block-wrapper.light .token.function {
          color: #6f42c1;
        }
        
        .code-block-wrapper.light .token.regex,
        .code-block-wrapper.light .token.important,
        .code-block-wrapper.light .token.variable {
          color: #e36209;
        }
        
        /* Token colors - Dark Theme */
        .code-block-wrapper.dark .token.comment,
        .code-block-wrapper.dark .token.prolog,
        .code-block-wrapper.dark .token.doctype,
        .code-block-wrapper.dark .token.cdata {
          color: #8b949e;
        }
        
        .code-block-wrapper.dark .token.punctuation {
          color: #c9d1d9;
        }
        
        .code-block-wrapper.dark .token.property,
        .code-block-wrapper.dark .token.tag,
        .code-block-wrapper.dark .token.boolean,
        .code-block-wrapper.dark .token.number,
        .code-block-wrapper.dark .token.constant,
        .code-block-wrapper.dark .token.symbol {
          color: #79c0ff;
        }
        
        .code-block-wrapper.dark .token.selector,
        .code-block-wrapper.dark .token.attr-name,
        .code-block-wrapper.dark .token.string,
        .code-block-wrapper.dark .token.char,
        .code-block-wrapper.dark .token.builtin {
          color: #a5d6ff;
        }
        
        .code-block-wrapper.dark .token.operator,
        .code-block-wrapper.dark .token.entity,
        .code-block-wrapper.dark .token.url,
        .code-block-wrapper.dark .language-css .token.string,
        .code-block-wrapper.dark .style .token.string {
          color: #ff7b72;
        }
        
        .code-block-wrapper.dark .token.atrule,
        .code-block-wrapper.dark .token.attr-value,
        .code-block-wrapper.dark .token.keyword {
          color: #ff7b72;
        }
        
        .code-block-wrapper.dark .token.function {
          color: #d2a8ff;
        }
        
        .code-block-wrapper.dark .token.regex,
        .code-block-wrapper.dark .token.important,
        .code-block-wrapper.dark .token.variable {
          color: #ffa657;
        }
      `}</style>
      <pre className={lineNumbersClass}>
        <code className={`language-${prismLanguage}`}>{code}</code>
      </pre>
    </div>
  )
}

