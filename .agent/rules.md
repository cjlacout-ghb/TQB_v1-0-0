# Agent Rules: TQB Calculator Logic

This file documents the strict logical rules that must be followed when developing or modifying the TQB Calculator application.

## 1. The "Golden Rule": Strict Waterfall Enforcement
The application implements the **WBSC Tournament Regulations Rule C11** for tie-breaking. 
**CRITICAL:** The implementation is **strictly sequential and non-recursive** (The Waterfall Rule).

### Do's:
- **Sequential Flow:** Criteria are applied in order: Win-Loss -> Head-to-Head -> TQB -> ER-TQB.
- **Forward Progress:** Once a tie moves to a subsequent step (e.g., from H2H to TQB), the calculation for the remaining tied teams proceeds to the *next* criteria (ER-TQB).
- **Subgroup Isolation:** When calculating stats (like TQB) for a tied group, use **only** the games played between the teams in that specific tied group.

### Don'ts:
- **NO Recursion:** **NEVER** reset the process to Step 1 (Head-to-Head) after a partial separation. The "Separation Rule" (often cited as Note 1 in Baseball rules) is **NOT** applied here.
- **No Backtracking:** Once logic moves to TQB, it never looks back at Head-to-Head for that group.

## 2. Subsidiary Softball Constraints
To ensure data validity for the TQB calculation, the following game entry rules are enforced:
- **Synchronized Innings:** "Innings at Bat" for Team A must equal "Innings on Defense" for Team B.
- **Home Team Winning:** If Home wins, their Innings at Bat must be **less than** the Visitor's (did not bat in bottom of last inning).
- **Home Team Losing:** If Home loses, their Innings at Bat must be **equal to** the Visitor's.

## 3. UI/UX Rules
- **Rule Visibility:** When automated criteria (ER-TQB) fail to resolve a tie, explicitly link the user to the "Official Rule C11" section of the manual for manual resolution instructions (Batting Average / Coin Toss).
