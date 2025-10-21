import { useBreakpoints as _useBreakpoints } from '@vueuse/core'

export function useBreakpoints() {
  const breakpoints = _useBreakpoints({
    'sm': 640,
    'md': 768,
    'lg': 1024,
    'xl': 1280,
    '2xl': 1536,
  })

  const isMobile = breakpoints.smaller('md')

  return {
    isMobile,
  }
}
