import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  HiChevronDown as ChevronDown,
  HiChevronRight as ChevronRight,
} from "react-icons/hi";
import { MdPushPin as Pin, MdOutlinePushPin as PinOff } from "react-icons/md";

const QAItem = ({ item, onPin }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-4 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <div
        className="p-6 cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {open ? (
                <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
              )}
              <h3 className="font-semibold text-slate-800 leading-relaxed">
                {item.question}
              </h3>
            </div>
            {item.isPinned && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin?.(item._id);
            }}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title={item.isPinned ? "Unpin question" : "Pin question"}
          >
            {item.isPinned ? (
              <PinOff className="w-4 h-4 text-amber-600" />
            ) : (
              <Pin className="w-4 h-4 text-slate-400 hover:text-amber-600" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="px-6 pb-6 border-t border-slate-100">
          <div className="pt-4">
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold text-slate-800 mb-3">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-semibold text-slate-800 mb-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-slate-800 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-slate-700 mb-3 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-slate-700 mb-3 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-slate-700 mb-3 space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-slate-700">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-900">
                      {children}
                    </strong>
                  ),
                  code: ({ children }) => (
                    <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-3">
                      {children}
                    </pre>
                  ),
                }}
              >
                {item.answer}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QAItem;
