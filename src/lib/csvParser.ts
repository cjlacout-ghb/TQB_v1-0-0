// CSV parsing utility for TQB Calculator
import { CSVRow, GameData, Team } from './types';

export interface CSVParseResult {
    success: boolean;
    teams: Team[];
    games: GameData[];
    errors: string[];
}

/**
 * Parse CSV content into teams and game data
 * Expected columns: Team_A, Team_B, Runs_A, Runs_B, Earned_Runs_A, Earned_Runs_B,
 *                   Innings_A_Batting, Innings_A_Defense, Innings_B_Batting, Innings_B_Defense
 */
export function parseCSV(content: string): CSVParseResult {
    const errors: string[] = [];
    const teams = new Map<string, Team>();
    const games: GameData[] = [];

    const lines = content.trim().split(/\r?\n/);

    if (lines.length < 2) {
        return {
            success: false,
            teams: [],
            games: [],
            errors: ['CSV must contain a header row and at least one data row'],
        };
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const expectedHeaders = [
        'team_a', 'team_b', 'runs_a', 'runs_b',
        'earned_runs_a', 'earned_runs_b',
        'innings_a_batting', 'innings_a_defense',
        'innings_b_batting', 'innings_b_defense'
    ];

    // Check for required columns
    const headerIndices: Record<string, number> = {};
    for (const expected of expectedHeaders) {
        const index = header.indexOf(expected);
        if (index === -1) {
            errors.push(`Missing required column: ${expected}`);
        } else {
            headerIndices[expected] = index;
        }
    }

    if (errors.length > 0) {
        return { success: false, teams: [], games: [], errors };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim());
        const rowNum = i + 1;

        try {
            const teamAName = values[headerIndices['team_a']];
            const teamBName = values[headerIndices['team_b']];
            const runsA = parseInt(values[headerIndices['runs_a']], 10);
            const runsB = parseInt(values[headerIndices['runs_b']], 10);
            const earnedRunsA = parseInt(values[headerIndices['earned_runs_a']], 10);
            const earnedRunsB = parseInt(values[headerIndices['earned_runs_b']], 10);
            const inningsABatting = values[headerIndices['innings_a_batting']];
            const inningsADefense = values[headerIndices['innings_a_defense']];
            const inningsBBatting = values[headerIndices['innings_b_batting']];
            const inningsBDefense = values[headerIndices['innings_b_defense']];

            // Validate team names
            if (!teamAName || !teamBName) {
                errors.push(`Row ${rowNum}: Missing team name(s)`);
                continue;
            }

            // Validate runs
            if (isNaN(runsA) || isNaN(runsB) || runsA < 0 || runsB < 0) {
                errors.push(`Row ${rowNum}: Invalid runs values`);
                continue;
            }

            // Validate earned runs
            if (isNaN(earnedRunsA) || isNaN(earnedRunsB) || earnedRunsA < 0 || earnedRunsB < 0) {
                errors.push(`Row ${rowNum}: Invalid earned runs values`);
                continue;
            }

            // Validate innings format
            const inningsRegex = /^(\d+)(\.([12]))?$/;
            if (!inningsRegex.test(inningsABatting) ||
                !inningsRegex.test(inningsADefense) ||
                !inningsRegex.test(inningsBBatting) ||
                !inningsRegex.test(inningsBDefense)) {
                errors.push(`Row ${rowNum}: Invalid innings format (use X, X.1, or X.2)`);
                continue;
            }

            // Add teams to map
            if (!teams.has(teamAName)) {
                teams.set(teamAName, { id: `team-${teams.size}`, name: teamAName });
            }
            if (!teams.has(teamBName)) {
                teams.set(teamBName, { id: `team-${teams.size}`, name: teamBName });
            }

            const teamA = teams.get(teamAName)!;
            const teamB = teams.get(teamBName)!;

            // Create game data
            games.push({
                id: `game-${games.length}`,
                teamAId: teamA.id,
                teamBId: teamB.id,
                teamAName: teamA.name,
                teamBName: teamB.name,
                runsA,
                runsB,
                inningsABatting,
                inningsADefense,
                inningsBBatting,
                inningsBDefense,
                earnedRunsA,
                earnedRunsB,
            });
        } catch (err) {
            errors.push(`Row ${rowNum}: Error parsing data - ${err}`);
        }
    }

    // Check team count
    const teamList = Array.from(teams.values());
    if (teamList.length < 2) {
        errors.push('CSV must contain at least 2 different teams');
    }
    if (teamList.length > 8) {
        errors.push('CSV contains more than 8 teams (maximum allowed)');
    }

    return {
        success: errors.length === 0,
        teams: teamList,
        games,
        errors,
    };
}

/**
 * Generate sample CSV content for the help tooltip
 */
export function getSampleCSV(): string {
    return `Team_A,Team_B,Runs_A,Runs_B,Earned_Runs_A,Earned_Runs_B,Innings_A_Batting,Innings_A_Defense,Innings_B_Batting,Innings_B_Defense
Tigers,Eagles,5,3,4,2,7,6.2,6.2,7
Eagles,Sharks,2,8,1,6,7,7,7,7
Tigers,Sharks,4,4,3,3,7,7,7,7`;
}
