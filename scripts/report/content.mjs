/**
 * Contenido del reporte de desarrollo.
 *
 * Este archivo es la única fuente de texto del PDF. `capture.mjs` recorre
 * `SCREENS` para sacar una captura por cada estado (el `id` define el nombre
 * del archivo) y `build.mjs` arma el documento con estas mismas descripciones,
 * así el reporte no puede quedar desalineado con las imágenes.
 */

export const REPORT = {
  title: "CataSoft — Reporte de desarrollo",
  subtitle: "Rediseño de la interfaz, editor de texto enriquecido y automatización de releases",

  /** Portada. La versión y el commit los completa build.mjs al generar. */
  cover: {
    product: "CataSoft",
    tagline: "Historias clínicas para consultorio",
    documentTitle: "Reporte de desarrollo",
    logo: "public/icon.png",
    stack: [
      "Electron 30 · el proceso principal es el único que accede a la base",
      "React 18 + TypeScript · la interfaz habla por IPC, nunca con Prisma",
      "Prisma + SQLite · base local, sin servidor",
      "Tailwind CSS · paleta derivada del ícono de la aplicación",
      "Lexical · editor de texto enriquecido en los campos clínicos",
    ],
  },

  /**
   * Resumen de cambios de esta iteración, de mayor a menor impacto. Es el
   * changelog que va en la portada.
   */
  changelog: [
    {
      tag: "Corrección",
      text: `Se arregló que la aplicación no arrancara: las versiones 2.0.0 y
        2.0.1 quedaban inutilizables por una dependencia publicada solo como
        módulo ES.`,
    },
    {
      tag: "Rediseño",
      text: `Interfaz nueva sobre una paleta medida del ícono de la
        aplicación, en tema claro, con barra lateral de acciones a todo el alto
        y ficha del paciente dividida en Resumen y Registros.`,
    },
    {
      tag: "Nuevo",
      text: `Editor de texto enriquecido con barra de formato en todos los
        campos clínicos de texto libre, sin migración de datos.`,
    },
    {
      tag: "Nuevo",
      text: `Las interconsultas ahora tienen estado: pendiente o respondida. El
        Resumen muestra un panel de items abiertos con las que esperan
        respuesta y se marcan como recibidas desde ahí. Las interconsultas ya
        cargadas quedan como pendientes.`,
    },
    {
      tag: "Nuevo",
      text: `Pantalla de Resumen con indicadores de última visita, peso e IMC,
        líneas de tendencia, antecedentes y medicación editables en el lugar, y
        novedades consultables.`,
    },
    {
      tag: "Nuevo",
      text: `Los datos del paciente se editan en un diálogo; la edad y el IMC
        pasaron a ser valores derivados y de solo lectura.`,
    },
    {
      tag: "Nuevo",
      text: `La copia de seguridad en ZIP se movió del encabezado a
        Configuración, y se agregó una prueba que abre el archivo generado.`,
    },
    {
      tag: "Mejora",
      text: `Los diálogos se rediseñaron sobre un espaciado medido: abren en su
        tamaño final, sin el salto que producían al abrirse.`,
    },
    {
      tag: "Mejora",
      text: `Releases automáticas: cada push a la rama de desarrollo publica
        instaladores para Windows, macOS y Linux.`,
    },
    {
      tag: "Limpieza",
      text: `Se eliminaron unas 1400 líneas de CSS escrito a mano y los
        archivos sueltos del directorio raíz.`,
    },
  ],

  intro: [
    `CataSoft es la aplicación de escritorio de historias clínicas de un
     consultorio. Corre sobre Electron: el proceso principal es el único que
     habla con la base de datos SQLite a través de Prisma, y la interfaz en
     React se comunica con él por canales IPC. Nunca hay un servidor de por
     medio y los datos no salen de la máquina.`,
    `Este reporte documenta el trabajo de rediseño realizado sobre la
     aplicación: cada pantalla y cada diálogo con su captura, las decisiones de
     diseño que se tomaron y por qué, los errores que se encontraron y
     corrigieron en el camino, y lo que queda pendiente.`,
    `El documento se regenera con <code>npm run report</code>. Las capturas no
     son manuales: un script recorre la aplicación real y las saca una por una,
     de modo que el reporte siempre refleja el estado del código.`,
  ],

  /*
   * Cada entrada produce `captures/<id>.png`. `steps` describe, en prosa, el
   * estado que hay que alcanzar; la implementación vive en capture.mjs.
   */
  sections: [
    {
      title: "1. Listado de pacientes",
      body: `La pantalla de entrada. Antes tenía dos barras apiladas — una con el
        buscador centrado por posicionamiento absoluto y otra con la tabla — y el
        contador de pacientes flotaba arriba. Ahora hay una sola fila de
        encabezado: marca, buscador ocupando todo el ancho disponible y la acción
        primaria a la derecha. La tabla ocupa el alto restante y desplaza su
        propio contenido; el contador pasó al pie, donde pertenece, y refleja el
        filtro aplicado, no el total.`,
      screens: ["home", "home-busqueda", "home-configuracion", "home-nuevo-paciente"],
    },
    {
      title: "2. Ficha del paciente — Resumen",
      body: `El espacio de trabajo de un paciente. La barra lateral izquierda
        ocupa todo el alto y concentra las acciones: volver al listado arriba,
        después un botón por tipo de registro clínico, el resumen imprimible y,
        abajo, eliminar. Cada tipo tiene su propio color, el mismo que usa su
        etiqueta en la tabla de registros, para que la barra y la tabla enseñen
        un solo lenguaje visual.`,
      screens: ["paciente-resumen", "paciente-resumen-rail"],
    },
    {
      title: "3. Ficha del paciente — Registros",
      body: `Una sola tabla cronológica con todos los tipos de registro
        mezclados, que es lo que la aplicación ya devolvía por IPC. Arriba, en
        una única fila: el buscador a la izquierda y los filtros por tipo a la
        derecha, cada uno con su cantidad. La columna Fecha ordena de más
        reciente a más antiguo y viceversa. Solo la tabla desplaza: el
        encabezado y los filtros quedan fijos.`,
      screens: ["paciente-registros", "paciente-registros-filtro"],
    },
    {
      title: "4. Datos del paciente",
      body: `Los datos demográficos ya no se editan en una franja dentro de la
        pantalla: se editan en un diálogo. La edad no es un campo, se deriva de
        la fecha de nacimiento, porque la base de datos no tiene columna de edad
        y los dos valores podían contradecirse. Nombre y documento son
        obligatorios y el documento es único, así que un DNI repetido se detecta
        en el formulario en lugar de fallar contra la base de datos.`,
      screens: ["dialogo-editar-paciente"],
    },
    {
      title: "5. Registros clínicos",
      body: `Un diálogo por tipo de registro, todos con la misma estructura:
        encabezado, cuerpo y pie con el mismo ritmo de espaciado; los campos
        cortos arriba y los textos largos agrupados en pestañas. Las pestañas ya
        existían en la aplicación y se conservaron, junto con el
        comportamiento del cursor: al abrir el diálogo y al cambiar de pestaña,
        el cursor entra en el primer campo de ese panel, al final del texto que
        ya haya.`,
      screens: [
        "dialogo-evolucion",
        "dialogo-antropometria",
        "dialogo-interconsulta",
        "dialogo-internacion",
        "dialogo-archivo",
      ],
    },
    {
      title: "6. Editor de texto enriquecido",
      body: `Los campos de texto libre dejaron de ser áreas de texto planas y
        pasaron a un editor Lexical con barra de formato: negrita, cursiva,
        subrayado, listas con viñetas y numeradas, y deshacer/rehacer. El texto
        se guarda como HTML en las mismas columnas de siempre, sin migración: lo
        escrito antes no tiene etiquetas y se sigue leyendo igual.`,
      screens: ["editor-formato", "dialogo-antecedentes"],
    },
    {
      title: "7. Resumen de historia clínica",
      body: `El documento imprimible. Es el único lugar donde el texto del
        paciente se emite como HTML y no escapado, para que el formato llegue al
        papel; pasa siempre por la lista blanca de etiquetas. Nombres, fechas y
        números siguen escapándose como antes. La hoja se mantiene en escala de
        grises a propósito: el color cuesta tinta, fotocopia mal y no aporta
        información clínica.`,
      screens: ["dialogo-historia-clinica"],
    },
  ],

  decisions: [
    {
      title: "Paleta tomada del ícono de la aplicación",
      body: `El ícono es un riñón: cuerpo rosa, vasos en turquesa y hojas
        verdes. En lugar de elegir colores a ojo, se decodificaron los píxeles
        del archivo y se midieron las tres familias dominantes. De ahí salieron
        tres escalas de color fijadas al tono medido — <code>brand</code> (rosa,
        tono 335), <code>vessel</code> (turquesa, 175) y <code>leaf</code>
        (verde, 92) — más los neutros. El rosa es acento: botones primarios,
        pestaña activa, foco. Nunca fondo detrás de texto clínico.`,
    },
    {
      title: "Un solo dueño para el espaciado",
      body: `Los diálogos tenían el relleno declarado dos veces: el cuerpo del
        diálogo aportaba 20&nbsp;px y además cada formulario ponía los suyos. En
        un diálogo de 320&nbsp;px eso dejaba 246&nbsp;px útiles, y era la causa
        real de que los formularios se vieran apretados y desbalanceados. Ahora
        el relleno lo pone el cuerpo del diálogo y nada más.`,
    },
    {
      title: "El alto lo define el contenido; el área de trabajo, no",
      body: `Todos los diálogos con pestañas medían 702&nbsp;px de alto,
        estuvieran vacíos o llenos, porque el contenido fijaba una altura en
        unidades de pantalla. Ahora el diálogo se ajusta a su contenido, pero el
        área de escritura se mantiene estable entre pestañas, de modo que
        cambiar de pestaña no redimensiona la ventana.`,
    },
    {
      title: "Nada de CSS escrito a mano",
      body: `Se eliminaron unas 1400 líneas de CSS: las cinco hojas de estilo
        que reskineaban la aplicación y las reglas con
        <code>!important</code> que forzaban un calendario oscuro. Todo se
        expresa con utilidades de Tailwind, y la paleta vive en un único archivo
        de configuración.`,
    },
    {
      title: "Los valores derivados no se escriben",
      body: `El IMC se calcula a partir del peso y la talla, se redondea a un
        decimal y se muestra como campo de solo lectura. Antes era un campo
        editable, así que podía contradecir a los valores de los que depende. La
        edad recibió el mismo tratamiento.`,
    },
  ],

  fixes: [
    {
      title: "La aplicación no arrancaba en las versiones 2.0.0 y 2.0.1",
      body: `<code>archiver</code> 8 se publica solo como módulo ES, y el
        proceso principal se empaqueta como CommonJS: al cargarlo lanzaba
        <code>ERR_REQUIRE_ESM</code> y la aplicación no abría. La integración
        continua pasaba en verde porque ninguna prueba ejercitaba ese camino.
        Se fijó <code>archiver</code> 7 y se agregó una prueba que abre el ZIP
        generado, para que esa clase de error falle en las pruebas y no en una
        release.`,
    },
    {
      title: "Los diálogos abrían chicos y saltaban",
      body: `Las pestañas se registraban desde un efecto, con un retardo de
        100&nbsp;ms. Hasta que ese temporizador se cumplía ninguna pestaña
        estaba activa, así que el diálogo se dibujaba vacío y después saltaba a
        su tamaño real. Ahora los nombres de las pestañas se leen durante el
        renderizado y el diálogo aparece directamente en su medida final.`,
    },
    {
      title: "El cursor no entraba en el editor",
      body: `El ayudante que enfoca el primer campo buscaba
        <code>input</code>, <code>textarea</code> y <code>select</code>. Al
        reemplazar las áreas de texto por el editor enriquecido, el enfoque al
        abrir y al cambiar de pestaña dejó de funcionar en silencio. Se agregó
        <code>contenteditable</code> a la búsqueda y el cursor se coloca al
        final del texto existente, nunca seleccionándolo todo.`,
    },
    {
      title: "Fechas corridas un día",
      body: `Las fechas viajaban a la interfaz convertidas a UTC, así que en un
        huso negativo un paciente nacido el 17 aparecía como 16. La conversión
        pasó a usar componentes de calendario locales en las dos direcciones.`,
    },
    {
      title: "Botones que no hacían nada",
      body: `El botón de la barra lateral declaraba un manejador de clic que
        nunca se conectaba; funcionaba solo porque cada botón venía envuelto en
        un disparador de diálogo. El botón de agregar de las tarjetas de peso e
        IMC detenía la propagación del evento y con eso impedía que el diálogo
        se abriera. Ambos quedaron conectados.`,
    },
    {
      title: "Encabezados de tabla desalineados",
      body: `Las celdas de encabezado se renderizaban como celdas de cuerpo
        porque no se declaraba el tipo, y además <code>th</code> centra el texto
        por omisión mientras <code>td</code> lo alinea a la izquierda. Los
        títulos quedaban corridos respecto de su columna.`,
    },
    {
      title: "El menú contextual aparecía solo",
      body: `Las etiquetas de la barra lateral usaban un componente que se
        abre también al recibir el foco, por accesibilidad. Al cerrar un
        diálogo el foco volvía al botón que lo había abierto y la etiqueta
        aparecía sin que nadie pasara el mouse. Se reemplazó por una etiqueta
        que solo responde al mouse.`,
    },
  ],

  security: [
    `El texto clínico ahora se guarda con formato, así que el módulo que lo
     procesa es un límite de seguridad y no una preferencia estética. Toda la
     entrada y toda la salida pasan por una lista blanca cerrada de etiquetas
     — párrafos, saltos, negrita, cursiva, subrayado, tachado y listas — sin
     ningún atributo. Eso descarta por construcción <code>&lt;script&gt;</code>,
     los manejadores de eventos, las URL <code>javascript:</code> y los estilos
     en línea.`,
    `El archivo tiene 15 pruebas, incluidos los casos de inyección, y está
     incluido en el umbral de cobertura junto al proceso principal. La vista
     previa de impresión además se muestra en un marco aislado sin permiso de
     ejecución de scripts.`,
    `La aplicación no tiene usuarios ni contraseñas ni registro de auditoría, y
     la base SQLite no está cifrada: cualquiera con acceso a la máquina tiene
     acceso a las historias. Eso no cambió y conviene tenerlo presente.`,
  ],

  pending: [
    `<strong>Sin cifrado ni usuarios.</strong> Sigue siendo el punto abierto más
     importante y no es un descuido de esta iteración: la base no está cifrada y
     la aplicación no distingue quién la usa. Resolverlo es un trabajo en sí
     mismo, con su propia migración y su propia decisión sobre dónde vive la
     clave.`,
    `<strong>Cobertura de la interfaz.</strong> Por decisión del proyecto la
     interfaz no se prueba de forma unitaria. Lo que sí quedó automatizado es
     <code>npm run test:ui</code>: levanta la aplicación real y la recorre por
     las diecisiete pantallas de este reporte, y falla si alguna deja de
     dibujarse. La cobertura numérica sigue midiendo el proceso principal.`,
  ],

  releases: [
    `Cada push a la rama de desarrollo compila las tres plataformas y publica
     una release en GitHub con los instaladores y los archivos que necesita el
     actualizador automático. La versión de <code>package.json</code> fija el
     piso mayor.menor: si coincide con la última etiqueta publicada, la
     integración continua incrementa el parche; para cortar una versión menor o
     mayor se sube ese número. Los pull requests compilan las tres plataformas
     pero no publican nada.`,
  ],
};

