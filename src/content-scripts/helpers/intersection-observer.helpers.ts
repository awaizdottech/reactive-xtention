export const hookIntersectionObserver = (
  target: Element,
  iconBox: HTMLElement
) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        iconBox!.style.display = "none";
      } else {
        iconBox!.style.display = "block";
      }
    });
  });

  observer.observe(target);
};
