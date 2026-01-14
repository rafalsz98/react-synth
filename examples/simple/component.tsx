import React from "react";
import { Loop, Note, NoteName, Sequence, Synth } from "@react-synth/synth";

export const Giorgio = () => {
    const patterns: [string, string, string, string][] = [
        ["A1", "A2", "E2", "A2"], // a1: root, +12, +7, +12
        ["G1", "G2", "D2", "G2"], // g1: root, +12, +7, +12
        ["F1", "F2", "C2", "F2"], // f1: root, +12, +7, +12
        ["E1", "E2", "B1", "E2"], // e1: root, +12, +7, +12
    ];

    return (
        <>
            <Loop id="test" interval={3}>
                <Note note={"A4"} />
            </Loop>
            <Loop id="giorgio_arp" interval={16}>
                <Synth type="prophet">
                    <Sequence interval={4}>
                        {patterns.map((pattern, idx) => (
                            <Sequence key={idx} interval={0.25}>
                                {[...Array(16)].map((_, i) => {
                                    // Global step index across all 64 notes (4 patterns × 16 notes)
                                    // This makes the cutoff filter sweep continuously like Sonic Pi's .tick(:filter)
                                    const globalStep = idx * 16 + i;
                                    return (
                                        <Note
                                            key={i}
                                            note={pattern[
                                                i % pattern.length
                                            ] as NoteName}
                                            release={0.2}
                                            filter={{
                                                cutoff: {
                                                    from: 60,
                                                    to: 110,
                                                    steps: 16,
                                                    mirror: true,
                                                    step: globalStep,
                                                },
                                                resonance: 0.8,
                                            }}
                                            amp={2}
                                        />
                                    );
                                })}
                            </Sequence>
                        ))}
                    </Sequence>
                </Synth>
            </Loop>
        </>
    );
};
