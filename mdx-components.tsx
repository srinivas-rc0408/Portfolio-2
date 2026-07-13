import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-2xl sm:text-3xl text-green-400 font-bold font-mono mt-8 mb-4">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-xl sm:text-2xl text-green-400 font-bold font-mono mt-6 mb-3">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg sm:text-xl text-green-400 font-semibold font-mono mt-5 mb-2">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
        {children}
      </p>
    ),
    a: ({ href, children }) => {
      const isExternal =
        href?.startsWith("http") || href?.startsWith("//");
      return (
        <a
          href={href}
          className="text-green-400 underline decoration-green-800/60 underline-offset-4 hover:text-green-300 hover:decoration-green-400/80 transition-colors"
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    },
    ul: ({ children }) => (
      <ul className="list-disc list-outside ml-5 sm:ml-6 mb-4 space-y-1 text-gray-300 text-sm sm:text-base">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-outside ml-5 sm:ml-6 mb-4 space-y-1 text-gray-300 text-sm sm:text-base">
        {children}
      </ol>
    ),
    code: ({ children }) => (
      <code className="px-1.5 py-0.5 rounded bg-green-900/30 border border-green-800/50 text-green-300 text-xs sm:text-sm font-mono">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="bg-gray-900/60 border border-green-800/40 rounded-lg p-4 my-4 overflow-x-auto text-xs sm:text-sm">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-green-700/60 pl-4 my-4 text-gray-400 italic">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="border-green-800/40 my-6" />,
    ...components,
  };
}
