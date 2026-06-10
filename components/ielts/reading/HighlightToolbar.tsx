"use client";

import { useState, useEffect, useRef } from "react";
import { Highlighter, StickyNote, X } from "lucide-react";

// ─── Type (hook'ga bog'liq emas, to'g'ridan-to'g'ri shu yerda) ────────────
export type HighlightColor = 'yellow' | 'green' | 'indigo';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Props {
    position: { x: number; y: number } | null;
    activeColor: HighlightColor | null;
    onSelectColor: (color: HighlightColor | null) => void;
    onNote?: () => void;
    onClose: () => void;
}

// ─── Color config — page.tsx dagi HL_COLORS bilan TO'LIQ bir xil ──────────

const COLORS: {
    key: HighlightColor;
    bg: string;
    hover: string;
    ringCls: string;
    iconCls: string;
    label: string;
}[] = [
    {
        key: "yellow",
        bg: "#FDE047",
        hover: "#FACC15",
        ringCls: "ring-yellow-500",
        iconCls: "text-yellow-900",
        label: "Yellow",
    },
    {
        key: "green",
        bg: "#4ADE80",
        hover: "#22C55E",
        ringCls: "ring-green-600",
        iconCls: "text-green-950",
        label: "Green",
    },
    {
        key: "indigo",
        bg: "#4f46e5",
        hover: "#3730a3",
        ringCls: "ring-indigo-700",
        iconCls: "text-white",
        label: "Indigo",
    },
];

// ─── Component ─────────────────────────────────────────────────────────────

export function HighlightToolbar({
    position,
    activeColor,
    onSelectColor,
    onNote,
    onClose,
}: Props) {
    const [highlightOpen, setHighlightOpen] = useState(false);
    const [hovered, setHovered] = useState<HighlightColor | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!position) return;
        const onMouseDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node))
                onClose();
        };
        document.addEventListener("mousedown", onMouseDown);
        return () => document.removeEventListener("mousedown", onMouseDown);
    }, [position, onClose]);

    useEffect(() => {
        if (!position) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [position, onClose]);

    useEffect(() => {
        if (!position) { setHighlightOpen(false); setHovered(null); }
    }, [position]);

    if (!position) return null;

    const handleColorClick = (color: HighlightColor) => {
        onSelectColor(activeColor === color ? null : color);
        onClose();
    };

    return (
        <div
            ref={menuRef}
            role="menu"
            aria-label="Text actions"
            style={{ top: position.y + 8, left: position.x }}
            className="fixed z-50 flex items-center gap-1 bg-white border border-gray-200 rounded-xl shadow-xl px-1.5 py-1.5 select-none"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* ── Highlight button ── */}
            <div className="relative flex items-center">
                <button
                    type="button"
                    role="menuitem"
                    title="Highlight"
                    aria-pressed={highlightOpen}
                    onClick={() => setHighlightOpen((p) => !p)}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors
                        ${highlightOpen
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}
                >
                    <Highlighter className="w-4 h-4" />
                </button>

                {highlightOpen && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl shadow-xl px-2.5 py-2">
                        <span className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b border-r border-gray-200 rotate-45" />
                        {COLORS.map(({ key, bg, hover, ringCls, iconCls, label }) => {
                            const isActive = activeColor === key;
                            const isHov = hovered === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    role="menuitem"
                                    title={isActive ? `Remove ${label} highlight` : `${label} highlight`}
                                    onClick={() => handleColorClick(key)}
                                    onMouseEnter={() => setHovered(key)}
                                    onMouseLeave={() => setHovered(null)}
                                    style={{ backgroundColor: isHov ? hover : bg }}
                                    className={`relative w-[26px] h-[26px] rounded-full transition-all shrink-0
                                        ${isActive
                                            ? `ring-2 ${ringCls} ring-offset-1 scale-110`
                                            : "scale-100 hover:scale-110"}`}
                                >
                                    {isActive && (
                                        <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                                            <X className={`w-3 h-3 ${iconCls}`} strokeWidth={3} />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Divider ── */}
            <div className="w-px h-5 bg-gray-200 mx-0.5 shrink-0" aria-hidden="true" />

            {/* ── Note button ── */}
            <button
                type="button"
                role="menuitem"
                title="Add note"
                onClick={() => { onNote?.(); onClose(); }}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
            >
                <StickyNote className="w-4 h-4" />
            </button>
        </div>
    );
}