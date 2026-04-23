import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [lbImage, setLbImage] = useState(null);

  // Image mappings based on local folder "Fotos"
  const heroImages = [
    'Fotos/Portada/11YVALw.jpg', 'Fotos/Portada/A2S62.jpg', 'Fotos/Portada/RFknK.jpg', 
    'Fotos/Portada/TZ4oe.jpg', 'Fotos/Portada/bo4HV.jpg', 'Fotos/Portada/image (05).jpg', 
    'Fotos/Portada/jBTqt.jpg', 'Fotos/Portada/n0fWL.jpg', 'Fotos/Portada/p64kb.jpg', 
    'Fotos/Portada/pareja_playa_web2.jpg', 'Fotos/Portada/wFyfw.jpg'
  ];

  const galleryRow1 = [
    'Fotos/El_lugar_en_imagenes/05age2.jpg', 'Fotos/El_lugar_en_imagenes/07Kfv0D.jpg', 
    'Fotos/El_lugar_en_imagenes/11YVALw.jpg', 'Fotos/El_lugar_en_imagenes/28n7S.jpg', 
    'Fotos/El_lugar_en_imagenes/4urQW03.jpg', 'Fotos/El_lugar_en_imagenes/7sH6W.jpg', 
    'Fotos/El_lugar_en_imagenes/A2S62.jpg', 'Fotos/El_lugar_en_imagenes/Brxlo.jpg', 
    'Fotos/El_lugar_en_imagenes/KFLUs.jpg', 'Fotos/El_lugar_en_imagenes/OpC5k.jpg', 
    'Fotos/El_lugar_en_imagenes/RFknK.jpg', 'Fotos/El_lugar_en_imagenes/ULr06.jpg'
  ];

  const galleryRow2 = [
    'Fotos/El_lugar_en_imagenes/WlyrJ.jpg', 'Fotos/El_lugar_en_imagenes/image (1).jpg', 
    'Fotos/El_lugar_en_imagenes/jBTqt.jpg', 'Fotos/El_lugar_en_imagenes/lDyYJ.jpg', 
    'Fotos/El_lugar_en_imagenes/p64kb.jpg', 'Fotos/El_lugar_en_imagenes/pareja_playa_web.jpg', 
    'Fotos/El_lugar_en_imagenes/pareja_playa_web2.jpg', 'Fotos/El_lugar_en_imagenes/tQL13.jpg', 
    'Fotos/El_lugar_en_imagenes/uZUY6.jpg', 'Fotos/El_lugar_en_imagenes/wFyfw.jpg', 
    'Fotos/El_lugar_en_imagenes/xQZLz.jpg', 'Fotos/El_lugar_en_imagenes/zWYY5.jpg'
  ];

  const cabinImages = [
    'Fotos/Nuestras_cabanas/02MuRc3.jpg', 'Fotos/Nuestras_cabanas/02PiPm7.jpg', 
    'Fotos/Nuestras_cabanas/04k57lL.jpg', 'Fotos/Nuestras_cabanas/06PzGgp.jpg', 
    'Fotos/Nuestras_cabanas/Bktwt.jpg', 'Fotos/Nuestras_cabanas/CW6L8.jpg', 
    'Fotos/Nuestras_cabanas/GDu6p.jpg', 'Fotos/Nuestras_cabanas/image (05).jpg', 
    'Fotos/Nuestras_cabanas/jTbMQ.jpg', 'Fotos/Nuestras_cabanas/lNHtQ.jpg', 
    'Fotos/Nuestras_cabanas/NwY2h.jpg', 'Fotos/Nuestras_cabanas/PiPm7.jpg', 
    'Fotos/Nuestras_cabanas/TZ4oe.jpg'
  ];

  const interiorImages = [
    'Fotos/adentro_de_la_cabana/04s51e0.jpg', 'Fotos/adentro_de_la_cabana/05yXj7C.jpg', 
    'Fotos/adentro_de_la_cabana/06a5P7Iz.jpg', 'Fotos/adentro_de_la_cabana/06EA1Ch.jpg', 
    'Fotos/adentro_de_la_cabana/06JYWxg.jpg', 'Fotos/adentro_de_la_cabana/06pUwaW.jpg', 
    'Fotos/adentro_de_la_cabana/08Ne2S4.jpg', 'Fotos/adentro_de_la_cabana/6gAp2.jpg', 
    'Fotos/adentro_de_la_cabana/7r0Oc.jpg', 'Fotos/adentro_de_la_cabana/nAKfa.jpg', 
    'Fotos/adentro_de_la_cabana/SJrpZ.jpg', 'Fotos/adentro_de_la_cabana/tlhrx.jpg', 
    'Fotos/adentro_de_la_cabana/TXd14.jpg'
  ];

  const posterImages = [
    'Fotos/El_ritual_del_fuego/08lGzyX.jpg',
    'Fotos/El_ritual_del_fuego/5QoGm.jpg',
    'Fotos/El_ritual_del_fuego/iQrcG.jpg'
  ];

  const playHoverSound = () => {
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-typewriter-soft-click-1125.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log("Audio play blocked", e));
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    const handleMouseMove = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    // Reveal Logic (Simple Implementation)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('on');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.rv').forEach(el => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(slideTimer);
    };
  }, []);

  const openLightbox = (img) => setLbImage(img);
  const closeLightbox = () => setLbImage(null);

  return (
    <>
      {/* Custom Cursor */}
      <div 
        className="cursor" 
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />
      <div 
        className="cursor-ring" 
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />

      {/* Lightbox */}
      <div className={`lightbox ${lbImage ? 'open' : ''}`} onClick={closeLightbox}>
        <span className="lb-close">✕</span>
        {lbImage && <img src={lbImage} alt="Lightbox" />}
      </div>

      {/* Navigation */}
      <nav className={isScrolled ? 'scrolled' : ''}>
        <div className="nav-left">
          TU SANTUARIO DE MADERA Y MAR
        </div>
        <div className="nav-links">
          <a href="#about">Experiencia</a>
          <a href="#cabanas">Cabañas</a>
          <a href="#compras">Frontera</a>
          <a href="#contacto" className="nav-cta">Reservar Ahora</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        {heroImages.map((img, index) => (
          <div key={index} className={`slide ${activeSlide === index ? 'active' : ''}`}>
            <img src={img} alt={`Slide ${index}`} />
          </div>
        ))}
        <div className="hero-overlay" />
        
        <div className="hero-content">
          <div className="hero-main-layout">
            <div className="hero-text-block">
              <h1 className="hero-mega-title-grad">
                RECANTO <br />
                DO PEPE
              </h1>
              
              <div className="hero-side-nav-inner">
                <div className="side-line" />
                <span className="side-text">DONDE EL TIEMPO SE DETIENE</span>
              </div>

              <div className="hero-sub-text-alt">
                <p>Respira Naturaleza.</p>
                <p>Desconecta todo el año en la frontera brasilera.</p>
              </div>

              <div className="hero-action">
                <a 
                  href="#cabanas" 
                  className="hero-btn-outline" 
                  onMouseEnter={playHoverSound}
                >
                  EXPLORAR REFUGIO
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-dots">
          {heroImages.map((_, i) => (
            <div 
              key={i} 
              className={`hero-dot ${activeSlide === i ? 'active' : ''}`}
              onClick={() => setActiveSlide(i)}
              onMouseEnter={playHoverSound}
            />
          ))}
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee">
        <div className="mq-inner">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="mq-i">
              RECANTO DO PEPE <div className="mq-dot" /> 
              NATURALEZA VIVA <div className="mq-dot" /> 
              CONCORDIA & RELAX <div className="mq-dot" /> 
              CHUY BRASIL <div className="mq-dot" />
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <section className="about rv" id="about">
        <div className="about-text">
          <span className="sec-label">El Lugar</span>
          <h2 className="sec-title">Más que un alquiler, <br/> <em>un rincón de paz</em></h2>
          <p>Imagina despertar con el sonido de los pájaros y el mar de fondo. Caminar por tu propio sendero verde hasta la playa. Disfrutar de un asado en tu parrillero privado después de un día de sol.</p>
          <p>En <strong>Recanto do Pepe</strong>, te ofrecemos la calidez de lo rústico con todas las comodidades del mundo moderno. Tu seguridad y bienestar son nuestra prioridad.</p>
          
          <div className="stats">
            <div className="stat">
              <div className="stat-n">5</div>
              <div className="stat-l">Cabañas</div>
            </div>
            <div className="stat">
              <div className="stat-n">100M</div>
              <div className="stat-l">A la playa</div>
            </div>
            <div className="stat">
              <div className="stat-n">2-5</div>
              <div className="stat-l">Personas</div>
            </div>
          </div>
        </div>
        <div className="about-imgs">
          <div className="ai"><img src="/Fotos/El%20lugar%20en%20imágenes/pareja_playa_web.jpg" alt="El Lugar 1" /></div>
          <div className="ai"><img src="/Fotos/El%20lugar%20en%20imágenes/pareja_playa_web2.jpg" alt="El Lugar 2" /></div>
          <div className="ai"><img src="/Fotos/Nuestras%20cabañas/04k57lL.jpg" alt="El Lugar 3" /></div>
        </div>
      </section>

      {/* Photo Divider */}
      <section className="photo-divider rv">
        <img src="/Fotos/Playa%20y%20paisaje/gTJXR.jpg" alt="Divider" />
        <div className="pd-overlay left">
          <div className="pd-text">
            <span className="tag">Experiencia</span>
            <h2>El arte de <em>vivir</em> el momento</h2>
            <p>Descubre la armonía perfecta entre el confort moderno y la belleza salvaje del litoral uruguayo-brasileño.</p>
          </div>
        </div>
      </section>

      {/* Cabins Section */}
      <section className="cabanas" id="cabanas">
        <div className="cab-hd rv">
          <span className="sec-label">Habitaciones</span>
          <h2 className="sec-title">Nuestros <em>Refugios</em></h2>
        </div>
        
        <div className="cab-slider-outer rv">
          <motion.div 
            className="cab-slider-inner"
            drag="x"
            dragConstraints={{ left: -3500, right: 0 }} // Dynamic based on items in real app, but 3500 is safe for 13 items
            whileTap={{ cursor: "grabbing" }}
          >
            {cabinImages.map((img, i) => (
              <motion.div 
                key={i} 
                className="cab-slide-item"
                onClick={() => openLightbox(img)}
                whileHover={{ scale: 0.98 }}
              >
                <img src={img} alt={`Refugio ${i}`} />
              </motion.div>
            ))}
          </motion.div>
          <div className="slider-hint">
            <span>Arrastra para explorar</span>
            <div className="sh-line" />
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="galeria" id="galeria">
        <div className="gal-hd rv">
          <span className="sec-label">Visuales</span>
          <h2 className="sec-title">El <em>Lugar</em> en Imágenes</h2>
        </div>
        
        <div className="gal-marquee">
          {/* Row 1: Left */}
          <div className="gm-row gm-left">
            <div className="gm-inner">
              {[...galleryRow1, ...galleryRow1].map((img, i) => (
                <div key={i} className="gm-item" onClick={() => openLightbox(img)}>
                  <img src={img} alt={`Gallery 1-${i}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Right */}
          <div className="gm-row gm-right">
            <div className="gm-inner">
              {[...galleryRow2, ...galleryRow2].map((img, i) => (
                <div key={i} className="gm-item" onClick={() => openLightbox(img)}>
                  <img src={img} alt={`Gallery 2-${i}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interior Tour */}
      <section className="interior" id="interior">
        <div className="int-header rv">
          <span className="sec-label">Interiores</span>
          <h2 className="sec-title">Confort en cada <em>detalle</em></h2>
        </div>
        
        <div className="int-slider-outer rv">
          <motion.div 
            className="int-slider-inner"
            drag="x"
            dragConstraints={{ left: -3500, right: 0 }}
            whileTap={{ cursor: "grabbing" }}
          >
            {interiorImages.map((img, i) => (
              <motion.div 
                key={i} 
                className="int-slide-item"
                onClick={() => openLightbox(img)}
                whileHover={{ scale: 0.98 }}
              >
                <img src={img} alt={`Interior ${i}`} />
              </motion.div>
            ))}
          </motion.div>
          <div className="slider-hint dark">
            <span>Arrastra para recorrer el interior</span>
            <div className="sh-line" />
          </div>
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
            { icon: '📶', name: 'Wi-Fi', desc: 'Conectividad garantizada en todas las cabañas' },
            { icon: '📺', name: 'Televisión', desc: 'TV en cada unidad para tu entretenimiento' },
            { icon: '🔥', name: 'Parrillero privado', desc: 'Asado al carbón en tu propio espacio' },
            { icon: '🚿', name: 'Agua caliente', desc: 'Ducha caliente en todas las cabañas' },
            { icon: '🧊', name: 'Heladera & Cocina', desc: 'Equipadas para que te sientas en casa' },
            { icon: '🚗', name: 'Estacionamiento', desc: 'Lugar techado propio para tu vehículo' },
            { icon: '❄️', name: 'Aire acondicionado', desc: 'Confort en verano e invierno' },
            { icon: '🌊', name: 'Acceso privado', desc: 'Sendero propio a la playa, solo para huéspedes' },
            { icon: '🛡️', name: 'Seguridad 24h', desc: 'Cámaras de vigilancia para tu tranquilidad' }
          ].map((item, i) => (
            <div key={i} className="ai2 rv">
              <span className="icon">{item.icon}</span>
              <div className="name">{item.name}</div>
              <div className="desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Filosofía Section */}
      <section className="filosofia" id="filosofia">
        <div className="filo-header rv">
          <span className="sec-label">La Filosofía del Recanto</span>
          <h2 className="sec-title">"Nunca Pares de <em>Sonhar</em>"</h2>
        </div>
        <div className="filo-grid">
          <div className="filo-item rv">
            <img src="Fotos/La_filosofia_del_Recanto/3HHKS.jpg" alt="Filosofía 1" />
          </div>
          <div className="filo-item rv">
            <img src="Fotos/La_filosofia_del_Recanto/AYHfb.jpg" alt="Filosofía 2" />
          </div>
          <div className="filo-item rv">
            <img src="Fotos/La_filosofia_del_Recanto/BGA7R.jpg" alt="Filosofía 3" />
          </div>
          <div className="filo-quote rv">
            <div className="fq-inner">
              <p className="fq-main">"Aqui mora a <em>Felicidade</em>."</p>
              <p className="fq-sub">Tu lugar para no hacer nada... <br/> y tenerlo todo.</p>
              <span className="fq-author">— Recanto Do Pepe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Compras Section */}
      <section className="compras" id="compras">
        <div className="cp-bg">CHUY</div>
        <div className="cp-inner">
          <div className="cp-hd rv">
            <span className="sec-label" style={{ color: 'var(--ar)', opacity: 0.8 }}>La ventaja que no podés dejar pasar</span>
            <h2 className="sec-title" style={{ color: '#fff' }}>La escapada que se <br/> <em>paga sola</em></h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '20px auto' }}>Estás en la frontera más inteligente del cono sur. Dos países, dos monedas, precios increíbles.</p>
          </div>
          <div className="cp-cards">
            <div className="cp-card rv">
              <span className="cp-sub">BR</span>
              <div className="cp-country">CHUY BRASILERO</div>
              <div className="cp-tag-mini">SUPERCOMPRAS INTELIGENTES</div>
              <p className="cp-text">Surtite de artículos de aseo personal, limpieza, alimentos y más a precios que no podrás creer. Tu bolsillo lo agradece.</p>
            </div>
            <div className="cp-card rv">
              <span className="cp-sub">UY</span>
              <div className="cp-country">FREE SHOPS URUGUAYOS</div>
              <div className="cp-tag-mini">OFERTAS SIN FRONTERAS</div>
              <p className="cp-text">Del lado uruguayo, los freeshops te esperan con precios increíbles en perfumes, electrónica y licores.</p>
            </div>
          </div>
          <div className="cp-banner rv">
            <p>"Si llegaste al Chuy, ya estás en casa. ¡Te esperamos!"</p>
          </div>
        </div>
      </section>

      {/* Contacto Section */}
      <section className="contacto" id="contacto">
        <div className="ct-inner">
          <div className="ct-left rv">
            <span className="sec-label">Reservas & Contacto</span>
            <h2 className="sec-title">Reservá tu <br/> <em>rincón de paz</em></h2>
            <p>Hablá directamente con Jose. Sin intermediarios. Contanos las fechas y para cuántos, ¡y listo!</p>
            <div className="clinks">
              <a href="https://wa.me/59895092112" target="_blank" className="clink clink-wa">
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
                  <div className="clink-sub">Atlântico, Santa Vitória do Palmar<br/>Rio Grande do Sul — CEP 96230-000<br/>Brasil (Lado brasilero de Chuy)</div>
                </div>
              </div>
            </div>
          </div>
          <div className="map-wrap rv">
             <iframe 
               src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3352.4!2d-53.375!3d-33.745!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x950e3347b715694d%3A0xc48e67a033f2832a!2sRecanto%20do%20Pepe!5e0!3m2!1sen!2suy!4v1713861234567!5m2!1sen!2suy" 
               allowFullScreen="" 
               loading="lazy"
               style={{ border: 0 }}
             ></iframe>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-logo">
          <img src="Fotos/Nuestras_cabanas/PiPm7.jpg" alt="Footer Logo" />
          <span>Recanto Do Pepe</span>
        </div>
        <div className="footer-text">
          &copy; 2026 Recanto Do Pepe. Lujo Natural en la Frontera.
        </div>
      </footer>
    </>
  );
};

export default App;
