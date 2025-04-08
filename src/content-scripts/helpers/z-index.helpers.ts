export const getHighestZIndexFromTab = (): number => {
  let maxZ = 10;
  document.querySelectorAll("*").forEach((el) => {
    const z = window.getComputedStyle(el).zIndex;
    if (!isNaN(parseInt(z))) {
      maxZ = Math.max(maxZ, parseInt(z));
    }
  });

  return maxZ;
};
