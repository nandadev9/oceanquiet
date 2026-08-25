import type { Locale } from "@/i18n/translations";

type FaqItem = {
  question: string;
  answer: string;
};

type PolicySection = {
  title: string;
  paragraphs: string[];
};

export type HelpCopy = {
  title: string;
  description: string;
  faq: {
    eyebrow: string;
    title: string;
    description: string;
    items: FaqItem[];
  };
  privacy: {
    eyebrow: string;
    title: string;
    summary: string;
    updated: string;
    readFullPolicy: string;
    sections: PolicySection[];
    sourcesLabel: string;
    lgpdLaw: string;
    serproGuide: string;
  };
  support: {
    eyebrow: string;
    title: string;
    description: string;
    name: string;
    email: string;
    category: string;
    categoryOptions: string[];
    subject: string;
    message: string;
    submit: string;
    notice: string;
    prepared: string;
  };
  backToHelp: string;
  currentPrototype: string;
};

export const HELP_CONTENT: Record<Locale, HelpCopy> = {
  "pt-BR": {
    title: "Central de ajuda",
    description: "Respostas diretas sobre o OceanQuiet, privacidade e o canal de suporte.",
    faq: {
      eyebrow: "Perguntas frequentes",
      title: "O essencial, sem complicar",
      description: "Se algo ainda não estiver claro, o formulário de suporte abaixo já deixa o caminho preparado.",
      items: [
        {
          question: "Onde ficam meus dados nesta versão?",
          answer:
            "Nesta versão de protótipo, contas, tarefas, páginas do diário, preferências e foto de perfil ficam no armazenamento local do navegador deste dispositivo. Eles não são enviados a um banco de dados do OceanQuiet ainda.",
        },
        {
          question: "Como a localização é usada no clima?",
          answer:
            "A localização só é solicitada pelo navegador para mostrar o clima e o nome aproximado do local. Se você negar a permissão, o restante do OceanQuiet continua funcionando. A consulta de clima usa serviços externos indicados na política.",
        },
        {
          question: "O check-in é uma avaliação clínica?",
          answer:
            "Não. As perguntas organizam sinais que você escolhe registrar para apoiar autorreflexão e padrões pessoais. Elas não dão diagnóstico, não substituem cuidado profissional e não são uma ferramenta de emergência.",
        },
        {
          question: "Como removo informações do protótipo?",
          answer:
            "Você pode apagar itens pela lixeira do app e, se quiser remover todos os registros locais, limpar os dados do site nas configurações do navegador. Quando houver uma conta em nuvem, o app terá controles próprios de exportação e exclusão.",
        },
        {
          question: "O que muda quando existir backend?",
          answer:
            "Antes de ativar Supabase e sincronização, a política será atualizada com responsáveis, retenção, bases legais, subprocessadores, canal do encarregado e os controles de exportação/exclusão aplicáveis.",
        },
      ],
    },
    privacy: {
      eyebrow: "Privacidade e LGPD",
      title: "Uma política clara para a versão atual",
      summary:
        "O OceanQuiet foi desenhado para reduzir a exposição de dados: nesta fase, o conteúdo pessoal permanece no navegador. A política deixa explícito o que já funciona e o que só será ativado no futuro.",
      updated: "Atualizada em 25 de agosto de 2026 · versão de protótipo",
      readFullPolicy: "Ler política completa",
      sections: [
        {
          title: "1. Escopo desta política",
          paragraphs: [
            "Esta política descreve o tratamento de dados no protótipo atual do OceanQuiet. Ela foi estruturada para ser clara, específica e atualizável antes do lançamento público ou da ativação de qualquer banco de dados remoto.",
            "O OceanQuiet é um espaço de organização pessoal, foco e registro voluntário de bem-estar. Ele não presta atendimento médico, psicológico ou de emergência.",
          ],
        },
        {
          title: "2. Dados que podem existir no dispositivo",
          paragraphs: [
            "O app pode manter localmente nome, e-mail e sessão de demonstração; tarefas, eventos, categorias, páginas do diário, respostas de check-in, tempo de foco, idioma, tema e foto de perfil escolhida pela pessoa usuária.",
            "A foto é convertida e recortada no próprio navegador antes de ser guardada localmente. O conteúdo do diário e as respostas de check-in merecem atenção especial por poderem revelar aspectos íntimos de bem-estar.",
          ],
        },
        {
          title: "3. Armazenamento e compartilhamento na fase atual",
          paragraphs: [
            "No protótipo atual, os dados listados acima são mantidos no armazenamento local do navegador. O OceanQuiet ainda não usa Supabase, não mantém banco de dados próprio em nuvem e não oferece sincronização entre dispositivos.",
            "Por isso, limpar os dados do site, usar outro navegador ou trocar de dispositivo pode remover ou separar essas informações. O app não consegue recuperar esse conteúdo nesta fase.",
          ],
        },
        {
          title: "4. Localização e serviços de clima",
          paragraphs: [
            "Quando você autoriza a localização no navegador, latitude e longitude são usadas para consultar previsão no Open-Meteo e obter um nome aproximado do local por geocodificação reversa no BigDataCloud. A permissão pode ser revogada nas configurações do navegador a qualquer momento.",
            "Não use a localização como dado necessário para registrar diário, tarefas, foco ou check-in. Se a permissão não for concedida, o card de clima apenas não será preenchido automaticamente.",
          ],
        },
        {
          title: "5. Seus controles e direitos",
          paragraphs: [
            "A LGPD prevê, entre outros, confirmação de tratamento, acesso, correção, anonimização, bloqueio, eliminação, portabilidade e informação sobre compartilhamentos, conforme aplicável. Nesta fase local, os principais controles são editar ou apagar conteúdo no app e limpar os dados do site no navegador.",
            "Antes do lançamento com dados em nuvem, o OceanQuiet publicará um canal de privacidade/encarregado, prazos de resposta e procedimentos para exercer direitos de forma verificável.",
          ],
        },
        {
          title: "6. Mudanças e contato",
          paragraphs: [
            "Esta é uma política de trabalho para o protótipo. Ela será revisada antes de qualquer coleta remota, integração com Supabase, ativação de pagamentos ou disponibilização pública. A data e o resumo da mudança ficarão visíveis nesta página.",
            "O formulário de suporte da Central de ajuda ainda é uma interface de preparação e não transmite mensagens. O canal de atendimento e de privacidade será configurado antes do lançamento.",
          ],
        },
      ],
      sourcesLabel: "Referências de orientação",
      lgpdLaw: "Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)",
      serproGuide: "Guia do Serpro para elaboração de política de privacidade aderente à LGPD",
    },
    support: {
      eyebrow: "Suporte",
      title: "Deixe o contexto pronto",
      description:
        "O formulário está desenhado para receber suporte no futuro. Nesta etapa, ele não envia mensagens nem guarda o texto fora desta tela.",
      name: "Seu nome",
      email: "Seu e-mail",
      category: "Assunto",
      categoryOptions: ["Escolha uma categoria", "Conta e perfil", "Rotina, tarefas ou foco", "Diário e check-in", "Privacidade", "Outro"],
      subject: "Resumo do que aconteceu",
      message: "Conte um pouco mais",
      submit: "Preparar mensagem",
      notice: "O envio será conectado posteriormente. Não inclua informações urgentes ou sensíveis neste formulário de protótipo.",
      prepared: "A interface está pronta para integração; nenhuma mensagem foi transmitida.",
    },
    backToHelp: "Voltar para a Central de ajuda",
    currentPrototype: "Versão atual do protótipo",
  },
  en: {
    title: "Help center",
    description: "Straightforward answers about OceanQuiet, privacy and the future support channel.",
    faq: {
      eyebrow: "Frequently asked questions",
      title: "The essentials, without the clutter",
      description: "If anything is still unclear, the support form below already prepares the path.",
      items: [
        {
          question: "Where does my data live in this version?",
          answer:
            "In this prototype, accounts, tasks, journal pages, preferences and the profile photo are stored in this browser on this device. They are not sent to an OceanQuiet database yet.",
        },
        {
          question: "How is my location used for weather?",
          answer:
            "The browser asks for location only to show weather and an approximate place name. If you decline it, the rest of OceanQuiet still works. The weather lookup uses the external services listed in the policy.",
        },
        {
          question: "Is the check-in a clinical assessment?",
          answer:
            "No. Its questions organise signs you choose to record to support self-reflection and personal patterns. They do not diagnose, replace professional care or serve as an emergency tool.",
        },
        {
          question: "How can I remove prototype information?",
          answer:
            "You can delete items through the in-app trash and, if you want to remove all local records, clear this site's data in your browser settings. A cloud account will later have dedicated export and deletion controls.",
        },
        {
          question: "What changes when there is a backend?",
          answer:
            "Before enabling Supabase and sync, the policy will be updated with controllers, retention, legal bases, subprocessors, a privacy contact and applicable export/deletion controls.",
        },
      ],
    },
    privacy: {
      eyebrow: "Privacy and LGPD",
      title: "A clear policy for the current version",
      summary:
        "OceanQuiet is designed to reduce data exposure: at this stage, personal content stays in the browser. The policy makes clear what is already active and what will only be enabled later.",
      updated: "Updated 25 August 2026 · prototype version",
      readFullPolicy: "Read the full policy",
      sections: [
        { title: "1. Scope of this policy", paragraphs: ["This policy describes data handling in the current OceanQuiet prototype. It is written to be clear, specific and easy to update before public release or activation of any remote database.", "OceanQuiet is a personal space for organisation, focus and voluntary wellbeing notes. It does not provide medical, psychological or emergency care."] },
        { title: "2. Data that may exist on the device", paragraphs: ["The app may keep a name, email and demo session locally; tasks, events, categories, journal pages, check-in answers, focus time, language, theme and the selected profile photo.", "The photo is converted and cropped in the browser before local storage. Journal content and check-in responses deserve special attention because they can reveal intimate wellbeing information."] },
        { title: "3. Storage and sharing at the current stage", paragraphs: ["In the current prototype, the information above is kept in browser local storage. OceanQuiet does not yet use Supabase, operate its own cloud database or provide cross-device sync.", "Clearing site data, changing browser or changing device can therefore remove or separate these records. OceanQuiet cannot recover this content at this stage."] },
        { title: "4. Location and weather services", paragraphs: ["When you allow browser location, latitude and longitude are used to request weather from Open-Meteo and an approximate place name through BigDataCloud reverse geocoding. You can revoke permission in browser settings at any time.", "Location is not required to use the journal, tasks, focus or check-in. If permission is not granted, only the weather card will not fill automatically."] },
        { title: "5. Your controls and rights", paragraphs: ["Brazil's LGPD provides, among other rights, confirmation of processing, access, correction, anonymisation, blocking, deletion, portability and information about sharing, where applicable. In this local phase, the main controls are editing or deleting content in the app and clearing site data in the browser.", "Before a cloud launch, OceanQuiet will publish a privacy contact, response timeframes and verifiable procedures for exercising rights."] },
        { title: "6. Changes and contact", paragraphs: ["This is a working policy for the prototype. It will be reviewed before remote collection, Supabase integration, payments or public availability. This page will show the date and a summary of each change.", "The Help Center support form is still a preparation interface and does not transmit messages. A support and privacy channel will be configured before launch."] },
      ],
      sourcesLabel: "Guidance references",
      lgpdLaw: "Brazilian General Data Protection Law (Law No. 13,709/2018)",
      serproGuide: "Serpro guide to building an LGPD-aligned privacy policy",
    },
    support: {
      eyebrow: "Support",
      title: "Get the context ready",
      description: "The form is designed for future support. At this stage it does not send messages or keep text outside this screen.",
      name: "Your name",
      email: "Your email",
      category: "Topic",
      categoryOptions: ["Choose a category", "Account and profile", "Routine, tasks or focus", "Journal and check-in", "Privacy", "Other"],
      subject: "A quick summary",
      message: "Tell us a little more",
      submit: "Prepare message",
      notice: "Sending will be connected later. Do not include urgent or sensitive information in this prototype form.",
      prepared: "The interface is ready for integration; no message was transmitted.",
    },
    backToHelp: "Back to Help center",
    currentPrototype: "Current prototype version",
  },
  es: {
    title: "Centro de ayuda",
    description: "Respuestas directas sobre OceanQuiet, privacidad y el futuro canal de soporte.",
    faq: {
      eyebrow: "Preguntas frecuentes",
      title: "Lo esencial, sin complicaciones",
      description: "Si algo aún no está claro, el formulario de soporte de abajo deja el camino preparado.",
      items: [
        { question: "¿Dónde quedan mis datos en esta versión?", answer: "En este prototipo, cuentas, tareas, páginas del diario, preferencias y la foto de perfil se guardan en este navegador y dispositivo. Todavía no se envían a una base de datos de OceanQuiet." },
        { question: "¿Cómo se usa mi ubicación para el clima?", answer: "El navegador solicita la ubicación solo para mostrar el clima y un nombre aproximado del lugar. Si la rechazas, el resto de OceanQuiet sigue funcionando. La consulta usa los servicios externos indicados en la política." },
        { question: "¿El check-in es una evaluación clínica?", answer: "No. Sus preguntas organizan señales que eliges registrar para apoyar la autorreflexión y los patrones personales. No diagnostican, no sustituyen atención profesional ni son una herramienta de emergencia." },
        { question: "¿Cómo elimino información del prototipo?", answer: "Puedes eliminar elementos desde la papelera de la app y, si quieres borrar todos los registros locales, limpiar los datos del sitio en la configuración del navegador. Una cuenta en la nube tendrá controles propios de exportación y eliminación." },
        { question: "¿Qué cambiará cuando exista backend?", answer: "Antes de activar Supabase y la sincronización, la política se actualizará con responsables, retención, bases legales, subprocesadores, contacto de privacidad y los controles aplicables de exportación y eliminación." },
      ],
    },
    privacy: {
      eyebrow: "Privacidad y LGPD",
      title: "Una política clara para la versión actual",
      summary: "OceanQuiet está diseñado para reducir la exposición de datos: en esta etapa, el contenido personal permanece en el navegador. La política aclara qué ya está activo y qué solo se habilitará más adelante.",
      updated: "Actualizada el 25 de agosto de 2026 · versión de prototipo",
      readFullPolicy: "Leer la política completa",
      sections: [
        { title: "1. Alcance de esta política", paragraphs: ["Esta política describe el tratamiento de datos en el prototipo actual de OceanQuiet. Está escrita para ser clara, específica y actualizable antes del lanzamiento público o de activar una base de datos remota.", "OceanQuiet es un espacio personal para organización, enfoque y registros voluntarios de bienestar. No presta atención médica, psicológica ni de emergencia."] },
        { title: "2. Datos que pueden existir en el dispositivo", paragraphs: ["La app puede guardar localmente nombre, correo y sesión de demostración; tareas, eventos, categorías, páginas del diario, respuestas de check-in, tiempo de enfoque, idioma, tema y foto de perfil elegida.", "La foto se convierte y recorta en el navegador antes de guardarse localmente. El contenido del diario y las respuestas de check-in merecen especial atención porque pueden revelar información íntima de bienestar."] },
        { title: "3. Almacenamiento y compartición en la fase actual", paragraphs: ["En el prototipo actual, la información anterior se mantiene en el almacenamiento local del navegador. OceanQuiet todavía no usa Supabase, no opera una base de datos propia en la nube ni ofrece sincronización entre dispositivos.", "Por eso, limpiar los datos del sitio, usar otro navegador o cambiar de dispositivo puede eliminar o separar estos registros. OceanQuiet no puede recuperar este contenido en esta fase."] },
        { title: "4. Ubicación y servicios meteorológicos", paragraphs: ["Cuando autorizas la ubicación en el navegador, latitud y longitud se usan para consultar el clima en Open-Meteo y obtener un nombre aproximado del lugar mediante geocodificación inversa en BigDataCloud. Puedes revocar el permiso en cualquier momento.", "La ubicación no es necesaria para usar el diario, las tareas, el enfoque o el check-in. Si no se concede el permiso, solo la tarjeta del clima no se completará automáticamente."] },
        { title: "5. Tus controles y derechos", paragraphs: ["La LGPD brasileña prevé, entre otros, confirmación del tratamiento, acceso, corrección, anonimización, bloqueo, eliminación, portabilidad e información sobre compartición, cuando corresponda. En esta fase local, los controles principales son editar o eliminar contenido y limpiar los datos del sitio en el navegador.", "Antes de un lanzamiento en la nube, OceanQuiet publicará un contacto de privacidad, plazos de respuesta y procedimientos verificables para ejercer derechos."] },
        { title: "6. Cambios y contacto", paragraphs: ["Esta es una política de trabajo para el prototipo. Se revisará antes de cualquier recopilación remota, integración con Supabase, pagos o disponibilidad pública. Esta página mostrará la fecha y el resumen de cada cambio.", "El formulario de soporte del Centro de ayuda sigue siendo una interfaz de preparación y no transmite mensajes. Se configurará un canal de soporte y privacidad antes del lanzamiento."] },
      ],
      sourcesLabel: "Referencias de orientación",
      lgpdLaw: "Ley General Brasileña de Protección de Datos (Ley n.º 13.709/2018)",
      serproGuide: "Guía de Serpro para elaborar una política de privacidad alineada con la LGPD",
    },
    support: {
      eyebrow: "Soporte",
      title: "Deja el contexto preparado",
      description: "El formulario está diseñado para recibir soporte en el futuro. En esta etapa no envía mensajes ni guarda el texto fuera de esta pantalla.",
      name: "Tu nombre",
      email: "Tu correo electrónico",
      category: "Tema",
      categoryOptions: ["Elige una categoría", "Cuenta y perfil", "Rutina, tareas o enfoque", "Diario y check-in", "Privacidad", "Otro"],
      subject: "Resumen de lo ocurrido",
      message: "Cuéntanos un poco más",
      submit: "Preparar mensaje",
      notice: "El envío se conectará más adelante. No incluyas información urgente o sensible en este formulario de prototipo.",
      prepared: "La interfaz está lista para integrarse; no se transmitió ningún mensaje.",
    },
    backToHelp: "Volver al Centro de ayuda",
    currentPrototype: "Versión actual del prototipo",
  },
};
