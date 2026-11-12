const LINKS_OPTION = "links";
const STEPS_OPTION = "steps";

export class DebugMode {
  private readonly fromAddress: boolean;
  private readonly isDev: boolean;
  private readonly options: ReadonlySet<string>;

  constructor(search: string, isDev = false) {
    const query = search.startsWith("?") ? search.slice(1) : search;
    const params = new URLSearchParams(query);
    this.fromAddress = params.has("debug");
    this.isDev = isDev;
    this.options = namedOptions(params.get("debugOptions"));
  }

  isOn(): boolean {
    return this.isDev || this.fromAddress;
  }

  hasLinks(): boolean {
    return this.fromAddress && this.options.has(LINKS_OPTION);
  }

  hasSteps(): boolean {
    return this.fromAddress && this.options.has(STEPS_OPTION);
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
