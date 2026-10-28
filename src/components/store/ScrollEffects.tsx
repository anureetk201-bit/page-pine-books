import { useEffect, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Blocks that fade up as they enter the viewport, and grids whose items stagger in.
const REVEAL_SELECTOR =
  "main > section, main > div, main > article, main > aside, main > form, footer";
const STAGGER_SELECTOR = "main .grid";

/** Smooth wheel scrolling, scroll-reveal animations, hero parallax and a reading progress bar for every page. */
export function ScrollEffects() {
  const router = useRouter();
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Smooth scrolling. Scroll-locked pages (open dialogs, menus) and inner scroll areas keep native scrolling.
    const lenis = reduceMotion
      ? null
      : new Lenis({
          autoRaf: true,
          anchors: true,
          lerp: 0.16,
          wheelMultiplier: 1,
          prevent: (node) =>
            document.body.hasAttribute("data-scroll-locked") ||
            !!node.closest(
              "[data-radix-scroll-area-viewport], [role=dialog], [role=listbox], [role=menu], [data-lenis-prevent]",
            ),
        });
    // Cancel any in-flight smooth scroll so route scroll restoration lands where it should.
    const unsubscribe = router.subscribe("onBeforeNavigate", () =>
      lenis?.scrollTo(window.scrollY, { immediate: true, force: true }),
    );

    // Reveal on scroll. Only content below the fold is hidden, so the first paint never flickers.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const prepare = (el: HTMLElement, delay = 0) => {
      if (el.dataset["reveal"] || el.closest("[data-no-reveal]")) return;
      el.dataset["reveal"] = "";
      if (reduceMotion || el.getBoundingClientRect().top < window.innerHeight) return;
      el.style.setProperty("--reveal-delay", `${delay}ms`);
      el.classList.add("reveal");
      observer.observe(el);
    };

    const scan = () => {
      document.querySelectorAll<HTMLElement>(STAGGER_SELECTOR).forEach((grid) => {
        if (grid.children.length > 24) return;
        Array.from(grid.children).forEach((child, i) =>
          prepare(child as HTMLElement, (i % 6) * 45),
        );
      });
      document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR).forEach((el) => prepare(el));
    };

    // Pick up content that arrives later (route changes, catalog loading).
    let frame = 0;
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    scan();
    mutations.observe(document.body, { childList: true, subtree: true });

    // Progress bar and parallax, updated once per frame.
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current)
        barRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      if (reduceMotion) return;
      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = Number(el.dataset["parallax"]) || 0.2;
        el.style.transform = `translate3d(0, ${Math.min(window.scrollY, window.innerHeight) * speed}px, 0)`;
      });
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();

    return () => {
      unsubscribe();
      lenis?.destroy();
      observer.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [router]);

  return (
    <div
      ref={barRef}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-accent"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
