/* ── shadcn/ui theme config: green ──
 *
 * Hue:    142 (green)
 * Polar:  hsl(142, saturation%, lightness%)
 *
 * To change theme color:
 *   1. Replace 142 with your hue (0=red, 210=blue, 270=purple, etc.)
 *   2. Adjust saturation/lightness to taste
 *   3. See globals.css for the full variable map
 */

export const theme = {
  name: "green",
  hue: 142 as const,
  radius: {
    sm: "calc(0.625rem - 4px)",
    md: "calc(0.625rem - 2px)",
    lg: "0.625rem",
    xl: "calc(0.625rem + 4px)",
  },
  animation: {
    duration: {
      fast: "150ms",
      normal: "200ms",
      slow: "300ms",
    },
    easing: {
      out: "ease-out",
      in: "ease-in",
    },
  },
} as const
