import type React from "react"

export const WobbleCard = ({
  children,
  containerClassName,
}: { children: React.ReactNode; containerClassName?: string }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 hover:-translate-y-1 ${containerClassName}`}
    >
      {children}
    </div>
  )
}