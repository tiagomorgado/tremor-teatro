import { range } from "./media";

export type CreditGroup = { heading?: string; items: { role: string; names: string }[] };

export type Gallery = {
  /** Legacy WordPress slug, kept as a route for SEO (e.g. /galeria-secretum). */
  slug: string;
  label: string;
  images: string[];
};

export type ProjectStatus = "em-criacao" | "em-cartaz";
export const STATUS_LABEL: Record<ProjectStatus, string> = { "em-criacao": "Em criação", "em-cartaz": "Em cartaz" };

export type Project = {
  slug: string;
  title: string;
  /** Short form used in tight spaces (cards, filters). */
  short: string;
  kind: string;
  year?: string;
  /** Shown as a badge and drives the featured slot on the home page. Unset = past repertoire. */
  status?: ProjectStatus;
  /** Tour dates, newest tour first. Each entry is one venue; `dates` are ISO days. */
  performances?: { venue: string; city: string; country: string; dates: string[] }[];
  /** One line for listings. */
  logline: string;
  synopsis: string[];
  facts: { label: string; value: string }[];
  notes?: string[];
  /** Sales pitch shown with a "Pedir informação" button, only when `bookable` is true. */
  availability?: string;
  /** Turn on when a show is back on sale/tour. All current shows have already run. */
  bookable?: boolean;
  cover: string;
  /** Optional crop override (CSS object-position). Leave unset: images use their detected focal point. */
  coverPosition?: string;
  hero: string;
  /** Optional crop override for the hero, as above. */
  heroPosition?: string;
  video?: { id: string; title: string };
  galleries: Gallery[];
  credits: CreditGroup[];
  partnersLogo?: string;
  links?: { label: string; to: string }[];
};