/** Estados que el script de capturas debe producir, en orden de aparición. */
export const SCREENS = [
  { id: "home", caption: "Listado de pacientes" },
  { id: "home-busqueda", caption: "Listado filtrado por búsqueda" },
  { id: "home-configuracion", caption: "Configuración, con la copia de seguridad" },
  { id: "home-nuevo-paciente", caption: "Alta de un paciente nuevo" },
  { id: "paciente-resumen", caption: "Ficha del paciente — Resumen" },
  { id: "paciente-resumen-rail", caption: "Barra de acciones, etiqueta al pasar el mouse" },
  { id: "paciente-registros", caption: "Ficha del paciente — Registros" },
  { id: "paciente-registros-filtro", caption: "Registros filtrados por tipo" },
  { id: "dialogo-editar-paciente", caption: "Editar datos del paciente" },
  { id: "dialogo-evolucion", caption: "Nueva evolución, con pestañas" },
  { id: "dialogo-antropometria", caption: "Nueva antropometría, IMC derivado" },
  { id: "dialogo-interconsulta", caption: "Nueva interconsulta" },
  { id: "dialogo-internacion", caption: "Nueva internación" },
  { id: "dialogo-archivo", caption: "Adjuntar archivo" },
  { id: "editor-formato", caption: "Editor enriquecido con formato aplicado" },
  { id: "dialogo-antecedentes", caption: "Editar antecedentes" },
  { id: "dialogo-historia-clinica", caption: "Resumen de historia clínica para imprimir" },
];
