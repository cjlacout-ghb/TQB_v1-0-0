'use client';

import { TeamStats } from '@/lib/types';
import { formatTQBValue, outsToInnings } from '@/lib/calculations';

interface TQBExplanationTableProps {
    rankings: TeamStats[];
    isERTQB?: boolean;
}

export default function TQBExplanationTable({ rankings, isERTQB = false }: TQBExplanationTableProps) {
    // Determine if it's a multi-way tie for the title
    const tiedCount = rankings.length;
    const title = `${isERTQB ? 'ER-TQB' : 'TQB'} Calculation Summary (${tiedCount}-Way Tie)`;

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                    This summary provides a detailed breakdown of the {isERTQB ? 'ER-TQB' : 'TQB'} components.
                    The tie is resolved by comparing the offensive efficiency (Ratio Scored) against the
                    defensive efficiency (Ratio Allowed) based on each team's total innings played.
                </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-dark-600">
                <table className="w-full text-sm text-left">
                    <thead className="bg-dark-700 text-gray-300 uppercase text-[10px] tracking-wider font-bold">
                        <tr>
                            <th className="px-4 py-3 border-b border-dark-600">Rank</th>
                            <th className="px-4 py-3 border-b border-dark-600">Team</th>
                            <th className="px-4 py-3 border-b border-dark-600 text-center">
                                {isERTQB ? 'Earned Runs Scored' : 'Runs Scored'}
                            </th>
                            <th className="px-4 py-3 border-b border-dark-600 text-center">Inn. at Bat (A)</th>
                            <th className="px-4 py-3 border-b border-dark-600 text-center">
                                {isERTQB ? 'Earned Runs Allowed' : 'Runs Allowed'}
                            </th>
                            <th className="px-4 py-3 border-b border-dark-600 text-center">Inn. Defense (B)</th>
                            <th className="px-4 py-3 border-b border-dark-600 text-center">Ratio Scored</th>
                            <th className="px-4 py-3 border-b border-dark-600 text-center">Ratio Allowed</th>
                            <th className="px-4 py-3 border-b border-dark-600 text-right">Final {isERTQB ? 'ER-TQB' : 'TQB'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-600 text-gray-300">
                        {rankings.map((team, index) => {
                            const runsS = isERTQB ? team.earnedRunsScored : team.runsScored;
                            const runsA = isERTQB ? team.earnedRunsAllowed : team.runsAllowed;
                            const innBat = team.inningsAtBatOuts / 3;
                            const innDef = team.inningsOnDefenseOuts / 3;

                            const ratioS = innBat > 0 ? runsS / innBat : 0;
                            const ratioA = innDef > 0 ? runsA / innDef : 0;
                            const finalVal = isERTQB ? team.erTqb : team.tqb;

                            return (
                                <tr key={team.id} className="hover:bg-dark-700/50 transition-colors">
                                    <td className="px-4 py-3 font-mono text-gray-500">#{index + 1}</td>
                                    <td className="px-4 py-3 font-bold text-white whitespace-nowrap">{team.name}</td>
                                    <td className="px-4 py-3 text-center font-mono">{runsS}</td>
                                    <td className="px-4 py-3 text-center font-mono">{outsToInnings(team.inningsAtBatOuts).toFixed(1)}</td>
                                    <td className="px-4 py-3 text-center font-mono">{runsA}</td>
                                    <td className="px-4 py-3 text-center font-mono">{outsToInnings(team.inningsOnDefenseOuts).toFixed(1)}</td>
                                    <td className="px-4 py-3 text-center font-mono text-gray-400">{ratioS.toFixed(4)}</td>
                                    <td className="px-4 py-3 text-center font-mono text-gray-400">{ratioA.toFixed(4)}</td>
                                    <td className={`px-4 py-3 text-right font-mono font-bold ${finalVal >= 0 ? 'text-success-400' : 'text-error-400'}`}>
                                        {formatTQBValue(finalVal)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
