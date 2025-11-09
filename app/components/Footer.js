import {
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFire,
} from "react-icons/fa";
import stylesFooter from "../stylesFooter/footer.module.css";

const Footer = () => {
  return (
    <footer className={stylesFooter.footer}>
      {/* Fondo decorativo */}
      <div className={stylesFooter.bgOverlay}></div>
      <div className={stylesFooter.bgBlob1}></div>
      <div className={stylesFooter.bgBlob2}></div>

      <div className={stylesFooter.container}>
        <div className={stylesFooter.grid}>
          {/* Branding y redes */}
          <div className={stylesFooter.brandSection}>
            <div className={stylesFooter.brandHeader}>
              <div className={stylesFooter.brandIcon}>
                <FaFire />
              </div>
              <h3 className={stylesFooter.brandTitle}>Pádel Premium</h3>
            </div>
            <p className={stylesFooter.brandDescription}>
              Tu tienda de confianza para equipamiento profesional de pádel.
              Calidad garantizada y envíos a todo el país.
            </p>

            {/* <div className={stylesFooter.socials}>
              {[{
                href: "https://instagram.com",
                icon: <FaInstagram />
              },{
                href: "https://facebook.com",
                icon: <FaFacebook />
              },{
                href: "https://twitter.com",
                icon: <FaTwitter />
              }].map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className={stylesFooter.socialLink}>
                  <span>{social.icon}</span>
                </a>
              ))}
            </div> */}
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className={stylesFooter.sectionTitle}>Enlaces Rápidos</h4>
            <ul className={stylesFooter.linkList}>
              {[
                { name: "Productos", href: "#productos" },
                { name: "Ofertas", href: "#ofertas" },
                { name: "Marcas", href: "#marcas" },
                { name: "Blog", href: "#blog" },
                { name: "Nosotros", href: "#nosotros" },
              ].map((link) => (
                <li key={link.name} className={stylesFooter.linkItem}>
                  <a href={link.href}>
                    <span className={stylesFooter.linkArrow}>→</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Información legal */}
          <div>
            <h4 className={stylesFooter.sectionTitle}>Información</h4>
            <ul className={stylesFooter.linkList}>
              {[
                { name: "Términos y Condiciones", href: "#terminos" },
                { name: "Política de Envíos", href: "#envios" },
                { name: "Devoluciones", href: "#devoluciones" },
                { name: "Preguntas Frecuentes", href: "#faq" },
                { name: "Métodos de Pago", href: "#pagos" },
              ].map((link) => (
                <li key={link.name} className={stylesFooter.linkItem}>
                  <a href={link.href}>
                    <span className={stylesFooter.linkArrow}>→</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className={stylesFooter.sectionTitle}>Contacto</h4>
            <ul className={stylesFooter.contactList}>
              <li className={stylesFooter.contactItem}>
                <div className={stylesFooter.contactIcon}>
                  <FaMapMarkerAlt />
                </div>
                <div className={stylesFooter.contactInfo}>
                  <p className={stylesFooter.contactTitle}>Rosario, Santa Fe</p>
                  <p className={stylesFooter.contactSubtitle}>Argentina</p>
                </div>
              </li>
              <li className={stylesFooter.contactItem}>
                <div className={stylesFooter.contactIcon}>
                  <FaPhone />
                </div>
                <a
                  href="tel:+5493462529718"
                  className={stylesFooter.contactLink}
                >
                  +54 9 3462 52-9718
                </a>
              </li>
              <li className={stylesFooter.contactItem}>
                <div className={stylesFooter.contactIcon}>
                  <FaEnvelope />
                </div>
                <a
                  href="mailto:europadelinfo@gmail.com"
                  className={stylesFooter.contactLink}
                >
                  europadelinfo@gmail.com
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            {/* <div className={stylesFooter.newsletter}>
              <label className={stylesFooter.newsletterLabel}>Suscríbete a nuestro newsletter</label>
              <div className={stylesFooter.newsletterForm}>
                <input type="email" placeholder="Tu email" className={stylesFooter.newsletterInput} />
                <button className={stylesFooter.newsletterButton}>→</button>
              </div>
            </div> */}
          </div>
        </div>

        {/* Línea divisoria */}
        <div className={stylesFooter.divider}>
          <div className={stylesFooter.dividerLine}></div>
        </div>

        {/* Footer Bottom */}
        <div className={stylesFooter.bottom}>
          <div className={stylesFooter.copyright}>
            <p className={stylesFooter.copyrightText}>
              © {new Date().getFullYear()}{" "}
              <span className={stylesFooter.copyrightBrand}>Euro Pádel</span>.
              Todos los derechos reservados.
            </p>
            <p>
              Desarrollado Por{" "}
              <a
                href="https://empatiadigital.com.ar"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#4f46e5", // color azul intenso
                  fontWeight: 600, // negrita
                  textDecoration: "none", // sin subrayado por defecto
                  cursor: "pointer", // cursor mano
                  transition: "all 0.3s ease", // transición suave
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.textDecoration = "underline")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.textDecoration = "none")
                }
              >
                Empatía Digital
              </a>
            </p>
          </div>

          <div className={stylesFooter.payments}>
            <span className={stylesFooter.paymentsLabel}>Aceptamos:</span>
            <div className={stylesFooter.paymentMethods}>
              {[
                { emoji: "💳", label: "Tarjetas" },
                { emoji: "💵", label: "Efectivo" },
                { emoji: "🏦", label: "Transferencia" },
              ].map((m, i) => (
                <div
                  key={i}
                  title={m.label}
                  className={stylesFooter.paymentMethod}
                >
                  <span>{m.emoji}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sello de confianza */}
        <div className={stylesFooter.trust}>
          <div className={stylesFooter.trustList}>
            {[
              "Envíos seguros",
              "Compra protegida",
              "Garantía oficial",
              "Atención 24/7",
            ].map((item, i) => (
              <div key={i} className={stylesFooter.trustItem}>
                <span className={stylesFooter.trustCheck}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
