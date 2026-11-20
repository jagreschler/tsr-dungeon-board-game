export type CaptionInk = "dark" | "parchment";

export type MonsterStatsBox = {
  topPercent: number;
  heightPercent: number;
  ink: CaptionInk;
};

export type UndefinedMonsterCard = {
  imageHref: undefined;
  clipHref: undefined;
  statsBox: MonsterStatsBox;
};

export type ArtMonsterCard = {
  imageHref: string;
  clipHref: string | undefined;
  statsBox: MonsterStatsBox;
};

export type MonsterCardAssets = UndefinedMonsterCard | ArtMonsterCard;

type CatalogEntry = {
  name: string;
  hasClip: boolean;
  statsBox?: MonsterStatsBox;
};

const DEFAULT_STATS_BOX: MonsterStatsBox = {
  topPercent: 74.8,
  heightPercent: 16,
  ink: "dark",
};

const catalog: CatalogEntry[] = [
  {
    name: "Goblins",
    hasClip: true,
    statsBox: {
      topPercent: 76,
      heightPercent: 20,
      ink: "parchment",
    },
  },
  { name: "Hobgoblins", hasClip: true },
  {
    name: "Giant Lizard",
    hasClip: true,
    statsBox: { topPercent: 67, heightPercent: 19, ink: "dark" },
  },
  {
    name: "Giant Rats",
    hasClip: true,
    statsBox: { topPercent: 74, heightPercent: 17, ink: "dark" },
  },
  {
    name: "Skeleton",
    hasClip: false,
    statsBox: { topPercent: 78.4, heightPercent: 16, ink: "dark" },
  },
];

export function monsterSlug(monsterName: string): string {
  return monsterName.trim().toLowerCase().replace(/\s+/g, "-");
}

function cardFiles(monsterName: string, hasClip: boolean): ArtMonsterCard {
  const basePath = `${import.meta.env.BASE_URL}cards/${monsterSlug(monsterName)}`;
  const clipHref = hasClip ? `${basePath}.mp4` : undefined;

  return {
    imageHref: `${basePath}.jpg`,
    clipHref,
    statsBox: DEFAULT_STATS_BOX,
  };
}

export function lookupMonsterCard(monsterName: string): MonsterCardAssets {
  const slug = monsterSlug(monsterName);
  const entry = catalog.find((monster) => monsterSlug(monster.name) === slug);

  if (entry === undefined) {
    const card: UndefinedMonsterCard = {
      imageHref: undefined,
      clipHref: undefined,
      statsBox: DEFAULT_STATS_BOX,
    };
    return card;
  }

  return {
    ...cardFiles(entry.name, entry.hasClip),
    statsBox: entry.statsBox ?? DEFAULT_STATS_BOX,
  };
}
