'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calculator, AlertCircle, Info } from 'lucide-react';
import { GameData } from '@/lib/types';
import StepIndicator from '../StepIndicator';

interface EarnedRunsEntryProps {
    games: GameData[];
    onGamesChange: (games: GameData[]) => void;
    onCalculate: () => void;
}

export default function EarnedRunsEntry({
    games,
    onGamesChange,
    onCalculate
}: EarnedRunsEntryProps) {
    const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

    const updateGame = useCallback((
        gameId: string,
        field: 'earnedRunsA' | 'earnedRunsB',
        value: number | null
    ) => {
        onGamesChange(
            games.map(g => g.id === gameId ? { ...g, [field]: value } : g)
        );

        // Clear specific field error when user types
        if (errors[gameId]?.[field]) {
            setErrors(prev => ({
                ...prev,
                [gameId]: {
                    ...prev[gameId],
                    [field]: '',
                },
            }));
        }
    }, [games, onGamesChange, errors]);

    const validateGames = useCallback((): boolean => {
        const newErrors: Record<string, Record<string, string>> = {};
        let hasErrors = false;

        for (const game of games) {
            const gameErrors: Record<string, string> = {};

            // Validate earned runs (required, non-negative, <= total runs)
            if (game.earnedRunsA === null || game.earnedRunsA === undefined || game.earnedRunsA < 0) {
                gameErrors.earnedRunsA = 'Required';
                hasErrors = true;
            } else if (game.earnedRunsA > (game.runsA ?? 0)) {
                gameErrors.earnedRunsA = 'Cannot exceed total runs';
                hasErrors = true;
            }

            if (game.earnedRunsB === null || game.earnedRunsB === undefined || game.earnedRunsB < 0) {
                gameErrors.earnedRunsB = 'Required';
                hasErrors = true;
            } else if (game.earnedRunsB > (game.runsB ?? 0)) {
                gameErrors.earnedRunsB = 'Cannot exceed total runs';
                hasErrors = true;
            }

            if (Object.keys(gameErrors).length > 0) {
                newErrors[game.id] = gameErrors;
            }
        }

        setErrors(newErrors);
        return !hasErrors;
    }, [games]);

    const handleCalculate = useCallback(() => {
        if (validateGames()) {
            onCalculate();
        }
    }, [validateGames, onCalculate]);

    const allFieldsFilled = useMemo(() => {
        return games.every(game =>
            game.earnedRunsA !== null && game.earnedRunsA !== undefined &&
            game.earnedRunsB !== null && game.earnedRunsB !== undefined
        );
    }, [games]);

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <StepIndicator currentStep={4} totalSteps={5} />

            <div className="card">
                <div className="card-header">
                    <h2 className="text-2xl font-bold text-white">Enter Earned Runs</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        TQB did not resolve all ties. Enter earned runs for ER-TQB calculation.
                    </p>
                </div>

                <div className="card-body space-y-6">
                    {/* Info Panel */}
                    <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl flex items-start gap-3">
                        <Info size={20} className="text-primary-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-primary-400">
                                What are Earned Runs?
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Earned runs are runs that scored without the benefit of an error or passed ball.
                                They cannot exceed the total runs scored in each game.
                            </p>
                        </div>
                    </div>

                    {/* Games List */}
                    <div className="space-y-4">
                        {games.map((game, index) => (
                            <EarnedRunsCard
                                key={game.id}
                                game={game}
                                gameNumber={index + 1}
                                errors={errors[game.id] || {}}
                                onUpdate={(field, value) => updateGame(game.id, field, value)}
                            />
                        ))}
                    </div>

                    {/* Error Summary */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-4 bg-error-500/10 border border-error-500/30 rounded-xl flex items-start gap-3">
                            <AlertCircle size={20} className="text-error-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-error-400">
                                    Please fix the errors above
                                </p>
                                <p className="text-xs text-error-300 mt-1">
                                    All earned runs fields are required and cannot exceed total runs.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Calculate Button */}
                    <button
                        onClick={handleCalculate}
                        disabled={!allFieldsFilled}
                        className="w-full btn-success py-4 text-lg"
                    >
                        <Calculator size={20} />
                        Calculate ER-TQB Rankings
                    </button>
                </div>
            </div>
        </div>
    );
}

// Subcomponent for each game card
interface EarnedRunsCardProps {
    game: GameData;
    gameNumber: number;
    errors: Record<string, string>;
    onUpdate: (field: 'earnedRunsA' | 'earnedRunsB', value: number | null) => void;
}

function EarnedRunsCard({ game, gameNumber, errors, onUpdate }: EarnedRunsCardProps) {
    const handleChange = (field: 'earnedRunsA' | 'earnedRunsB', value: string) => {
        const num = value === '' ? null : parseInt(value, 10);
        if (value === '' || (!isNaN(num!) && num! >= 0)) {
            onUpdate(field, num);
        }
    };

    return (
        <div className="game-card animate-slide-up">
            {/* Game Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-dark-500">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-dark-600 rounded-lg text-sm font-mono text-gray-400">
                        Game {gameNumber}
                    </span>
                    <h3 className="text-lg font-semibold text-white">
                        {game.teamAName} <span className="text-gray-500 mx-2">vs</span> {game.teamBName}
                    </h3>
                </div>
                <span className="text-sm font-mono text-gray-400">
                    Final: {game.runsA} - {game.runsB}
                </span>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team A */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-primary-500" />
                        <span className="font-semibold text-white">{game.teamAName}</span>
                        <span className="text-sm text-gray-500">(Total: {game.runsA} runs)</span>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Earned Runs Scored</label>
                        <input
                            type="number"
                            min="0"
                            max={game.runsA ?? 0}
                            value={game.earnedRunsA ?? ''}
                            onChange={(e) => handleChange('earnedRunsA', e.target.value)}
                            className={`input font-mono ${errors.earnedRunsA ? 'input-error' : ''}`}
                            placeholder="0"
                        />
                        {errors.earnedRunsA && (
                            <p className="mt-1 text-xs text-error-400">{errors.earnedRunsA}</p>
                        )}
                    </div>
                </div>

                {/* Team B */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-success-500" />
                        <span className="font-semibold text-white">{game.teamBName}</span>
                        <span className="text-sm text-gray-500">(Total: {game.runsB} runs)</span>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Earned Runs Scored</label>
                        <input
                            type="number"
                            min="0"
                            max={game.runsB ?? 0}
                            value={game.earnedRunsB ?? ''}
                            onChange={(e) => handleChange('earnedRunsB', e.target.value)}
                            className={`input font-mono ${errors.earnedRunsB ? 'input-error' : ''}`}
                            placeholder="0"
                        />
                        {errors.earnedRunsB && (
                            <p className="mt-1 text-xs text-error-400">{errors.earnedRunsB}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
