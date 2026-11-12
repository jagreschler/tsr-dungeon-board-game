export type CaptionInk = "dark" | "parchment";

export type MonsterStatsBox = {
  topPercent: number;
  heightPercent: number;
  ink: CaptionInk;
};

export type MonsterCardAssets = {
  imageHref: string | undefined;
  clipHref: string | undefined;
  statsBox: MonsterStatsBox;
};

type CatalogEntry = {
  level: number;
  name: string;
  hasClip: boolean;
  hasArt?: boolean;
  statsBox?: MonsterStatsBox;
};

const DEFAULT_STATS_BOX: MonsterStatsBox = {
  topPercent: 74.8,
  heightPercent: 16,
  ink: "dark",
};

const PLAIN_CARD_STATS_BOX: MonsterStatsBox = {
  topPercent: 22,
  heightPercent: 56,
  ink: "dark",
};

const catalog: CatalogEntry[] = [
  {
    level: 1,
    name: "Goblins",
    hasClip: true,
    statsBox: { ...DEFAULT_STATS_BOX, ink: "parchment" },
  },
  { level: 1, name: "Hobgoblins", hasClip: true },
  {
    level: 1,
    name: "Giant Lizard",
    hasClip: true,
    statsBox: { topPercent: 67, heightPercent: 19, ink: "dark" },
  },
  { level: 1, name: "Giant Rats", hasClip: false, hasArt: false },
  { level: 1, name: "Skeleton", hasClip: false, hasArt: false },
];

export function monsterSlug(monsterName: string): string {
  return monsterName.trim().toLowerCase().replace(/\s+/g, "-");
}

export function monsterCardHrefs(
  level: number,
  monsterName: string,
  hasClip: boolean,
): MonsterCardAssets {
  const fileStem = `L${level}-${monsterSlug(monsterName)}`;
  const basePath = `${import.meta.env.BASE_URL}cards/${fileStem}`;
  const clipHref = hasClip ? `${basePath}.mp4` : undefined;

  return {
    imageHref: `${basePath}.jpg`,
    clipHref,
    statsBox: DEFAULT_STATS_BOX,
  };
}

export function lookupMonsterCard(
  level: number,
  monsterName: string,
): MonsterCardAssets {
  const slug = monsterSlug(monsterName);
  const entry = catalog.find((monster) => {
    return monster.level === level && monsterSlug(monster.name) === slug;
  });

  if (entry === undefined) {
    return {
      imageHref: undefined,
      clipHref: undefined,
      statsBox: DEFAULT_STATS_BOX,
    };
  }

  if (entry.hasArt === false) {
    return {
      imageHref: undefined,
      clipHref: undefined,
      statsBox: PLAIN_CARD_STATS_BOX,
    };
  }

  return {
    ...monsterCardHrefs(entry.level, entry.name, entry.hasClip),
    statsBox: entry.statsBox ?? DEFAULT_STATS_BOX,
  };
}
