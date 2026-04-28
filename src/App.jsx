import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Menu, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(ScrollTrigger, Draggable);

/* ── GSAP HORIZONTAL LOOP HELPER ──────────────── */
function horizontalLoop(items, config) {
	items = gsap.utils.toArray(items);
	config = config || {};
	let tl = gsap.timeline({repeat: config.repeat, paused: config.paused, defaults: {ease: "none"}, onReverseComplete: () => tl.totalTime(tl.rawTime() + tl.duration() * 100)}),
		length = items.length,
		startX = items[0].offsetLeft,
		times = [],
		widths = [],
		xPercents = [],
		curIndex = 0,
		pixelsPerSecond = (config.speed || 1) * 100,
		snap = config.snap === false ? v => v : gsap.utils.snap(config.snap || 1), 
		totalWidth, curX, distanceToStart, distanceToLoop, item, i;
	gsap.set(items, { 
		xPercent: (i, target) => {
			let w = widths[i] = parseFloat(gsap.getProperty(target, "width", "px"));
			xPercents[i] = snap(parseFloat(gsap.getProperty(target, "xPercent")) / 100 * w + gsap.getProperty(target, "x", "px")) / w * 100;
			return xPercents[i];
		}
	});
	gsap.set(items, {x: 0});
	totalWidth = items[length-1].offsetLeft + xPercents[length-1] / 100 * widths[length-1] - startX + items[length-1].offsetWidth * gsap.getProperty(items[length-1], "scaleX") + (parseFloat(config.paddingRight) || 0);
	for (i = 0; i < length; i++) {
		item = items[i];
		curX = xPercents[i] / 100 * widths[i];
		distanceToStart = item.offsetLeft - startX;
		distanceToLoop = distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
		tl.to(item, {xPercent: snap((curX - distanceToLoop) / widths[i] * 100), duration: distanceToLoop / pixelsPerSecond}, 0)
		  .fromTo(item, {xPercent: snap((curX - distanceToLoop + totalWidth) / widths[i] * 100)}, {xPercent: xPercents[i], duration: (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond, immediateRender: false}, distanceToLoop / pixelsPerSecond)
		  .add("label" + i, distanceToStart / pixelsPerSecond);
		times[i] = distanceToStart / pixelsPerSecond;
	}
	function toIndex(index, vars) {
		vars = vars || {};
		(Math.abs(index - curIndex) > length / 2) && (index += index > curIndex ? -length : length); 
		let newIndex = gsap.utils.wrap(0, length, index),
			time = times[newIndex];
		if (time > tl.time() !== index > curIndex) { 
			vars.modifiers = {time: gsap.utils.unitize(gsap.utils.wrap(0, tl.duration()))};
			time += tl.duration() * (index > curIndex ? 1 : -1);
		}
		curIndex = newIndex;
		vars.overwrite = true;
		return tl.tweenTo(time, vars);
	}
	tl.next = vars => toIndex(curIndex + 1, vars);
	tl.previous = vars => toIndex(curIndex - 1, vars);
	tl.current = () => curIndex;
	tl.toIndex = (index, vars) => toIndex(index, vars);
	tl.times = times;
	tl.progress(1, true).progress(0, true); 
	if (config.reversed) {
		tl.vars.onReverseComplete();
		tl.reverse();
	}
	if (config.draggable && typeof(Draggable) !== "undefined") {
		let proxy = document.createElement("div"),
			type = config.dragType || "x,y",
			ratio = 1,
			onPress = function() {
				tl.pause();
			},
			onRelease = function() {
				tl.play();
			},
			draggable = Draggable.create(proxy, {
				trigger: items[0].parentNode,
				type: type,
				onPress: onPress,
				onRelease: onRelease,
				onDrag: function() {
					tl.progress(gsap.utils.wrap(0, 1, tl.progress() + (this.deltaX * ratio / totalWidth) * (config.reversed ? -1 : 1)));
				},
				onThrowUpdate: function() {
					tl.progress(gsap.utils.wrap(0, 1, tl.progress() + (this.deltaX * ratio / totalWidth) * (config.reversed ? -1 : 1)));
				},
				inertia: config.inertia || false
			})[0];
	}
	return tl;
}

/* ── SCROLLYTELLING COMPONENT ──────────────── */
const CabanasScrolly = ({ cabinImages, openLightbox }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const titleRef = useRef(null);
  const plusRef = useRef(null);
  const carouselRef = useRef(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const frameCount = 211;
    const loadedImages = [];
    let loadedCount = 0;

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const num = i.toString().padStart(6, '0');
      // Los frames están en /exteriorScroll/ext_000001.jpg (servidos desde public)
      img.src = `/exteriorScroll/ext_${num}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === frameCount) setImages(loadedImages);
      };
      loadedImages.push(img);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current || images.length === 0) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = 1920;
    canvas.height = 1080;

    const render = (index) => {
      const img = images[Math.floor(index)];
      if (img) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    render(0);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=2000%', // Mucho más espacio para que sea lento y chill
        pin: true,
        scrub: 1,
      },
    });

    // 1. Zoom Text (Portal Effect)
    tl.to(titleRef.current, { scale: 50, opacity: 0, ease: 'power2.in', duration: 3 });
    tl.to(plusRef.current, { color: 'var(--d)', scale: 250, duration: 3 }, 0);

    // 2. Reveal Canvas
    tl.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1 }, 2);

    // 3. Scrub frames
    const frameObj = { frame: 0 };
    tl.to(frameObj, {
      frame: images.length - 1,
      onUpdate: () => render(frameObj.frame),
      duration: 6,
    }, 3);

    // 4. Reveal Stacking Gallery
    tl.to(canvas, { opacity: 0, scale: 1.1, duration: 1.5 }, 9);
    tl.fromTo(carouselRef.current, { opacity: 0 }, { opacity: 1, duration: 1.5 }, 9);

    // Animación de apilado (Solid Stacking con Dwell)
    const cards = containerRef.current.querySelectorAll('.stack-card');
    cards.forEach((card, i) => {
      const startTime = 10 + (i * 3); // Más separación entre cartas
      
      if (i === 0) {
        tl.fromTo(card, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5 }, 10);
        return;
      }
      
      // La nueva carta sube
      tl.fromTo(card, 
        { yPercent: 120, opacity: 1 }, 
        { yPercent: 0, opacity: 1, duration: 2.5, ease: 'power2.out' }, 
        startTime
      );
      
      // La anterior solo se oscurece cuando la nueva está a punto de llegar
      if (i > 0) {
        tl.to(cards[i-1], { 
          scale: 0.92, 
          filter: 'brightness(0.2)', 
          duration: 1.5 
        }, startTime + 1); // Delay de 1 unidad para que no se ponga negra antes
      }
    });

    // Dwell final para la última carta
    tl.to({}, { duration: 2 }); 

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [images]);

  return (
    <section ref={containerRef} className="scrolly-cabanas" id="cabanas">
      <div className="scrolly-layers">
        
        {/* Portal Text */}
        <div ref={titleRef} className="scrolly-text-portal">
          <h2 className="portal-title">
            <span className="portal-word">CABAÑAS</span>
            <span ref={plusRef} className="portal-plus">+</span>
            <span className="portal-word">DESCANSO</span>
          </h2>
        </div>

        {/* Canvas Sequence */}
        <canvas ref={canvasRef} className="scrolly-canvas" />

        {/* Stacking Cards Gallery (Minimalist & High-End) */}
        <div ref={carouselRef} className="scrolly-carousel-layer" style={{ opacity: 0 }}>
           <div className="stack-gallery">
              {cabinImages.map((img, i) => (
                <div key={i} className="stack-card" 
                     onClick={() => openLightbox(img)}>
                   <div className="stack-card-inner">
                     <img src={img} alt={`Refugio ${i}`} />
                   </div>
                </div>
              ))}
              <div className="slider-hint"><span>Sigue bajando para pasar las fotos</span><div className="sh-line" /></div>
           </div>
        </div>

      </div>
    </section>
  );
};


/* ── DATA ─────────────────────────────────── */
const galleryRow1 = [
  'Fotos/El_lugar_en_imagenes/05age2.jpg','Fotos/El_lugar_en_imagenes/07Kfv0D.jpg',
  'Fotos/El_lugar_en_imagenes/11YVALw.jpg','Fotos/El_lugar_en_imagenes/28n7S.jpg',
  'Fotos/El_lugar_en_imagenes/4urQW03.jpg','Fotos/El_lugar_en_imagenes/7sH6W.jpg',
  'Fotos/El_lugar_en_imagenes/A2S62.jpg','Fotos/El_lugar_en_imagenes/Brxlo.jpg',
  'Fotos/El_lugar_en_imagenes/KFLUs.jpg','Fotos/El_lugar_en_imagenes/OpC5k.jpg',
  'Fotos/El_lugar_en_imagenes/RFknK.jpg','Fotos/El_lugar_en_imagenes/ULr06.jpg',
];
const galleryRow2 = [
  'Fotos/El_lugar_en_imagenes/WlyrJ.jpg','Fotos/El_lugar_en_imagenes/image (1).jpg',
  'Fotos/El_lugar_en_imagenes/jBTqt.jpg','Fotos/El_lugar_en_imagenes/lDyYJ.jpg',
  'Fotos/El_lugar_en_imagenes/p64kb.jpg','Fotos/El_lugar_en_imagenes/pareja_playa_web.jpg',
  'Fotos/El_lugar_en_imagenes/pareja_playa_web2.jpg','Fotos/El_lugar_en_imagenes/tQL13.jpg',
  'Fotos/El_lugar_en_imagenes/uZUY6.jpg','Fotos/El_lugar_en_imagenes/wFyfw.jpg',
  'Fotos/El_lugar_en_imagenes/xQZLz.jpg','Fotos/El_lugar_en_imagenes/zWYY5.jpg',
];
const cabinImages = [
  'Fotos/Nuestras_cabanas/02MuRc3.jpg','Fotos/Nuestras_cabanas/02PiPm7.jpg',
  'Fotos/Nuestras_cabanas/04k57lL.jpg','Fotos/Nuestras_cabanas/06PzGgp.jpg',
  'Fotos/Nuestras_cabanas/Bktwt.jpg','Fotos/Nuestras_cabanas/CW6L8.jpg',
  'Fotos/Nuestras_cabanas/GDu6p.jpg','Fotos/Nuestras_cabanas/image (05).jpg',
  'Fotos/Nuestras_cabanas/jTbMQ.jpg','Fotos/Nuestras_cabanas/lNHtQ.jpg',
  'Fotos/Nuestras_cabanas/NwY2h.jpg','Fotos/Nuestras_cabanas/PiPm7.jpg',
  'Fotos/Nuestras_cabanas/TZ4oe.jpg',
];
const interiorImages = [
  '/Fotos/adentro_de_la_cabana/04s51e0.jpg',
  '/Fotos/adentro_de_la_cabana/05yXj7C.jpg',
  '/Fotos/adentro_de_la_cabana/06EA1Ch.jpg',
  '/Fotos/adentro_de_la_cabana/06JYWxg.jpg',
  '/Fotos/adentro_de_la_cabana/06a5P7Iz.jpg',
  '/Fotos/adentro_de_la_cabana/06pUwaW.jpg',
  '/Fotos/adentro_de_la_cabana/08Ne2S4.jpg',
  '/Fotos/adentro_de_la_cabana/6gAp2.jpg',
  '/Fotos/adentro_de_la_cabana/7r0Oc.jpg',
  '/Fotos/adentro_de_la_cabana/SJrpZ.jpg',
  '/Fotos/adentro_de_la_cabana/TXd14.jpg',
  '/Fotos/adentro_de_la_cabana/nAKfa.jpg',
  '/Fotos/adentro_de_la_cabana/tlhrx.jpg'
];
const HERO_WORDS = ['RECANTO', 'DO', 'PEPE'];
const SUBTITLES  = [
  'Respirá Naturaleza.',
  'Desconecta todo el año en la frontera brasilera.',
  'Más que un alquiler, un rincón de paz.',
  'A 100 metros de la playa.',
];

/* ── COMPONENT ─────────────────────────────── */
const App = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [cursorPos,  setCursorPos]  = useState({ x: 0, y: 0 });
  const [lbImage,    setLbImage]    = useState(null);
  const [isMuted,    setIsMuted]    = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const videoRef    = useRef(null);
  const heroRef     = useRef(null);       // sección que se pina
  const wordsRef    = useRef([]);
  const subsRef     = useRef([]);
  const btnRef      = useRef(null);
  const sideRef     = useRef(null);
  const sideTextRef = useRef(null);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
  };

  /* ── cursor + scroll nav ── */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    const onMouse  = e  => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('scroll', onScroll);
    window.addEventListener('mousemove', onMouse);
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.rv').forEach(el => obs.observe(el));
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouse);
      obs.disconnect();
    };
  }, []);

  /* ── auto-unmute on interaction ── */
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('scroll', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []); // Sin dependencias para que solo corra una vez


  /* ── GSAP Hero: pin + stagger title & subtitles ── */
  useEffect(() => {
    const words = wordsRef.current.filter(Boolean);
    const subs  = subsRef.current.filter(Boolean);
    const btn   = btnRef.current;
    const sLine = sideRef.current;
    const sTxt  = sideTextRef.current;

    // Guard: si algún ref no está listo, no arrancar
    if (!heroRef.current || words.length === 0 || !sLine || !sTxt || !btn) return;

    // Estado inicial: elementos existen en DOM pero invisibles y desplazados hacia abajo
    gsap.set(words, { y: 100, opacity: 0 });
    gsap.set(subs,  { y: 50,  opacity: 0 });
    gsap.set(btn,   { y: 30,  opacity: 0 });
    gsap.set(sLine, { scaleY: 0, transformOrigin: 'top center' });
    gsap.set(sTxt,  { opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:       heroRef.current,
        pin:           true,
        anticipatePin: 1,
        start:         'top top',
        // Pin durante 4 alturas de viewport:
        // 0-20% = palabras suben | 20-50% = DWELL título visible | 50-80% = subtítulos | 80-100% = dwell final
        end:           '+=400%',
        scrub:         1.2,
      },
    });

    // 0–20% → RECANTO, DO, PEPE suben una por una
    tl.to(words, { y: 0, opacity: 1, stagger: 0.10, ease: 'power3.out', duration: 0.20 }, 0);

    // 18–35% → línea y texto vertical
    tl.to(sLine, { scaleY: 1,  ease: 'power2.inOut', duration: 0.18 }, 0.18);
    tl.to(sTxt,  { opacity: 1, ease: 'none',         duration: 0.12 }, 0.30);

    // 20–50% = DWELL — título completamente visible, sin nada nuevo (el usuario lo lee)

    // 50–78% → subtítulos suben en stagger
    tl.to(subs, { y: 0, opacity: 1, stagger: 0.10, ease: 'power3.out', duration: 0.28 }, 0.50);

    // 72–85% → botón CTA
    tl.to(btn, { y: 0, opacity: 1, ease: 'power2.out', duration: 0.14 }, 0.72);

    // 85–100% → dwell final, todo visible. NO hay fade-out:
    // el pin se libera y el contenido sube naturalmente con el scroll.

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  const openLightbox  = img => setLbImage(img);
  const closeLightbox = ()  => setLbImage(null);
  const playHoverSound = () => {
    const a = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-typewriter-soft-click-1125.mp3');
    a.volume = 0.4;
    a.play().catch(() => {});
  };

  return (
    <>
      {/* Custom cursor */}
      <div className="cursor"      style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div className="cursor-ring" style={{ left: cursorPos.x, top: cursorPos.y }} />

      {/* Lightbox */}
      <div className={`lightbox ${lbImage ? 'open' : ''}`} onClick={closeLightbox}>
        <span className="lb-close">✕</span>
        {lbImage && <img src={lbImage} alt="Lightbox" />}
      </div>

      {/* ══ VIDEO GLOBAL FIJO — permanece detrás de todo ══
          Se cubre con el canvas del scrub y los backgrounds de las secciones siguientes */}
      <video
        ref={videoRef}
        className="global-bg-video"
        src="/videos/HERO01.mp4"
        autoPlay loop muted={isMuted} playsInline
      />
      <div className="global-bg-overlay" />

      {/* Ecualizador — fixed, visible mientras el video esté activo */}
      <div className={`eq-btn ${!isMuted ? 'playing' : ''}`} onClick={toggleMute}
           title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}>
        <div className="eq-bar" /><div className="eq-bar" />
        <div className="eq-bar" /><div className="eq-bar" />
      </div>

      {/* Nav */}
      <nav className={isScrolled ? 'scrolled' : ''}>
        <div className="nav-left">TU SANTUARIO DE MADERA Y MAR</div>
        
        {/* Desktop Links */}
        <div className="nav-links">
          <a href="#about">Experiencia</a>
          <a href="#cabanas">Cabañas</a>
          <a href="#compras">Frontera</a>
          <a href="#contacto" className="nav-cta">Reservar Ahora</a>
        </div>

        {/* Mobile Toggle */}
        <button className="nav-mobile-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div className="mobile-menu"
                      initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="mm-links">
              <a href="#about" onClick={() => setIsMenuOpen(false)}>Experiencia</a>
              <a href="#cabanas" onClick={() => setIsMenuOpen(false)}>Cabañas</a>
              <a href="#compras" onClick={() => setIsMenuOpen(false)}>Frontera</a>
              <a href="#contacto" className="mm-cta" onClick={() => setIsMenuOpen(false)}>Reservar Ahora</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════
          1. HERO — sección pinada por GSAP
             Sin fondo propio: deja ver el video global
      ══════════════════════════════════════ */}
      <section ref={heroRef} className="hero" id="home">
        <div className="hero-content">
          <div className="hero-main-layout">
            <div className="hero-text-block">

              <h1 className="hero-title-stack">
                {HERO_WORDS.map((word, i) => (
                  <span key={word} className="hero-word"
                        ref={el => (wordsRef.current[i] = el)}>{word}</span>
                ))}
              </h1>

              <div className="hero-side-nav-inner">
                <div className="side-line" ref={sideRef} />
                <span className="side-text" ref={sideTextRef}>DONDE EL TIEMPO SE DETIENE</span>
              </div>

              <div className="hero-sub-text-alt">
                {SUBTITLES.map((line, i) => (
                  <p key={i} className="hero-subtitle-line"
                     ref={el => (subsRef.current[i] = el)}>{line}</p>
                ))}
              </div>

              <div className="hero-action">
                <a href="#cabanas" className="hero-btn-outline"
                   ref={btnRef} onMouseEnter={playHoverSound}>
                  EXPLORAR REFUGIO
                </a>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          2. ABOUT — sube sobre el video fijo
             Fondo semitransparente: el video se asoma detrás
      ══════════════════════════════════════ */}
      <section className="about rv" id="about">
        <div className="about-text">
          <span className="sec-label">El Lugar</span>
          <h2 className="sec-title">Más que un alquiler, <br /><em>un rincón de paz</em></h2>
          <p>Imagina despertar con el sonido de los pájaros y el mar de fondo. Caminar por tu propio sendero verde hasta la playa. Disfrutar de un asado en tu parrillero privado después de un día de sol.</p>
          <p>En <strong>Recanto do Pepe</strong>, te ofrecemos la calidez de lo rústico con todas las comodidades del mundo moderno.</p>
          <div className="stats">
            <div className="stat"><div className="stat-n">5</div><div className="stat-l">Cabañas</div></div>
            <div className="stat"><div className="stat-n">100M</div><div className="stat-l">A la playa</div></div>
            <div className="stat"><div className="stat-n">2-5</div><div className="stat-l">Personas</div></div>
          </div>
        </div>
        <div className="about-imgs">
          <div className="ai"><img src="Fotos/El_lugar_en_imagenes/pareja_playa_web.jpg"  alt="El Lugar 1" /></div>
          <div className="ai"><img src="Fotos/El_lugar_en_imagenes/pareja_playa_web2.jpg" alt="El Lugar 2" /></div>
          <div className="ai"><img src="Fotos/Nuestras_cabanas/04k57lL.jpg"               alt="El Lugar 3" /></div>
        </div>
      </section>

      <div className="solid-bg-wrapper">
        <div className="marquee">
          <div className="mq-inner">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="mq-i">
                RECANTO DO PEPE <div className="mq-dot" />
                NATURALEZA VIVA <div className="mq-dot" />
                CONCORDIA &amp; RELAX <div className="mq-dot" />
                CHUY BRASIL <div className="mq-dot" />
              </div>
            ))}
          </div>
        </div>

        <CabanasScrolly cabinImages={cabinImages} openLightbox={openLightbox} />

        {/* Gallery */}
        <section className="galeria" id="galeria">
          <div className="gal-hd rv">
            <span className="sec-label">Visuales</span>
            <h2 className="sec-title">El <em>Lugar</em> en Imágenes</h2>
          </div>
          <div className="gal-marquee">
            <div className="gm-row gm-left"><div className="gm-inner">
              {[...galleryRow1, ...galleryRow1].map((img, i) => (
                <div key={i} className="gm-item" onClick={() => openLightbox(img)}>
                  <img src={img} alt={`G1-${i}`} />
                </div>
              ))}
            </div></div>
            <div className="gm-row gm-right"><div className="gm-inner">
              {[...galleryRow2, ...galleryRow2].map((img, i) => (
                <div key={i} className="gm-item" onClick={() => openLightbox(img)}>
                  <img src={img} alt={`G2-${i}`} />
                </div>
              ))}
            </div></div>
          </div>
        </section>

        {/* Interior Carousel with GSAP Loop (Professional Grade) */}
        <section className="interior" id="interior">
          <div className="int-header rv">
            <span className="sec-label">Interiores</span>
            <h2 className="sec-title">Confort en cada <em>detalle</em></h2>
          </div>
          <div className="int-slider-outer">
            <div className="int-slider-track-gsap" ref={el => {
              if (el) {
                const items = el.querySelectorAll('.int-slide-item');
                if (items.length > 0 && !el.dataset.loopInit) {
                  el.dataset.loopInit = 'true';
                  const loop = horizontalLoop(items, { 
                    repeat: -1, 
                    speed: 2, 
                    paddingRight: 60,
                    draggable: true,
                    dragType: "x"
                  });
                  el.addEventListener('mouseenter', () => loop.pause());
                  el.addEventListener('mouseleave', () => loop.play());
                  // Draggable logic can be added here if needed, but for now focus on speed and loop
                }
              }
            }}>
              {interiorImages.map((img, i) => (
                <motion.div 
                  key={i} 
                  className="int-slide-item"
                  initial={{ filter: 'grayscale(1)', scale: 0.9 }}
                  whileInView={{ filter: 'grayscale(0)', scale: 1.1 }}
                  viewport={{ amount: 0.7 }}
                  onClick={() => openLightbox(img)}
                >
                  <img src={img} alt={`Interior ${i}`} />
                </motion.div>
              ))}
            </div>
            <div className="slider-hint dark"><span>Desliza o deja que corra solo</span><div className="sh-line" /></div>
          </div>
        </section>

        {/* Amenidades */}
        <section className="amenidades">
          <div className="amen-hd rv">
            <span className="sec-label">Comodidades Incluidas</span>
            <h2 className="sec-title">Todo lo que <em>necesitás</em></h2>
          </div>
          <div className="amen-grid">
            {[
              { icon:'📶', name:'Wi-Fi',             desc:'Conectividad garantizada en todas las cabañas' },
              { icon:'📺', name:'Televisión',         desc:'TV en cada unidad para tu entretenimiento' },
              { icon:'🔥', name:'Parrillero privado', desc:'Asado al carbón en tu propio espacio' },
              { icon:'🚿', name:'Agua caliente',      desc:'Ducha caliente en todas las cabañas' },
              { icon:'🧊', name:'Heladera & Cocina',  desc:'Equipadas para que te sientas en casa' },
              { icon:'🚗', name:'Estacionamiento',    desc:'Lugar techado propio para tu vehículo' },
              { icon:'❄️', name:'Aire acondicionado', desc:'Confort en verano e invierno' },
              { icon:'🌊', name:'Acceso privado',     desc:'Sendero propio a la playa' },
              { icon:'🛡️', name:'Seguridad 24h',     desc:'Cámaras de vigilancia para tu tranquilidad' },
            ].map((item, i) => (
              <div key={i} className="ai2 rv">
                <span className="icon">{item.icon}</span>
                <div className="name">{item.name}</div>
                <div className="desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Filosofía */}
        <section className="filosofia" id="filosofia">
          <div className="filo-header rv">
            <span className="sec-label">La Filosofía del Recanto</span>
            <h2 className="sec-title">"Nunca Pares de <em>Sonhar</em>"</h2>
          </div>
          <div className="filo-grid">
            <div className="filo-item rv"><img src="Fotos/La_filosofia_del_Recanto/3HHKS.jpg" alt="F1" /></div>
            <div className="filo-item rv"><img src="Fotos/La_filosofia_del_Recanto/AYHfb.jpg" alt="F2" /></div>
            <div className="filo-item rv"><img src="Fotos/La_filosofia_del_Recanto/BGA7R.jpg" alt="F3" /></div>
            <div className="filo-quote rv">
              <div className="fq-inner">
                <p className="fq-main">"Aqui mora a <em>Felicidade</em>."</p>
                <p className="fq-sub">Tu lugar para no hacer nada… <br />y tenerlo todo.</p>
                <span className="fq-author">— Recanto Do Pepe</span>
              </div>
            </div>
          </div>
        </section>

        {/* Compras */}
        <section className="compras" id="compras">
          <div className="cp-bg">CHUY</div>
          <div className="cp-inner">
            <div className="cp-hd rv">
              <span className="sec-label" style={{ color:'var(--ar)', opacity:0.8 }}>La ventaja que no podés dejar pasar</span>
              <h2 className="sec-title" style={{ color:'#fff' }}>La escapada que se <br /><em>paga sola</em></h2>
              <p style={{ color:'rgba(255,255,255,0.7)', maxWidth:'600px', margin:'20px auto' }}>
                Estás en la frontera más inteligente del cono sur. Dos países, dos monedas, precios increíbles.
              </p>
            </div>
            <div className="cp-cards">
              <div className="cp-card rv">
                <span className="cp-sub">BR</span>
                <div className="cp-country">CHUY BRASILERO</div>
                <div className="cp-tag-mini">SUPERCOMPRAS INTELIGENTES</div>
                <p className="cp-text">Surtite de artículos de aseo personal, limpieza, alimentos y más a precios increíbles.</p>
              </div>
              <div className="cp-card rv">
                <span className="cp-sub">UY</span>
                <div className="cp-country">FREE SHOPS URUGUAYOS</div>
                <div className="cp-tag-mini">OFERTAS SIN FRONTERAS</div>
                <p className="cp-text">Del lado uruguayo, los freeshops te esperan con precios increíbles en perfumes, electrónica y licores.</p>
              </div>
            </div>
            <div className="cp-banner rv"><p>"Si llegaste al Chuy, ya estás en casa. ¡Te esperamos!"</p></div>
          </div>
        </section>

        {/* Contacto */}
        <section className="contacto" id="contacto">
          <div className="ct-inner">
            <div className="ct-left rv">
              <span className="sec-label">Reservas &amp; Contacto</span>
              <h2 className="sec-title">Reservá tu <br /><em>rincón de paz</em></h2>
              <p>Hablá directamente con Jose. Sin intermediarios.</p>
              <div className="clinks">
                <a href="https://wa.me/59895092112" target="_blank" rel="noreferrer" className="clink clink-wa">
                  <div className="clink-icon">📱</div>
                  <div className="clink-info">
                    <div className="clink-main">WhatsApp — Reservar Ahora</div>
                    <div className="clink-sub">+598 95 092 112</div>
                  </div>
                </a>
                <a href="mailto:pepituuss@hotmail.com" className="clink clink-em">
                  <div className="clink-icon">✉️</div>
                  <div className="clink-info">
                    <div className="clink-main">Enviar Email</div>
                    <div className="clink-sub">pepituuss@hotmail.com</div>
                  </div>
                </a>
                <div className="clink clink-ad">
                  <div className="clink-icon">📍</div>
                  <div className="clink-info">
                    <div className="clink-main">Cómo llegar</div>
                    <div className="clink-sub">Atlântico, Santa Vitória do Palmar<br />Rio Grande do Sul — Brasil</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="map-wrap rv">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3352.4!2d-53.375!3d-33.745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x950e3347b715694d%3A0xc48e67a033f2832a!2sRecanto%20do%20Pepe!5e0!3m2!1sen!2suy!4v1713861234567!5m2!1sen!2suy"
                allowFullScreen="" loading="lazy" style={{ border: 0 }} />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <div className="footer-logo">
            <img src="Fotos/Nuestras_cabanas/PiPm7.jpg" alt="Footer" />
            <span>Recanto Do Pepe</span>
          </div>
          <div className="footer-text">&copy; 2026 Recanto Do Pepe. Lujo Natural en la Frontera.</div>
        </footer>

      </div>{/* /solid-bg-wrapper */}
    </>
  );
};

export default App;