export const projects: Project[] = [
  {
    slug: "e-se-o-meu-coracao-parar",
    title: "E se o meu coração parar",
    short: "E se o meu coração parar",
    kind: "Espetáculo de teatro",
    year: "2026",
    status: "em-cartaz",
    logline: "Maria Mercedes regressa, após o 25 de Abril, à casa abandonada da mãe para um último adeus.",
    synopsis: [
      "E SE O MEU CORAÇÃO PARAR é um espetáculo de teatro conduzido pela voz de Maria Mercedes, que regressa, após o 25 de Abril, à casa abandonada da falecida mãe para um último adeus ao local que a viu crescer. Ao percorrer cada divisão, objeto esquecido e recanto tomado pela vegetação, Maria Mercedes conduz o público numa visita guiada pelas ruínas da sua memória. A casa, lentamente engolida pela natureza, reflete o grito da vivência comunitária marcada pelas imposições de uma sociedade rural sob preceitos ditatoriais. Numa viagem que oscila entre o coletivo e o individual, a degradação da casa revela-se uma poderosa metáfora da erosão do passado em contraste com a viragem libertária introduzida pela revolução.",
      "Uma viagem acompanhada por figuras do folclore brasileiro, na qual o movimento, a música e a palavra se unem em vibração uníssona.",
    ],
    facts: [
      { label: "Estreia", value: "7 de novembro de 2026, Centro Cultural Raiano, Idanha-a-Nova" },
      { label: "Coprodução", value: "Centro Dramático Galego, Bengala Teatro Físico, CIA Teatral Boccaccione, Grupo Ditirambo" },
      { label: "Duração", value: "Cerca de 50 minutos" },
      { label: "Línguas", value: "Português e galego, sem legendas" },
      { label: "Classificação", value: "M/14" },
    ],
    performances: [
      { venue: "Centro Cultural Raiano", city: "Idanha-a-Nova", country: "PT", dates: ["2026-11-07"] },
      { venue: "Estufa Fria de Lisboa", city: "Lisboa", country: "PT", dates: ["2026-11-13", "2026-11-14", "2026-11-15"] },
      { venue: "Centro Dramático Galego", city: "Santiago de Compostela", country: "ES", dates: ["2026-11-17"] },
    ],
    cover: "coracao-cena/coracao-cena-19",
    hero: "coracao-cena/coracao-cena-22",
    galleries: [
      {
        // Keeps the old WordPress gallery URL, which the live site links to.
        slug: "galeria-o-meu-coracao",
        label: "Espetáculo",
        images: [1, 3, 6, 8, 9, 11, 12, 14, 16, 17, 19, 20, 22, 23, 24, 28, 32, 42, 43, 46, 49, 59, 63, 66, 68, 71].map(
          (n) => `coracao-cena/coracao-cena-${String(n).padStart(2, "0")}`,
        ),
      },
      {
        slug: "galeria-o-meu-coracao-criacao",
        label: "Criação",
        images: ["misc/foto-1", ...range("coracao", "coracao", 1, 5)],
      },
    ],
    credits: [
      {
        items: [
          { role: "Produção", names: "Tremor Teatro em coprodução com Centro Dramático Galego, Bengala Teatro Físico, CIA Teatral Boccaccione e o Grupo Ditirambo" },
          { role: "Autoria, texto, criação, direção e produção", names: "Patrícia Moreira" },
          { role: "Artistas intérpretes", names: "Anabela Ribeiro, An González, Brais Iriarte Alonso, Joel Bacheschi, Karol Nurza, Precy Anne" },
          { role: "Cenografia e figurinos", names: "Nádia Neto Gama" },
          { role: "Composição musical e espaço sonoro", names: "Brais Iriarte Alonso" },
          { role: "Música ao vivo", names: "Brais Iriarte Alonso, Joel Bacheschi, Karol Nurza, Precy Anne" },
          { role: "Direção de movimento", names: "An González" },
          { role: "Ilustração", names: "Gabriela Grave" },
          { role: "Fotografia", names: "João Pedro Leal, Luís Vila-Lobos" },
          { role: "Grafismo", names: "Rita António" },
          { role: "Desenho de luz e operação técnica", names: "Nuno Gomes" },
          { role: "Produção executiva", names: "Leonor Direitinho, Sofia Correia" },
        ],
      },
      {
        heading: "Parceiros e apoios",
        items: [
          {
            role: "Apoios",
            names:
              "República Portuguesa, Cultura, Juventude e Desporto / Direção-Geral das Artes, Fundação GDA, Programa IBERESCENA, Centro Cultural Raiano, Município de Idanha-a-Nova, Junta de Freguesia de Monfortinho e Salvaterra do Extremo",
          },
          { role: "Parceiros institucionais", names: "Associação Torre Tradições, Estufa Fria de Lisboa, Câmara Municipal de Lisboa, Show Doutor" },
        ],
      },
    ],
    partnersLogo: "logos/barra-logos-coracao",
  },
  {
    slug: "ha-um-nucleo-estatico-no-interior-do-caos",
    title: "Há um núcleo estático no interior do caos",
    short: "Núcleo Estático",
    kind: "Espetáculo de teatro",
    year: "2023",
    logline: "Um sonho monitorizado, a partir de A Casa de Bernarda Alba de Federico García Lorca.",
    synopsis: [
      "Adela e Martírio habitam um sonho monitorizado por Maria Josefa. Tontas de vertigem, enredadas no círculo vicioso do seu universo interno, são corpos abandonados à sorte num confinamento límbico, onde o terror do desconhecido parece ser a única saída. Uma viagem ao universo ficcional do sonho e respetiva potência criadora e à complexidade do feminino polarizado.",
      "O espetáculo é um texto original de Patrícia Moreira redigido a partir das características mais marcantes de quatro personagens da obra A Casa de Bernarda Alba de Federico García Lorca.",
    ],
    facts: [
      { label: "Coprodução", value: "RUGAS, Meraki Producciones, Teatro del Azoro" },
      { label: "Línguas", value: "Português e espanhol, sem legendas" },
      { label: "Classificação", value: "M/14" },
    ],
    cover: "nucleo/nucleo-08",
    hero: "nucleo/nucleo-20",
    video: { id: "MG_dXyGJ1cc", title: "Há um núcleo estático no interior do caos, teaser" },
    galleries: [
      { slug: "galeria-nucleo-estatico", label: "Espetáculo", images: range("nucleo", "nucleo", 1, 31) },
      { slug: "galeria-nucleo-estatico-ensaio", label: "Ensaio", images: range("nucleo-ensaio", "nucleo-ensaio", 1, 8) },
    ],
    credits: [
      {
        items: [
          { role: "Produção", names: "Tremor Teatro em coprodução com a RUGAS, Meraki Producciones e Teatro del Azoro" },
          { role: "Texto, criação e direção", names: "Patrícia Moreira" },
          { role: "Artistas intérpretes", names: "Anabela Ribeiro, Laura Pacas, Margarida Ferreira, Pedro Baptista" },
          { role: "Participação especial em vídeo", names: "Alicia Chong, Egly Larreynaga, Pamela Palenciano, Paola Miranda" },
          { role: "Apoio à criação e assistência de ensaios", names: "Gonçalo Martins" },
          { role: "Desenho cenográfico", names: "Patrícia Moreira" },
          { role: "Máscaras, figurinos e adereços", names: "Carmen Alves" },
          { role: "Composição musical, desenho sonoro e música ao vivo", names: "Jaime Tuñon Garcia" },
          { role: "Apoio ao movimento", names: "Pedro Nascimento" },
          { role: "Apoio vocal", names: "Pedro Paz" },
          { role: "Desenho de luz", names: "Nuno Gomes (Show Ventura)" },
          { role: "Vídeo e edição", names: "Pedro Cabral, Sofia Correia, Teatro del Azoro" },
          { role: "Fotografia de ensaio", names: "Camilla Ciardi" },
          { role: "Fotografias promocionais e de cena", names: "João Pedro Leal" },
          { role: "Grafismo", names: "Rita António" },
          { role: "Assessoria de imprensa", names: "Fátima Santos Filipe" },
          { role: "Direção de arte", names: "Patrícia Moreira, Patrícia Cairrão, Ricardo G. Santos, Teatro del Azoro" },
          { role: "Direção de produção", names: "Patrícia Moreira" },
          { role: "Produção executiva", names: "Alice Nocioni" },
          { role: "Operação técnica", names: "Gabriel Rodrigues, Nuno Gomes (Show Ventura)" },
        ],
      },
      {
        heading: "Parceiros e apoios",
        items: [
          { role: "Entidades parceiras", names: "Ars Longa, Câmara Municipal de Lisboa, Estufa Fria de Lisboa, 7UFree, Show Ventura" },
          { role: "Apoios", names: "República Portuguesa, Cultura / Direção-Geral das Artes, Fundação Calouste Gulbenkian, Programa IBERESCENA, Fundação GDA" },
        ],
      },
    ],
    partnersLogo: "logos/barra-de-logos-branco-final",
    links: [{ label: "Press release", to: "/nucleo-estatico-press-release/" }],
  },
  {
    slug: "fogo-fatuo",
    title: "Fogo-Fátuo",
    short: "Fogo-Fátuo",
    kind: "Espetáculo de teatro",
    year: "2021",
    logline: "O lugar do café na vida de portugueses, galegos e brasileiros. Entre o profano e o divino.",
    synopsis: [
      "FOGO-FÁTUO é um espetáculo de teatro que se propõe pensar o lugar que o café ocupou na vida de portugueses, galegos e brasileiros, assim como o seu contributo para a sedimentação das relações e vínculos comunitários. Exercitando a elasticidade de cicatrizes seculares, FOGO-FÁTUO convoca a música, o ritual e o movimento físico-verbal em dança oscilante e vertiginosa entre o profano e o divino. Corpos que, em união simbiótica, celebram o vapor que exala do silêncio da historiografia.",
      "FOGO-FÁTUO estreou no dia 29 de outubro de 2021, contando com apresentações em Portugal (Idanha-a-Nova) e Espanha (Vigo, Galiza).",
    ],
    facts: [
      { label: "Estreia", value: "29 de outubro de 2021, Centro Cultural Raiano, Idanha-a-Nova" },
      { label: "Digressão", value: "Idanha-a-Nova, Vigo (Galiza)" },
      { label: "Línguas", value: "Português e galego, sem legendas" },
    ],
    availability: "Espetáculo disponível para venda.",
    cover: "fogo-fatuo/fogo-fatuo-19",
    hero: "fogo-fatuo/fogo-fatuo-07",
    video: { id: "-GcHiO7P8U0", title: "Fogo-Fátuo, teaser" },
    galleries: [
      { slug: "galeria-fogo-fatuo", label: "Espetáculo", images: range("fogo-fatuo", "fogo-fatuo", 1, 31, [13]) },
      { slug: "galeria-fogo-fatuo-ensaio", label: "Ensaio", images: range("fogo-fatuo-ensaio", "fogo-fatuo-ensaio", 1, 9) },
    ],
    credits: [
      {
        items: [
          { role: "Produção", names: "Tremor Teatro em coprodução com Município de Idanha-a-Nova, Limiar Teatro e CIA Teatral Boccaccione" },
          { role: "Texto, criação e direção", names: "Patrícia Moreira" },
          { role: "Artistas intérpretes cocriadores", names: "Anabela Ribeiro, Brais Iriarte Alonso, Pedro Baptista" },
          { role: "Participação especial em vídeo", names: "Gabriela Vansan, Karol Nurza, Marcelo Evangelisti, Nathália Fernandes, Vilsinho Juri" },
          { role: "Desenho de luz e operação técnica, luz, som e vídeo", names: "Nuno Gomes (Show Ventura)" },
          { role: "Espaço sonoro e composição musical", names: "Brais Iriarte Alonso" },
          { role: "Assistência ao espaço sonoro", names: "Vicente Molder" },
          { role: "Cenografia", names: "Patrícia Moreira" },
          { role: "Figurinos e máscaras", names: "Carmen Alves" },
          { role: "Vídeo, realização e fotografia", names: "Francisca Alarcão" },
          { role: "Captação de vídeo", names: "Francisca Alarcão, Raíza Ferreira" },
          { role: "Grafismo", names: "Inês Pereira" },
          { role: "Direção de arte", names: "Cesar Mazari, Patrícia Moreira" },
          { role: "Coordenação de pesquisa histórica", names: "Joe Bacheschi, Patrícia Moreira" },
          { role: "Assessoria de imprensa", names: "Raquel Guimarães" },
          { role: "Direção de produção", names: "Patrícia Moreira" },
          { role: "Assistência de produção", names: "Brais Iriarte Alonso, Karol Nurza, Laura Gama Martins, Naná Bertchelly, Pedro Gavina Maia" },
        ],
      },
      {
        heading: "Parceiros e apoios",
        items: [
          {
            role: "Parcerias institucionais",
            names:
              "Município de Idanha-a-Nova, Centro Cultural Raiano, União de Juntas de Monfortinho e Salvaterra do Extremo, Confraria do Bodo de Salvaterra do Extremo, Associação Torre Tradições, Associação Recreativa e Cultural do Bairro de Valongo, Polo Cultural Gaivotas Boavista, Centro Cultural Nautilius, Sala Ártika, Festival Março Jovem, Show Ventura",
          },
          {
            role: "Apoios",
            names: "Programa IBERESCENA, República Portuguesa, Cultura / Direção-Geral das Artes, Fundação GDA, Fundação Calouste Gulbenkian, Município de Idanha-a-Nova",
          },
        ],
      },
    ],
    partnersLogo: "logos/barra-logos-fogo-fatuo",
    links: [
      { label: "A curta-metragem", to: "/fogo-fatuo-curta-metragem/" },
      { label: "Press release", to: "/press-release-fogo-fatuo/" },
      { label: "Reflexão no Substack", to: "/pensamento/" },
    ],
  },
  {
    slug: "fogo-fatuo-curta-metragem",
    title: "Fogo-Fátuo, a curta-metragem",
    short: "Fogo-Fátuo, curta",
    kind: "Curta-metragem",
    logline: "O guião do espetáculo levado ao cinema, a preto e branco.",
    synopsis: [
      "O café ao longo dos séculos e o seu contributo para a sedimentação das relações e vínculos comunitários, em Portugal, na Galiza e no Brasil. Exercitando a elasticidade de cicatrizes seculares, a música, o ritual e o movimento físico-verbal oscilam, vertiginosamente, entre o profano e o divino. Em fricção arrepiante entre Liberdade e clausura, estes corpos celebram, em união simbiótica, o vapor que exala do silêncio da historiografia.",
      "Esta curta-metragem foi criada no âmbito do projeto FOGO-FÁTUO, a partir do guião do homónimo espetáculo de teatro.",
    ],
    facts: [
      { label: "Duração", value: "26 min" },
      { label: "Línguas", value: "Galego e português" },
      { label: "Realização", value: "Francisca Alarcão" },
    ],
    cover: "curta/curta-01",
    hero: "curta/curta-03",
    video: { id: "_SguEpwTVic", title: "Fogo-Fátuo, a curta-metragem, teaser" },
    galleries: [{ slug: "galeria-fogo-fatuo-curta-metragem", label: "Fotogramas", images: range("curta", "curta", 1, 8) }],
    credits: [
      {
        items: [
          { role: "Realização e montagem", names: "Francisca Alarcão" },
          { role: "Imagem", names: "Francisca Alarcão, Raíza Ferreira" },
          { role: "Autoria", names: "Patrícia Moreira" },
          {
            role: "Interpretação",
            names:
              "Anabela Ribeiro, Brais Iriarte Alonso, Francisca Alarcão, Karol Nurza, Marcelo Evangelisti, Nathália Fernandes, Patrícia Moreira, Pedro Baptista, Pedro Gavina Maia, Vilsinho Juri",
          },
          { role: "Som", names: "Vicente Molder" },
          { role: "Direção de arte", names: "Francisca Alarcão, Raíza Ferreira, Patrícia Moreira" },
          { role: "Música original", names: "Brais Iriarte Alonso" },
          { role: "Figurinos e máscaras", names: "Carmen Alves" },
          { role: "Produção", names: "Tremor Teatro em coprodução com Limiar Teatro e CIA Teatral Boccaccione" },
        ],
      },
    ],
    links: [{ label: "O espetáculo de teatro", to: "/fogo-fatuo/" }],
  },
  {
    slug: "secretum",
    title: "Secretum",
    short: "Secretum",
    kind: "Performance-instalação",
    year: "2020",
    logline: "Dois corpos, um tecido, um segredo partilhado a sós com cada espectador.",
    synopsis: [
      "SECRETUM é uma performance-instalação vinculada à estimulação sensitiva do espectador que, em conjunto com o intérprete, a vivencia. Propõe uma relação de intimidade e harmonia com o espaço envolvente e, em simultâneo, uma dança dialógica em surdina, alicerçada na vibração e no eco que a prece e o segredo têm no corpo. Dois corpos envoltos num tecido que os aparta e que é, ao mesmo tempo, a única respiração que recebem do mundo exterior. A quarentena e o isolamento pensados enquanto lugar de contacto permanente e intenso com o self, que fervilha no desespero ardente do toque no / do outro.",
      "Dois intérpretes habitam um dispositivo flutuante, no tempo e no espaço. Cada um partilha um segredo, a sós, com o espectador. Em sessões individuais de aproximadamente 15 minutos.",
    ],
    facts: [
      { label: "Estreia", value: "7 de fevereiro de 2020, Estufa Fria de Lisboa" },
      { label: "Formato", value: "Sessões individuais de cerca de 15 minutos" },
    ],
    notes: [
      "Na Estufa Fria de Lisboa a performance realizou-se dentro de um lago, tendo sido disponibilizadas botas impermeáveis ao público.",
    ],
    availability: "Performance-instalação disponível para venda.",
    cover: "misc/secretum-54-de-54-scaled",
    hero: "misc/secretum-54-de-54-scaled",
    video: { id: "VLwX3dXTA6E", title: "Secretum, teaser" },
    galleries: [{ slug: "galeria-secretum", label: "Performance", images: range("secretum", "secretum", 1, 24) }],
    credits: [
      {
        items: [
          { role: "Texto e criação", names: "Patrícia Moreira" },
          { role: "Intérpretes", names: "Patrícia Moreira e Sílvio Vieira" },
          { role: "Apoio dramatúrgico", names: "Sílvio Vieira" },
          { role: "Desenho cenográfico", names: "Inês Pereira, Patrícia Moreira" },
          { role: "Fotografia e vídeo", names: "Miguel Canaverde e Pedro Mourinha" },
          { role: "Produção", names: "Patrícia Moreira" },
        ],
      },
      {
        heading: "Parceiros e apoios",
        items: [
          { role: "Apoios", names: "Câmara Municipal de Lisboa, Jardins de Lisboa, Lisboa Capital Verde 2020, Estufa Fria de Lisboa" },
          { role: "Patrocínio", names: "Casa do Marquês" },
        ],
      },
    ],
    partnersLogo: "logos/logos-secretum-branco-site",
  },

];

/** Everything that has premiered (current shows included); shows still in creation are left out. */
export const repertoire = projects.filter((p) => p.status !== "em-criacao");
/** The show promoted on the home page: one in cartaz first, otherwise one in creation. */
export const featured = projects.find((p) => p.status === "em-cartaz") ?? projects.find((p) => p.status === "em-criacao");

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export function getProjectByGallery(gallerySlug: string) {
  for (const p of projects) {
    const g = p.galleries.find((x) => x.slug === gallerySlug);
    if (g) return { project: p, gallery: g };
  }
  return undefined;
}

export function nextProject(slug: string) {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
}

const dayFmt = new Intl.DateTimeFormat("pt-PT", { day: "numeric", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("pt-PT", { month: "long", year: "numeric", timeZone: "UTC" });

/** "7 de novembro de 2026" or "13, 14 e 15 de novembro de 2026" (dates in one month). */
export function formatDays(dates: string[]) {
  const ds = dates.map((d) => new Date(d + "T00:00:00Z"));
  const days = ds.map((d) => dayFmt.format(d));
  const list = days.length > 1 ? `${days.slice(0, -1).join(", ")} e ${days[days.length - 1]}` : days[0];
  return `${list} de ${monthFmt.format(ds[0])}`;
}
