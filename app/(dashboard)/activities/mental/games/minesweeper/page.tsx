"use client";
import { Card } from "@/components/ui/card";
import { Flag, Bomb } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const BOARD_SIZE = 10;
const MINES_COUNT = 15;

type Cell = {
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborMines: number;
};

export default function MineGame() {
    const [board, setBoard] = useState<Cell[][]>([]);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [highScore, setHighScore] = useState<number>(0);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [flagsPlaced, setFlagsPlaced] = useState<number>(0);

    useEffect(() => {
        initializeBoard();
    }, []);

    const initializeBoard = (): void => {
        // Create empty board
        let newBoard: Cell[][] = Array(BOARD_SIZE)
            .fill(null)
            .map(() =>
                Array(BOARD_SIZE)
                    .fill(null)
                    .map(() => ({
                        isMine: false,
                        isRevealed: false,
                        isFlagged: false,
                        neighborMines: 0,
                    }))
            );

        // Place mines randomly
        let minesPlaced = 0;
        while (minesPlaced < MINES_COUNT) {
            const x = Math.floor(Math.random() * BOARD_SIZE);
            const y = Math.floor(Math.random() * BOARD_SIZE);
            if (!newBoard[y][x].isMine) {
                newBoard[y][x].isMine = true;
                minesPlaced++;
            }
        }

        // Calculate neighbor mines
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                if (!newBoard[y][x].isMine) {
                    let neighbors = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const ny = y + dy;
                            const nx = x + dx;
                            if (
                                ny >= 0 &&
                                ny < BOARD_SIZE &&
                                nx >= 0 &&
                                nx < BOARD_SIZE
                            ) {
                                if (newBoard[ny][nx].isMine) neighbors++;
                            }
                        }
                    }
                    newBoard[y][x].neighborMines = neighbors;
                }
            }
        }

        setBoard(newBoard);
        setGameOver(false);
        setScore(0);
        setFlagsPlaced(0);
    };

    const revealCell = (y: number, x: number): void => {
        if (gameOver || isPaused || board[y][x].isRevealed || board[y][x].isFlagged) return;

        const newBoard: Cell[][] = [...board];
        if (newBoard[y][x].isMine) {
            // Game Over - reveal all mines
            newBoard.forEach((row) =>
                row.forEach((cell) => {
                    if (cell.isMine) cell.isRevealed = true;
                })
            );
            setGameOver(true);
            if (score > highScore) setHighScore(score);
        } else {
            // Reveal current cell and update score
            revealCellRecursive(newBoard, y, x);
            setScore((prevScore) => prevScore + 1);
        }
        setBoard(newBoard);
    };

    const revealCellRecursive = (board: Cell[][], y: number, x: number): void => {
        if (y < 0 || y >= BOARD_SIZE || x < 0 || x >= BOARD_SIZE) return;
        if (board[y][x].isRevealed || board[y][x].isFlagged || board[y][x].isMine) return;

        board[y][x].isRevealed = true;
        if (board[y][x].neighborMines === 0) {
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    revealCellRecursive(board, y + dy, x + dx);
                }
            }
        }
    };

    const toggleFlag = (y: number, x: number, e: React.MouseEvent): void => {
        e.preventDefault();
        if (gameOver || isPaused || board[y][x].isRevealed) return;

        const newBoard: Cell[][] = [...board];
        newBoard[y][x].isFlagged = !newBoard[y][x].isFlagged;
        setBoard(newBoard);
        setFlagsPlaced((prev) => (newBoard[y][x].isFlagged ? prev + 1 : prev - 1));
    };

    const getCellColor = (cell: Cell): string => {
        if (cell.isRevealed) {
            return cell.isMine ? "bg-red-500" : "bg-[#C8E6B7]";
        }
        return "bg-[#314328] hover:bg-[#1f2b1f]";
    };

    const getNumberColor = (number: number): string => {
        const colors: string[] = [
            "text-blue-600",
            "text-green-600",
            "text-red-600",
            "text-purple-600",
            "text-yellow-600",
            "text-pink-600",
            "text-teal-600",
            "text-gray-600",
        ];
        return colors[number - 1] || "";
    };

    return (
        <div className="min-h-screen bg-[#E5F4DD] p-8">
            <div className="mb-6">
                <Link
                    href="/activities/mental"
                    className="inline-block px-4 py-2 bg-[#314328] text-white rounded-lg hover:bg-[#1f2b1f] transition-colors"
                >
                    Back to Mental Activities
                </Link>
            </div>
            <Card className="p-6 bg-[#d4f0c5] rounded-lg overflow-hidden max-w-2xl mx-auto">
                <div className="flex justify-between mb-4">
                    <p className="text-2xl text-[#314328]">Score: {score}</p>
                    <p className="text-2xl text-[#314328]">Mines: {MINES_COUNT - flagsPlaced}</p>
                    <p className="text-2xl text-[#314328]">High Score: {highScore}</p>
                </div>
                <div
                    className="grid gap-1 mx-auto"
                    style={{
                        gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                        width: "fit-content",
                    }}
                >
                    {board.map((row, y) =>
                        row.map((cell, x) => (
                            <button
                                key={`${y}-${x}`}
                                className={`w-8 h-8 flex items-center justify-center font-bold transition-colors ${getCellColor(
                                    cell
                                )}`}
                                onClick={() => revealCell(y, x)}
                                onContextMenu={(e) => toggleFlag(y, x, e)}
                                disabled={gameOver || isPaused}
                            >
                                {cell.isRevealed ? (
                                    cell.isMine ? (
                                        <Bomb size={20} className="text-white" />
                                    ) : (
                                        cell.neighborMines > 0 && (
                                            <span className={getNumberColor(cell.neighborMines)}>
                                                {cell.neighborMines}
                                            </span>
                                        )
                                    )
                                ) : cell.isFlagged ? (
                                    <Flag size={20} className="text-white" />
                                ) : null}
                            </button>
                        ))
                    )}
                </div>
                <div className="mt-4 flex justify-center">
                    <button
                        className="px-6 py-3 bg-[#314328] text-white rounded-full text-xl font-semibold hover:bg-[#1f2b1f] transition-colors"
                        onClick={() =>
                            gameOver ? initializeBoard() : setIsPaused(!isPaused)
                        }
                    >
                        {gameOver ? "New Game" : isPaused ? "Resume" : "Pause"}
                    </button>
                </div>
                {gameOver && (
                    <div className="mt-6 text-center">
                        <p className="text-3xl font-bold text-red-500 mb-4">
                            Game Over!
                        </p>
                        <p className="text-xl text-[#314328]">
                            Click New Game to play again
                        </p>
                    </div>
                )}
                <p className="mt-6 text-lg text-center text-[#314328]">
                    Left click to reveal cells. Right click to place/remove flags.
                </p>
            </Card>
        </div>
    );
}