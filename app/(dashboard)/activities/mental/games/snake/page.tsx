'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card } from "@/components/ui/card"
import {  PlayCircle, StopCircle } from 'lucide-react'
import Link from 'next/link'

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_DIRECTION = { x: 1, y: 0 }
const INITIAL_FOOD = { x: 15, y: 15 }

export default function SnakeGame() {
    const [snake, setSnake] = useState(INITIAL_SNAKE)
    const [direction, setDirection] = useState(INITIAL_DIRECTION)
    const [food, setFood] = useState(INITIAL_FOOD)
    const [gameOver, setGameOver] = useState(false)
    const [score, setScore] = useState(0)
    const [highScore, setHighScore] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    const moveSnake = useCallback(() => {
        if (gameOver || isPaused) return

        setSnake((prevSnake) => {
            const newSnake = [...prevSnake]
            const head = { ...newSnake[0] }

            head.x += direction.x
            head.y += direction.y

            if (
                head.x < 0 ||
                head.x >= GRID_SIZE ||
                head.y < 0 ||
                head.y >= GRID_SIZE ||
                newSnake.some((segment) => segment.x === head.x && segment.y === head.y)
            ) {
                setGameOver(true)
                return prevSnake
            }

            newSnake.unshift(head)

            if (head.x === food.x && head.y === food.y) {
                const newFood = {
                    x: Math.floor(Math.random() * GRID_SIZE),
                    y: Math.floor(Math.random() * GRID_SIZE),
                }
                setFood(newFood)
                setScore((prevScore) => {
                    const newScore = prevScore + 1
                    setHighScore((prevHighScore) => Math.max(prevHighScore, newScore))
                    return newScore
                })
            } else {
                newSnake.pop()
            }

            return newSnake
        })
    }, [direction, food, gameOver, isPaused])

    const resetGame = useCallback(() => {
        setSnake(INITIAL_SNAKE)
        setDirection(INITIAL_DIRECTION)
        setFood(INITIAL_FOOD)
        setGameOver(false)
        setScore(0)
        setIsPaused(false)
    }, [])

    useEffect(() => {
        const handleKeyPress = (e: { key: string }) => {
            if (e.key === ' ') {
                if (gameOver) {
                    resetGame();
                } else {
                    setIsPaused((prev) => !prev);
                }
                return;
            }

            if (isPaused || gameOver) return;

            switch (e.key.toLowerCase()) {
                case 'arrowup':
                case 'w':
                    setDirection((prev) => prev.y === 0 ? { x: 0, y: -1 } : prev)
                    break
                case 'arrowdown':
                case 's':
                    setDirection((prev) => prev.y === 0 ? { x: 0, y: 1 } : prev)
                    break
                case 'arrowleft':
                case 'a':
                    setDirection((prev) => prev.x === 0 ? { x: -1, y: 0 } : prev)
                    break
                case 'arrowright':
                case 'd':
                    setDirection((prev) => prev.x === 0 ? { x: 1, y: 0 } : prev)
                    break
            }
        }

        window.addEventListener('keydown', handleKeyPress)

        const gameLoop = setInterval(moveSnake, 100)

        return () => {
            window.removeEventListener('keydown', handleKeyPress)
            clearInterval(gameLoop)
        }
    }, [moveSnake, isPaused, gameOver, resetGame])

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
                    width: GRID_SIZE * CELL_SIZE,
                    height: GRID_SIZE * CELL_SIZE,
                }}
            >
                {snake.map((segment, index) => (
                    <div
                        key={index}
                        className="absolute bg-[#314328] rounded-sm"
                        style={{
                            left: segment.x * CELL_SIZE,
                            top: segment.y * CELL_SIZE,
                            width: CELL_SIZE,
                            height: CELL_SIZE,
                        }}
                    />
                ))}
                <div
                    className="absolute bg-red-500 rounded-full"
                    style={{
                        left: food.x * CELL_SIZE,
                        top: food.y * CELL_SIZE,
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                    }}
                />
                {isPaused && !gameOver && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <p className="text-4xl font-bold text-white">PAUSED</p>
                    </div>
                )}
            </div>
            <div className="mt-4 flex justify-center">
                <button
                    className="px-6 py-3 bg-[#314328] text-white rounded-full text-xl font-semibold hover:bg-[#1f2b1f] transition-colors flex items-center"
                    onClick={() => gameOver ? resetGame() : setIsPaused(!isPaused)}
                >
                    {gameOver ? (
                        'Restart'
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
                Use arrow keys or WASD to control the snake. Press space to pause/resume or restart when game over.
            </p>
        </Card>
    )
}

