'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calculator, AlertCircle, HelpCircle } from 'lucide-react';
import { Team, GameData } from '@/lib/types';
import { validateInningsFormat } from '@/lib/calculations';
import StepIndicator from '../StepIndicator';

interface GameEntryProps {
    teams: Team[];
    games: GameData[];
    onGamesChange: (games: GameData[]) => void;
    onCalculate: () => void;
    totalSteps: number;
}

export default function GameEntry({
    teams,
    games,
    onGamesChange,
    onCalculate,
    totalSteps
}: GameEntryProps) {
    const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
    const [showInningsHelp, setShowInningsHelp] = useState(false);

    const updateGame = useCallback((
        gameId: string,
        field: keyof GameData,
        value: string | number | null
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

            // Validate runs (required, non-negative)
            if (game.runsA === null || game.runsA === undefined || game.runsA < 0) {
                gameErrors.runsA = 'Required';
                hasErrors = true;
            }
            if (game.runsB === null || game.runsB === undefined || game.runsB < 0) {
                gameErrors.runsB = 'Required';
                hasErrors = true;
            }

            // Validate innings format (X, X.1, or X.2)
            const inningsFields: (keyof GameData)[] = [
                'inningsABatting', 'inningsADefense',
                'inningsBBatting', 'inningsBDefense'
            ];

            for (const field of inningsFields) {
                const value = game[field] as string;
                if (!value || !validateInningsFormat(value)) {
                    gameErrors[field] = 'Invalid format';
                    hasErrors = true;
                }
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
            game.runsA !== null && game.runsA !== undefined &&
            game.runsB !== null && game.runsB !== undefined &&
            game.inningsABatting && validateInningsFormat(game.inningsABatting) &&
            game.inningsADefense && validateInningsFormat(game.inningsADefense) &&
            game.inningsBBatting && validateInningsFormat(game.inningsBBatting) &&
            game.inningsBDefense && validateInningsFormat(game.inningsBDefense)
        );
    }, [games]);

    const gamesCount = games.length;
    const teamsCount = teams.length;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <StepIndicator currentStep={2} totalSteps={totalSteps} />

            <div className="card">
                <div className="card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Enter Game Results</h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {gamesCount} games for {teamsCount} teams (round-robin format)
                        </p>
                    </div>

                    {/* Innings Help Toggle */}
                    <button
                        onClick={() => setShowInningsHelp(!showInningsHelp)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary-400 
              hover:bg-primary-500/10 rounded-lg transition-colors"
                    >
                        <HelpCircle size={16} />
                        Innings format help
                    </button>
                </div>

                <div className="card-body space-y-6">
                    {/* Innings Help Panel */}
                    {showInningsHelp && (
                        <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl animate-slide-up">
                            <h4 className="text-sm font-semibold text-primary-400 mb-2">
                                How to enter innings:
                            </h4>
                            <ul className="text-sm text-gray-300 space-y-1">
                                <li><span className="font-mono text-primary-300">7</span> = 7 complete innings</li>
                                <li><span className="font-mono text-primary-300">7.1</span> = 7 innings + 1 out (7⅓ innings)</li>
                                <li><span className="font-mono text-primary-300">7.2</span> = 7 innings + 2 outs (7⅔ innings)</li>
                                <li><span className="font-mono text-primary-300">6.2</span> = 6 innings + 2 outs (game ended early)</li>
                            </ul>
                            <p className="text-xs text-gray-400 mt-2">
                                Softball games can end mid-inning (mercy rule, rain, etc.), so innings may differ between teams.
                            </p>
                        </div>
                    )}

                    {/* Games List */}
                    <div className="space-y-4">
                        {games.map((game, index) => (
                            <GameCard
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
                                    All fields are required. Innings must be whole numbers or end in .1 or .2
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
                        Calculate Rankings
                    </button>
                </div>
            </div>
        </div>
    );
}

// Subcomponent for each game card
interface GameCardProps {
    game: GameData;
    gameNumber: number;
    errors: Record<string, string>;
    onUpdate: (field: keyof GameData, value: string | number | null) => void;
}

function GameCard({ game, gameNumber, errors, onUpdate }: GameCardProps) {
    const handleRunsChange = (field: 'runsA' | 'runsB', value: string) => {
        const num = value === '' ? null : parseInt(value, 10);
        if (value === '' || (!isNaN(num!) && num! >= 0)) {
            onUpdate(field, num);
        }
    };

    const handleInningsChange = (field: keyof GameData, value: string) => {
        // Allow empty, digits, and single decimal point
        if (value === '' || /^\d*\.?[012]?$/.test(value)) {
            onUpdate(field, value);
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
            </div>

            {/* Two Column Layout for Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team A */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-primary-500" />
                        <span className="font-semibold text-white">{game.teamAName}</span>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Runs Scored</label>
                        <input
                            type="number"
                            min="0"
                            value={game.runsA ?? ''}
                            onChange={(e) => handleRunsChange('runsA', e.target.value)}
                            className={`input font-mono ${errors.runsA ? 'input-error' : ''}`}
                            placeholder="0"
                        />
                        {errors.runsA && (
                            <p className="mt-1 text-xs text-error-400">{errors.runsA}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Innings at Bat</label>
                            <input
                                type="text"
                                value={game.inningsABatting}
                                onChange={(e) => handleInningsChange('inningsABatting', e.target.value)}
                                className={`input font-mono ${errors.inningsABatting ? 'input-error' : ''}`}
                                placeholder="7"
                            />
                            {errors.inningsABatting && (
                                <p className="mt-1 text-xs text-error-400">{errors.inningsABatting}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Innings on Defense</label>
                            <input
                                type="text"
                                value={game.inningsADefense}
                                onChange={(e) => handleInningsChange('inningsADefense', e.target.value)}
                                className={`input font-mono ${errors.inningsADefense ? 'input-error' : ''}`}
                                placeholder="7"
                            />
                            {errors.inningsADefense && (
                                <p className="mt-1 text-xs text-error-400">{errors.inningsADefense}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Team B */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-success-500" />
                        <span className="font-semibold text-white">{game.teamBName}</span>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Runs Scored</label>
                        <input
                            type="number"
                            min="0"
                            value={game.runsB ?? ''}
                            onChange={(e) => handleRunsChange('runsB', e.target.value)}
                            className={`input font-mono ${errors.runsB ? 'input-error' : ''}`}
                            placeholder="0"
                        />
                        {errors.runsB && (
                            <p className="mt-1 text-xs text-error-400">{errors.runsB}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Innings at Bat</label>
                            <input
                                type="text"
                                value={game.inningsBBatting}
                                onChange={(e) => handleInningsChange('inningsBBatting', e.target.value)}
                                className={`input font-mono ${errors.inningsBBatting ? 'input-error' : ''}`}
                                placeholder="7"
                            />
                            {errors.inningsBBatting && (
                                <p className="mt-1 text-xs text-error-400">{errors.inningsBBatting}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Innings on Defense</label>
                            <input
                                type="text"
                                value={game.inningsBDefense}
                                onChange={(e) => handleInningsChange('inningsBDefense', e.target.value)}
                                className={`input font-mono ${errors.inningsBDefense ? 'input-error' : ''}`}
                                placeholder="7"
                            />
                            {errors.inningsBDefense && (
                                <p className="mt-1 text-xs text-error-400">{errors.inningsBDefense}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
