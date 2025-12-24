"use client"

import * as React from "react"
import { Tabs as BaseTabs, TabsContent, TabsList as BaseTabsList, TabsTrigger as BaseTabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// 1. Fixed the Interface to include variant
export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof BaseTabsList> {
  glow?: boolean;
  variant?: "glass" | "default";
}

export const TabsList = React.forwardRef<
  React.ElementRef<typeof BaseTabsList>,
  TabsListProps
>(({ className, variant = "glass", glow = true, ...props }, ref) => {
  return (
    <BaseTabsList
      ref={ref}
      className={cn(
        "relative flex h-14 p-1 items-center justify-start rounded-2xl transition-all",
        glow && "", // Subtle pink glow for the track
        className
      )}
      {...props}
    />
  )
})
TabsList.displayName = "TabsList"

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof BaseTabsTrigger>,
  React.ComponentPropsWithoutRef<typeof BaseTabsTrigger> & { active?: boolean }
>(({ className, children, ...props }, ref) => {
  return (
    <BaseTabsTrigger
      ref={ref}
      className={cn(
        "relative z-20 h-full px-6 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors data-[state=active]:text-white bg-transparent border-none shadow-none",
        className
      )}
      {...props}
    >
      <span className="relative z-30">{children}</span>
      
      {/* This is the sliding pink glass effect */}
      <motion.div
        layoutId="activeTabSlider"
        className="absolute inset-0 z-10 hidden data-[active=true]:block"
        initial={false}
        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[#FC90AF]/10 rounded-xl border border-[#FC90AF]/30 backdrop-blur-sm" />
        {/* The Pink Glow Core */}
        <div className="absolute inset-0 shadow-[0_0_15px_rgba(252,144,175,0.4)] rounded-xl" />
      </motion.div>
    </BaseTabsTrigger>
  )
})
TabsTrigger.displayName = "TabsTrigger"

export {
  BaseTabs as Tabs,
  TabsContent,
}