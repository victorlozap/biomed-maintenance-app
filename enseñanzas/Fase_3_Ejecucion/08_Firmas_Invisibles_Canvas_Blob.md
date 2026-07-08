# Bug Crítico: Imágenes Invisibles en PDFs con jsPDF, Canvas y Blob URLs

## Síntoma
Las firmas PNG (o cualquier imagen dinámica) no se renderizaban en los reportes PDF generados con `jsPDF`. No arrojaba ningún error en consola, y las coordenadas de ubicación `(X, Y)` funcionaban perfectamente. La imagen simplemente parecía no estar en el archivo PDF.

## Diagnóstico y Causa Raíz

1. **La barrera temporal:**
   Inicialmente, pensábamos que el navegador bloqueaba la imagen (por CORS o CSP). Sin embargo, pruebas visuales inyectando contenedores rojos demostraron que `jsPDF` estaba intentando dibujar *algo*. Las promesas de carga (`onload`) se resolvían con éxito, lo que confirmaba que los bytes estaban llegando.

2. **El bug de "Cross-Origin Taint" y Canvas con Blob:**
   Al intentar sanitizar fondos transparentes para que jsPDF no los mostrara negros, estábamos utilizando:
   ```javascript
   const objectUrl = URL.createObjectURL(blob);
   img.src = objectUrl;
   // y luego:
   ctx.drawImage(img, 0, 0);
   ```
   En varios navegadores bajo políticas de seguridad restrictivas (o notoriamente Safari/iOS), cuando insertas un `blob:` en un `Image` y lo intentas pintar en un `Canvas`, **el navegador previene la lectura de pixeles por seguridad (Tainted Canvas)** o asume que la imagen es insegura y falla silenciosamente dibujando un cuadro completamente en blanco.

3. **El efecto cascada:**
   `canvas.toDataURL('image/jpeg', 0.95)` no explotaba. Devolvía un `base64` válido... **de un rectángulo blanco puro**.
   Luego, `jsPDF` pintaba este rectángulo blanco sobre el fondo blanco del PDF, dando la ilusión de que la imagen era "invisible".

## La Solución: FileReader + Base64 síncrono

Para evitar cualquier sospecha de violación de seguridad o *Cross-Origin Taint* en el Canvas, el mecanismo correcto es convertir directamente el `Blob` nativo en un Data URL puro en Base64 utilizando `FileReader`.

```javascript
// La forma segura y universal de cargar imágenes para PDF y Canvas:
const reader = new FileReader();
reader.onloadend = () => {
  const dataUrl = reader.result; // Data URL en Base64 nativo
  const img = new Image();
  img.onload = () => {
    // Aquí el Canvas confía 100% en la imagen porque su fuente es Base64 explícito.
    ctx.drawImage(img, 0, 0);
    // ...
  };
  img.src = dataUrl;
};
reader.readAsDataURL(blob);
```

### Por qué funciona:
* A diferencia de los `blob:` temporales, un string `data:image/png;base64,...` es interpretado de manera intrínsecamente segura y síncrona por el elemento `Canvas`.
* Permite pintar, alterar colores de fondo y regenerar imágenes sin disparar alarmas de CORS, solucionando de raíz los misterios de imágenes transparentes que desaparecen o arrojan excepciones silenciosas.
