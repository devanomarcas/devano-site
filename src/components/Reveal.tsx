"use client";

import { useEffect } from "react";

export default function Reveal() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Revelações ao rolar (obras, textos, títulos)
    const els = document.querySelectorAll<HTMLElement>(".g-reveal, .g-frame, .g-rise");
    if (reduce) {
      els.forEach((el) => el.classList.add("in"));
    } else {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
      );
      els.forEach((el) => obs.observe(el));

      // Parallax suave nos elementos .parallax (data-speed opcional)
      const parEls = Array.from(document.querySelectorAll<HTMLElement>(".parallax"));
      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const vh = window.innerHeight;
          parEls.forEach((el) => {
            const r = el.getBoundingClientRect();
            const speed = parseFloat(el.dataset.speed || "0.12");
            const center = r.top + r.height / 2 - vh / 2;
            el.style.setProperty("--py", `${(-center * speed).toFixed(1)}px`);
          });
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      return () => {
        obs.disconnect();
        window.removeEventListener("scroll", onScroll);
      };
    }
  }, []);

  return null;
}
