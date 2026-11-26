# Un capricho hecho diseño — Portafolio

Portafolio web de **Martín García**, estudiante de Diseño Gráfico en la Universidad Diego Portales (Santiago, Chile).

## Secciones

1. **Inicio**: Título tipográfico con revelación de nebulosa y campo de estrellas al hacer scroll.
2. **Sobre mí**: Presentación personal y herramientas de trabajo.
3. **Certificación de inglés**: Nivel C1 certificado con EnglishScore.
4. **Proyectos (Estrella interactiva)**: Carrusel giratorio de 5 puntas (navegable con clic lateral o flechas izquierda/derecha) que presenta:
   - *Finger Paint* (MediaPipe y OpenCV)
   - *Newen* (instalación/experiencia sonora inspirada en la creencia mapuche)
   - *La estática de la nostalgia* (experiencia táctil móvil)
   - *Boa Mistura: Colección* (proyecto editorial en PDF)
   - *Ilustraciones* (galería interactiva con intercambio de tarjetas)
5. **Contacto**: Correo, Instagram y teléfono junto a firma personal.

## Cómo verlo en local

Puedes abrir un servidor local ejecutando `iniciar_servidor.bat` o con Python desde esta carpeta:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000` en tu navegador.

## Estructura

- `index.html`: Estructura principal de las secciones del portafolio.
- `style.css`: Estilos, animaciones de nebulosa/estrellas, tipografía y diseño responsivo.
- `star-interaction.js`: Lógica de revelación inicial, observador de secciones, rotación de la estrella y cambio de ilustraciones.
- `fonts/`: Tipografía *Star Vintage*.
- `Img/`: Imágenes personales, certificados, firma y estrella SVG.
- `Things/`: Videos, PDF editorial e ilustraciones de los proyectos.
