"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: "w-fit",
        months: "flex gap-4 flex-col md:flex-row relative",
        month: "flex flex-col w-full gap-4",
        nav: "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
        button_previous: "absolute left-1 top-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        button_next: "absolute right-1 top-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        month_caption: "flex items-center justify-center h-7 w-full px-7 text-sm font-medium",
        caption_label: "text-sm font-medium",
        table: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none p-2",
        week: "flex w-full mt-2",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:bg-accent",
        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
          )
        },
        // Override the Button component to prevent nesting
        Button: ({ className, ...props }) => {
          // Check if this is a navigation button (previous/next month)
          const isNavButton = props["aria-label"]?.includes("month") || props["aria-label"]?.includes("year")
          
          if (isNavButton) {
            // For navigation buttons, use native button with buttonVariants styling
            return (
              <button
                type="button"
                className={cn(
                  buttonVariants({ variant: buttonVariant, size: "icon" }),
                  "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
                  className
                )}
                {...props}
              />
            )
          }
          
          // For other buttons (like day buttons), use native button
          return (
            <button
              type="button"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                className
              )}
              {...props}
            />
          )
        },
        DayButton: ({ className, day, modifiers, ...props }) => {
          const defaultClassNames = getDefaultClassNames()
          const ref = React.useRef<HTMLButtonElement>(null)
          
          React.useEffect(() => {
            if (modifiers.focused) ref.current?.focus()
          }, [modifiers.focused])

          return (
            <button
              ref={ref}
              type="button"
              data-day={day.date.toLocaleDateString()}
              data-selected-single={
                modifiers.selected &&
                !modifiers.range_start &&
                !modifiers.range_end &&
                !modifiers.range_middle
              }
              data-range-start={modifiers.range_start}
              data-range-end={modifiers.range_end}
              data-range-middle={modifiers.range_middle}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
                defaultClassNames.day,
                className
              )}
              {...props}
            />
          )
        },
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

export { Calendar }
