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
      duration={4000}
      toastOptions={{
        style: {
          background: 'rgb(240 253 244)', // green-50
          color: 'rgb(22 101 52)', // green-800
          border: '2px solid rgb(187 247 208)', // green-200
          boxShadow: '0 4px 12px -2px rgba(34, 197, 94, 0.1), 0 2px 4px -1px rgba(34, 197, 94, 0.06)',
          borderRadius: '8px',
          fontWeight: '500',
          fontSize: '12px',
          padding: '8px 12px',
          maxWidth: '320px',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
