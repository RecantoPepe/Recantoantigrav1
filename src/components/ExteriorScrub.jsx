import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 211;

function padNum(n) {
  return String(n).padStart(6, '0');
}

export default function ExteriorScrub() {
  const wrapRef   = useRef(null);
  const canvasRef = useRef(null);
  const textRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    /* ── Canvas sizing ────────────────────── */
    function setSize() {
      canvas.width  = canvas.clientWidth  || window.innerWidth;
      canvas.height = canvas.clientHeight || window.innerHeight;
    }
    setSize();

    // Fondo oscuro inmediato — evita el "agujero negro" mientras cargan las imágenes
    ctx.fillStyle = '#0f1c16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* ── Pre-load images — se declara ANTES de drawFrame para evitar hoisting ── */
    const images = [];

    /* ── Frame drawing (cover-fit) ────────── */
    let currentFrame = 0;
    let targetFrame  = 0;

    function drawFrame(idx) {
      const img = images[Math.max(0, Math.min(Math.round(idx), TOTAL_FRAMES - 1))];
      if (!img || !img.complete || !img.naturalWidth) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const ar  = img.naturalWidth / img.naturalHeight;
      const car = cw / ch;
      let dx, dy, dw, dh;
      if (ar > car) {
        dh = ch; dw = dh * ar; dx = (cw - dw) / 2; dy = 0;
      } else {
        dw = cw; dh = dw / ar; dx = 0; dy = (ch - dh) / 2;
      }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    const ro = new ResizeObserver(() => {
      setSize();
      drawFrame(Math.round(currentFrame));
    });
    ro.observe(canvas);
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = `/exteriorScroll/ext_${padNum(i + 1)}.jpg`;
      // Draw first frame as soon as it's ready
      if (i === 0) {
        img.onload = () => drawFrame(0);
      }
      images.push(img);
    }

    /* ── LERP render loop ────────────────── */
    let rafId;
    function loop() {
      currentFrame += (targetFrame - currentFrame) * 0.10;
      drawFrame(currentFrame);
      rafId = requestAnimationFrame(loop);
    }
    loop();

    /* ── GSAP ScrollTrigger ──────────────── */
    // Initial state of text
    gsap.set(textRef.current, { y: 60, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:      wrapRef.current,
        pin:          true,
        anticipatePin: 1,
        start:        'top top',
        end:          '+=600%',
        scrub:        0.8,
        onUpdate(self) {
          targetFrame = Math.round(self.progress * (TOTAL_FRAMES - 1));
        },
      },
    });

    // Text appears at 30% progress, disappears at 90%
    tl.to(textRef.current, {
      y: 0, opacity: 1,
      ease: 'power2.out', duration: 0.2,
    }, 0.28);

    tl.to(textRef.current, {
      y: -40, opacity: 0,
      ease: 'power2.in', duration: 0.12,
    }, 0.88);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section ref={wrapRef} className="ext-scrub-section">
      <canvas ref={canvasRef} className="ext-canvas" />
      <div className="ext-overlay" />
      <div ref={textRef} className="ext-text">
        <span className="ext-label">Nuestros Refugios</span>
        <h2 className="ext-title">CABAÑAS RECANTO</h2>
        <p className="ext-sub">Cinco espacios únicos de madera y mar</p>
      </div>
    </section>
  );
}
