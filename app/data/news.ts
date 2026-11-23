export type Article = {
  slug: string;
  kind: "Notícia" | "Press release";
  date: string; // ISO
  title: string;
  /** Shorter title for search results / browser tab, when `title` is too long (> ~48 chars). */
  seoTitle?: string;
  source?: string;
  excerpt: string;
  lang?: "pt" | "es";
  cover?: string;
  body: string[];
  quote?: { text: string; by: string };
  links: { label: string; href: string }[];
  project?: string;
};

export const articles: Article[] = [
  {
    slug: "nucleo-estatico-press-release",
    kind: "Press release",
    date: "2023-11-09",
    title: "Há um núcleo estático no interior do caos",
    source: "E-Cultura",
    excerpt:
      "O espetáculo é um texto original de Patrícia Moreira redigido a partir das características mais marcantes de quatro personagens de A Casa de Bernarda Alba.",
    cover: "misc/nucelo-card",
    project: "ha-um-nucleo-estatico-no-interior-do-caos",
    body: [
      "O espetáculo é um texto original de Patrícia Moreira redigido a partir das características mais marcantes de quatro personagens da obra “A Casa de Bernarda Alba” de Federico García Lorca.",
      "Uma produção Tremor Teatro em coprodução com RUGAS, Meraki Producciones e Teatro del Azoro.",
      "Adela e Martírio habitam um sonho monitorizado por Maria Josefa. Tontas de vertigem, enredadas no círculo vicioso do seu universo interno, são corpos abandonados à sorte num confinamento límbico, onde o terror do desconhecido parece ser a única saída. Uma viagem ao universo ficcional do sonho e respetiva potência criadora e à complexidade do feminino polarizado.",
    ],
    links: [
      { label: "E-Cultura", href: "https://www.e-cultura.pt/evento/36719" },
      { label: "Viral Agenda", href: "https://www.viralagenda.com/pt/events/1383471/ha-um-nucleo-estatico-no-interior-do-caos" },
    ],
  },
  {
    slug: "noticias-somos-ibero-america",
    kind: "Notícia",
    date: "2022-09-15",
    title: "Tremor Teatro, cuando la adversidad se convierte en oportunidad",
    seoTitle: "Cuando la adversidad se convierte en oportunidad",
    source: "Somos IberoAmérica",
    lang: "es",
    excerpt:
      "Patrícia Moreira fundó Tremor Teatro justo el año en que una pandemia hizo bajar el telón y apagar los reflectores en todo el mundo.",
    cover: "fogo-fatuo/fogo-fatuo-21",
    project: "fogo-fatuo",
    body: [
      "Patrícia Moreira fundó Tremor Teatro justo el año en que una pandemia hizo bajar el telón y apagar los reflectores en todo el mundo. Una decisión y unas ayudas transformaron su carrera de la mano del programa Iberescena. Esta es la historia de esta actriz portuguesa de 32 años.",
      "La pandemia COVID demostró a la actriz y directora teatral Patrícia Moreira (Lisboa, 1990) que detrás de una adversidad también se encuentra la oportunidad. En enero de 2020, sin sospechar que un virus cambiaría por completo el mundo, fundó Tremor Teatro, un emprendimiento cultural que da vida a “Fogo Fátuo” (Fuego Ardiente), una obra teatral que, a través de música, danza, ritual y movimiento, muestra la importancia del café en la vida de portugueses, gallegos y brasileiros en la segunda mitad del siglo XIX.",
      "La artista llevaba tiempo trabajando en esta obra y como todo nuevo proyecto, Fogo Fátuo vio la luz con la idea de crecer poco a poco desde Portugal y eventualmente cruzar la frontera hacia España. Pero la COVID y el destino tenían otros planes para el “fuego ardiente” de esta joven actriz y directora teatral.",
      "Dos meses después de iniciar Tremor Teatro, los telones bajaron, las salas de teatro se vaciaron y el mundo entero vivió el apagón cultural más grande de la historia. Las industrias culturales y en especial a las artes escénicas donde la presencialidad es seña de identidad, se vieron duramente afectadas.",
      "Parecía que el fuego ardiente de Patrícia se apagaría irremediablemente. Como tantos otros artistas, intentó sobrevivir como pudo ese año negro para la cultura. En junio de 2020 vio la convocatoria del Fondo de Ayuda para las Artes Escénicas Iberoamericanas (Iberescena), que incluía una línea de apoyo para la coproducción de espectáculos y no dudó en presentar su proyecto.",
      "Un año antes, en 2019, su país se convertía en el miembro más reciente de Iberescena. Con el ingreso de Portugal, se abría la puerta para que artistas lusos accedieran a las ayudas el año siguiente.",
    ],
    quote: {
      text: "Si no hubiera sido por la pandemia, yo no habría sacado tiempo para participar en la convocatoria de Iberescena.",
      by: "Patrícia Moreira, em entrevista ao portal Somos Iberoamérica",
    },
    links: [
      {
        label: "Ler a notícia completa em Somos IberoAmérica",
        href: "https://www.somosiberoamerica.org/destacado/historia/tremor-teatro-cuando-la-adversidad-se-convierte-en-oportunidad/",
      },
      { label: "Ver a entrevista em vídeo", href: "https://www.youtube.com/watch?v=SMS7zS3BoWw" },
    ],
  },
  {
    slug: "noticias-dga",
    kind: "Notícia",
    date: "2022-04-07",
    title: "Patrícia Moreira é a representante do IBERESCENA no Dia Mundial da Propriedade Intelectual",
    seoTitle: "Patrícia Moreira representa o IBERESCENA",
    source: "Direção-Geral das Artes",
    excerpt:
      "A fundadora do Tremor Teatro foi indicada como única representante do programa de cooperação Ibero-Americano, em Madrid.",
    cover: "fogo-fatuo/fogo-fatuo-08",
    project: "fogo-fatuo",
    body: [
      "Patrícia Moreira, fundadora do Tremor Teatro e diretora artística do projeto “Fogo-Fátuo”, foi indicada pelo Programa Ibercena para participar enquanto única representante do programa de cooperação Ibero-Americano nas celebrações do Dia Mundial da Propriedade Intelectual, que decorrem no próximo dia 26 de abril, em Madrid.",
      "Sob o enfoque do contributo dos jovens para a inovação e para um futuro melhor, será organizado pelo Ministério da Cultura e Desporto de Espanha a iniciativa “La propiedad intelectual y los jóvenes: innovar para un futuro mejor”, estando previsto um encontro com artistas, criadores e empreendedores culturais Ibero-Americanos. Neste encontro, o diálogo e intercâmbio entre diferentes perspetivas dos vários programas de cooperação na área da Cultura irão contribuir para uma reflexão em torno da propriedade intelectual e indústria cultural no espaço Ibero-Americano.",
      "A indicação de Patrícia Moreira por parte de Portugal teve por base a solidez e consistência do projeto “Fogo-Fátuo”, apoiado em 2020 através da linha de apoio a coproduções do Ibercena. Apesar da curta experiência do núcleo coprodutor português, o elevado pormenor na conceção plástica do dispositivo cénico, que valoriza o projeto artístico, e o facto de ser uma jovem mulher artista, contribuíram decisivamente para esta escolha.",
      "“Fogo-Fátuo” é um espetáculo de teatro que se propõe pensar o lugar que o café ocupou na vida de portugueses, espanhóis e brasileiros, assim como o seu contributo para a sedimentação das relações e vínculos comunitários. Patrícia Moreira é a responsável pela criação, estando a interpretação a cargo de Anabela Ribeiro, Brais Iriarte Alonso e Pedro Baptista. O espetáculo, uma produção do Tremor Teatro em coprodução com o Limiar Teatro, a CIA Teatral Boccaccione e o Município de Idanha-a-Nova, estreou no dia 29 de outubro de 2021, no Centro Cultural Raiano, em Idanha-a-Nova, com o apoio da Direção-Geral das Artes.",
      "No contexto da estratégia de promoção ativa da internacionalização da arte e dos artistas portugueses contemporâneos, o Ministério da Cultura, através da Direção-Geral das Artes, integrou a rede Ibercena em novembro de 2019, tornando possível a participação das estruturas artísticas portuguesas e o acesso às linhas de financiamento do Programa.",
      "O Ibercena é um Fundo de Ajuda (rede de fomento, intercâmbio e cooperação) para as Artes Cénicas Ibero-americanas. Criado em novembro de 2006, em Montevidéu (Uruguai), integra, atualmente, 17 países.",
    ],
    quote: {
      text: "Acreditámos que Patrícia Moreira poderia ser um testemunho importante no que à perspetiva de futuro e ao empoderamento das mulheres se refere.",
      by: "Américo Rodrigues, Diretor-Geral das Artes",
    },
    links: [{ label: "Ler na Direção-Geral das Artes", href: "https://www.dgartes.gov.pt/pt/noticia/5103" }],
  },
  {
    slug: "press-release-fogo-fatuo",
    kind: "Press release",
    date: "2021-10-20",
    title: "Fogo-Fátuo, uma criação de Patrícia Moreira",
    source: "Gerador",
    excerpt:
      "O contrabando de café na raia ibérica e o início da exploração cafeeira no Brasil como estímulo de pensamento e criação.",
    cover: "fogo-fatuo/fogo-fatuo-01",
    project: "fogo-fatuo",
    body: [
      "FOGO-FÁTUO é um espetáculo de teatro que tem como estímulo de pensamento e criação o contrabando de café na raia ibérica e o início da exploração cafeeira no Brasil. Exercitando a elasticidade de cicatrizes seculares, convoca a música, o ritual e o movimento físico-verbal em dança oscilante e vertiginosa entre o profano e o divino. Estreia no dia 29 de outubro no Centro Cultural Raiano, em Idanha-a-Nova, no âmbito do Festival “12 em Rede das Aldeias Históricas”.",
      "Patrícia Moreira é a responsável pela criação, cuja interpretação está a cargo de Anabela Ribeiro, Brais Iriarte Alonso e Pedro Baptista. Uma produção da Tremor Teatro em coprodução com Limiar Teatro, CIA Teatral Boccaccione e Município de Idanha-a-Nova.",
      "A companhia Tremor Teatro apresentou a sua primeira criação em 2020, na Estufa Fria de Lisboa: SECRETUM, uma performance-instalação que promovia o contacto direto entre os intérpretes e o público e uma imersão no ambiente sonoro e físico do local.",
    ],
    links: [
      { label: "Gerador", href: "https://gerador.eu/patricia-moreira-estreia-nova-criacao-em-idanha-a-nova/" },
      { label: "Glam Magazine", href: "https://glam-magazine.pt/fogo-fatuo-uma-criacao-de-patricia-moreira/" },
    ],
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}

const fmt = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export function formatDate(iso: string) {
  return fmt.format(new Date(iso + "T00:00:00Z"));
}
