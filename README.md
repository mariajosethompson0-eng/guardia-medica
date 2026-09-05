# Sistema de Gestión - Guardia Médica

## Integrantes
* María José Thompson

## Descripción Breve
Aplicación web responsiva diseñada para la recepción, maquetación y administración de pacientes en salas de espera de guardia médica. Permite agilizar la toma de datos de ingreso y visualizar los turnos de atención.

## Tecnologías Utilizadas
* HTML5 (Estructura semántica)
* CSS3 (Flexbox, CSS Grid, Variables CSS, Responsive Design)
* Git & GitHub (Control de versiones con Git Flow)

---
---INFORMACIÓN--
### 1. ¿Dónde utilizaron Flexbox?
Se aplicó **Flexbox** en el encabezado (`header.header-principal .contenedor-header`) para alinear el título principal con el menú de navegación, y dentro de la lista de navegación (`nav.nav-principal ul`) para distribuir horizontalmente las secciones con espaciados homogéneos.

### 2. ¿Dónde utilizaron Grid?
Se utilizó **CSS Grid** en el contenedor principal (`.contenedor-principal`). En pantallas grandes, establece una maquetación en dos columnas dinámicas (`grid-template-columns: 1fr 1.8fr`) separando el formulario de ingreso de pacientes a la izquierda y la tabla de espera a la derecha.

### 3. ¿Qué variables CSS crearon?
En el bloque `:root` se crearon variables para:
* **Colores:** `--color-primario`, `--color-primario-hover`, `--color-secundario`, `--color-fondo`, `--color-tarjeta`, `--color-texto`, `--color-texto-suave` y `--color-borde`.
* **Tipografía:** `--fuente-principal`.
* **Espaciados:** `--espaciado-sm`, `--espaciado-md` y `--espaciado-lg`.
* **Sombreados y Bordes:** `--radio-borde`, `--sombra-caja` y `--sombra-hover`.

### 4. ¿Cómo implementaron el Responsive Design?
Se utilizó un enfoque *Mobile-First* combinando unidades relativas (`rem`, `%`, `vh`) con dos puntos de interrupción mediante **Media Queries**:
* `@media (min-width: 768px)`: Reorganiza el encabezado en fila y ajusta botones para tablets.
* `@media (min-width: 1024px)`: Despliega la maqueta en 2 columnas con CSS Grid para pantallas de escritorio.

---

## Estrategias de SEO Implementadas

1. **Meta Description (`<meta name="description">`):** Describe el propósito del sitio para mejorar la indexación en motores de búsqueda.
2. **Meta Viewport (`<meta name="viewport">`):** Garantiza la correcta renderización en dispositivos móviles, optimizando la experiencia mobile exigida por Google.
3. **Etiqueta Title Optimizada (`<title>`):** Incorpora palabras clave relevantes del dominio ("Guardia Médica", "Gestión", "Recepción").
4. **Estructura Semántica (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`):** Otorga jerarquía y legibilidad al código para los rastreadores (*crawlers*).
5. **Atributos de accesibilidad (`lang="es"`, etiquetas `for` y `id`):** Facilita la navegación accesible e indexación del formulario.