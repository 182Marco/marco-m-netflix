export function getScrollThresholdNav(screenWidth: number): number {
  if (screenWidth > 1010) {
    return 400;
  }

  if (screenWidth > 800) {
    return 350;
  }

  if (screenWidth > 600) {
    return 310;
  }

  if (screenWidth > 400) {
    return 230;
  }

  return 160;
}
