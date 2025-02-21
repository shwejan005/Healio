"use client";
import React, { useState, useEffect, useCallback, JSX } from "react";
import { Card } from "@/components/ui/card";
import { PlayCircle, StopCircle } from "lucide-react";
import Link from "next/link";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

type Shape = number[][];
type Piece = {
    shape: Shape;
    color: string;
};

const SHAPES: Shape[] = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 1], [1, 0, 0]],
    [[1, 1, 1], [0, 0, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
];

const COLORS = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500"];

const createEmptyBoard = (): string[][] =>
    Array(BOARD_HEIGHT)
        .fill(null)
        .map(() => Array(BOARD_WIDTH).fill(""));

export default function TetrisGame() {
    const [board, setBoard] = useState<string[][]>(createEmptyBoard());
    const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
    const [currentPosition, setCurrentPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [score, setScore] = useState<number>(0);
    const [highScore, setHighScore] = useState<number>(0);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);

    const spawnNewPiece = useCallback(() => {
        const shapeIndex = Math.floor(Math.random() * SHAPES.length);
        const newPiece: Piece = {
            shape: SHAPES[shapeIndex],
            color: COLORS[shapeIndex],
        };
        setCurrentPiece(newPiece);
        setCurrentPosition({
            x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2),
            y: 0,
        });
        if (
            !isValidMove(
                newPiece.shape,
                {
                    x: Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2),
                    y: 0,
                }
            )
        ) {
            setGameOver(true);
        }
    }, []);

    const isValidMove = (piece: Shape, position: { x: number; y: number }): boolean => {
        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x]) {
                    const newX = position.x + x;
                    const newY = position.y + y;
                    if (
                        newX < 0 ||
                        newX >= BOARD_WIDTH ||
                        newY >= BOARD_HEIGHT ||
                        (newY >= 0 && board[newY][newX])
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    };

    const rotatePiece = (piece: Shape): void => {
        const newPiece = piece[0].map((_, index) => piece.map(row => row[index]).reverse());
        if (isValidMove(newPiece, currentPosition)) {
            setCurrentPiece({ ...currentPiece!, shape: newPiece });
        }
    };

    const movePiece = (dx: number, dy: number): void => {
        const newPosition = { x: currentPosition.x + dx, y: currentPosition.y + dy };
        if (isValidMove(currentPiece!.shape, newPosition)) {
            setCurrentPosition(newPosition);
        } else if (dy > 0) {
            placePiece();
        }
    };

    const placePiece = (): void => {
        const newBoard = board.map(row => [...row]);
        currentPiece!.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    newBoard[y + currentPosition.y][x + currentPosition.x] = currentPiece!.color;
                }
            });
        });
        setBoard(newBoard);
        clearLines(newBoard);
        spawnNewPiece();
    };

    const clearLines = (board: string[][]): void => {
        let linesCleared = 0;
        const newBoard = board.filter(row => {
            if (row.every(cell => cell !== "")) {
                linesCleared++;
                return false;
            }
            return true;
        });
        while (newBoard.length < BOARD_HEIGHT) {
            newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        }
        setBoard(newBoard);
        setScore(prevScore => {
            const newScore = prevScore + linesCleared * 100;
            setHighScore(Math.max(newScore, highScore));
            return newScore;
        });
    };

    const resetGame = useCallback(() => {
        setBoard(createEmptyBoard());
        setScore(0);
        setGameOver(false);
        setIsPaused(false);
        spawnNewPiece();
    }, [spawnNewPiece]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent): void => {
            if (e.key === " ") {
                if (gameOver) {
                    resetGame();
                } else {
                    setIsPaused(prev => !prev);
                }
                return;
            }
            if (isPaused || gameOver) return;
            switch (e.key.toLowerCase()) {
                case "arrowleft":
                case "a":
                    movePiece(-1, 0);
                    break;
                case "arrowright":
                case "d":
                    movePiece(1, 0);
                    break;
                case "arrowdown":
                case "s":
                    movePiece(0, 1);
                    break;
                case "arrowup":
                case "w":
                    rotatePiece(currentPiece!.shape);
                    break;
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, [currentPiece, currentPosition, board, isPaused, gameOver, resetGame]);

    useEffect(() => {
        if (!currentPiece && !gameOver) {
            spawnNewPiece();
        }
    }, [currentPiece, gameOver, spawnNewPiece]);

    useEffect(() => {
        if (gameOver || isPaused) return;
        const gameLoop = setInterval(() => {
            movePiece(0, 1);
        }, 1000);
        return () => {
            clearInterval(gameLoop);
        };
    }, [currentPiece, currentPosition, board, gameOver, isPaused]);

    const renderBoard = (): JSX.Element[] => {
        const boardWithPiece = board.map(row => [...row]);
        if (currentPiece) {
            currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        const boardY = y + currentPosition.y;
                        const boardX = x + currentPosition.x;
                        if (
                            boardY >= 0 &&
                            boardY < BOARD_HEIGHT &&
                            boardX >= 0 &&
                            boardX < BOARD_WIDTH
                        ) {
                            boardWithPiece[boardY][boardX] = currentPiece.color;
                        }
                    }
                });
            });
        }
        return boardWithPiece.map((row, y) => (
            <div key={y} className="flex">
                {row.map((cell, x) => (
                    <div
                        key={x}
                        className="border border-gray-300"
                        style={{
                            width: BLOCK_SIZE,
                            height: BLOCK_SIZE,
                            backgroundColor: cell || "#E5F4DD",
                        }}
                    />
                ))}
            </div>
        ));
    };

    return (
        <Card className="p-6 bg-[#E5F4DD] rounded-lg overflow-hidden">
            <div className="mb-6">
                <Link
                    href="/activities/mental"
                    className="inline-block px-4 py-2 bg-[#314328] text-white rounded-lg hover:bg-[#1f2b1f] transition-colors"
                >
                    Back to Mental Activities
                </Link>
            </div>
            <div className="flex justify-between mb-4">
                <p className="text-2xl text-[#314328]">Score: {score}</p>
                <p className="text-2xl text-[#314328]">High Score: {highScore}</p>
            </div>
            <div
                className="relative bg-[#E5F4DD] border-4 border-[#314328] rounded-lg overflow-hidden mx-auto"
                style={{
                    width: BOARD_WIDTH * BLOCK_SIZE,
                    height: BOARD_HEIGHT * BLOCK_SIZE,
                }}
            >
                {renderBoard()}
                {isPaused && !gameOver && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <p className="text-4xl font-bold text-white">PAUSED</p>
                    </div>
                )}
            </div>
            <div className="mt-4 flex justify-center">
                <button
                    className="px-6 py-3 bg-[#314328] text-white rounded-full text-xl font-semibold hover:bg-[#1f2b1f] transition-colors flex items-center"
                    onClick={() => (gameOver ? resetGame() : setIsPaused(!isPaused))}
                >
                    {gameOver ? (
                        "Restart"
                    ) : isPaused ? (
                        <>
                            <PlayCircle size={24} className="mr-2" />
                            Resume
                        </>
                    ) : (
                        <>
                            <StopCircle size={24} className="mr-2" />
                            Pause
                        </>
                    )}
                </button>
            </div>
            {gameOver && (
                <div className="mt-6 text-center">
                    <p className="text-3xl font-bold text-red-500 mb-4">Game Over!</p>
                    <p className="text-xl text-[#314328]">Press space to play again</p>
                </div>
            )}
            <p className="mt-6 text-lg text-center text-[#314328]">
                Use arrow keys or WASD to move and rotate. Press space to pause/resume or restart when game over.
            </p>
        </Card>
    );
}