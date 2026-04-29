"use client";

import { Highlighter, X } from "lucide-react";
import { HighlightColor } from "@/hooks/useHighlight";

interface Props {
    activeColor: HighlightColor | null;
    onSelectColor: (color: HighlightColor | null) => void;
}

const COLORS: { key: HighlightColor; bg: string; ring: string; label: string }[] = [
    { key: "yellow", bg: "bg-yellow-200", ring: "ring-yellow-400", label: "Yellow highlight" },
    { key: "green", bg: "bg-green-200", ring: "ring-green-400", label: "Green highlight" },
    { key: "pink", bg: "bg-pink-200", ring: "ring-pink-400", label: "Pink highlight" },
];

export function HighlightToolbar({ activeColor, onSelectColor }: Props) {
    return (
        <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white">
            <Highlighter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {COLORS.map(({ key, bg, ring, label }) => (
                <button
                    key={key}
                    aria-label={label}
                    title={label}
                    onClick={() => onSelectColor(activeColor === key ? null : key)}
                    className={`w-4 h-4 rounded-full transition-all shrink-0 ${bg}
            ${activeColor === key
                            ? `ring-2 ${ring} scale-110`
                            : "opacity-60 hover:opacity-100 hover:scale-105"
                        }`}
                />
            ))}
            {activeColor && (
                <button
                    title="Cancel highlight"
                    onClick={() => onSelectColor(null)}
                    className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ml-0.5"
                >
                    <X className="w-2.5 h-2.5 text-gray-500" />
                </button>
            )}
        </div>
    );
}