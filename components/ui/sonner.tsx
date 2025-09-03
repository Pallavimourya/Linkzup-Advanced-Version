"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="sonner-toaster"
      position="top-center"
      toastOptions={{
        style: {
          background: 'rgb(240 253 244)', // green-50
          color: 'rgb(22 101 52)', // green-800
          border: '2px solid rgb(187 247 208)', // green-200
          boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.1), 0 10px 10px -5px rgba(34, 197, 94, 0.04)',
          borderRadius: '12px',
          fontWeight: '500',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
