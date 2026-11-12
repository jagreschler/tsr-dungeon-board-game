const LINKS_OPTION = "links";
const STEPS_OPTION = "steps";

export class DebugMode {
  private readonly on: boolean;
  private readonly options: ReadonlySet<string>;

  constructor(search: string) {
    const query = search.startsWith("?") ? search.slice(1) : search;
    const params = new URLSearchParams(query);
    this.on = params.has("debug");
    this.options = namedOptions(params.get("debugOptions"));
  }

  isOn(): boolean {
    return this.on;
  }

  hasLinks(): boolean {
    return this.on && this.options.has(LINKS_OPTION);
  }

  hasSteps(): boolean {
    return this.on && this.options.has(STEPS_OPTION);
  }
}

function namedOptions(value: string | null): ReadonlySet<string> {
  if (value === null || value === "") {
    return new Set();
  }

  return new Set(
    value
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0),
  );
}
