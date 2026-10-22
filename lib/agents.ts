export type Role = "trader" | "scanner" | "coder";
export type Agent = {
  id: string;
  slug: string;
  name: string;
  title: string;
  role: Role;
  specialty: string;
  strategy?: string;
  description: string;
  story: string;
  quote: string;
  peers: string[];
  image: string | null;
  desk: string;
  implemented: boolean;
};
export const agents: Agent[] = [
  {
    id: "alon",
    slug: "alon",
    name: "ALON",
    title: "The Pump.fun King",
    role: "trader",
    specialty: "Launch research · shared-account risk",
    strategy: "new_launch",
    description:
      "Fast to notice a new launch. Slower to let it through the risk gates.",
    story:
      "At the head of the timber trading floor, ALON keeps one eye on launch evidence and the other on the paper account’s limits.",
    quote: "Show me real launch evidence.",
    peers: ["poorgoat", "jack-duval"],
    image: "alon",
    desk: "alon",
    implemented: true,
  },
  {
    id: "wren",
    slug: "poorgoat",
    name: "POORGOAT",
    title: "The Conviction Bull",
    role: "trader",
    specialty: "Relative strength · momentum setups",
    strategy: "relative_strength",
    description:
      "Conviction is a hypothesis. Relative strength is the evidence.",
    story:
      "The floor’s stubborn bull looks for strength against the observed peer group. Enthusiasm never bypasses the execution gates.",
    quote: "Conviction still needs confirmation.",
    peers: ["alon", "ansem"],
    image: "poorgoat",
    desk: "poorgoat",
    implemented: true,
  },
  {
    id: "juniper",
    slug: "jack-duval",
    name: "JACK DUVAL",
    title: "The Truffle Hunter",
    role: "trader",
    specialty: "New-pair discovery · volume expansion",
    strategy: "volume",
    description: "Nose to the floor. Eyes on the actual volume.",
    story:
      "JACK prowls the hall for overlooked pairs. His volume research book is independent of the original shared account.",
    quote: "Interesting scent. Where is the volume?",
    peers: ["alon", "rasmr"],
    image: "jack",
    desk: "jack",
    implemented: true,
  },
  {
    id: "kit",
    slug: "ansem",
    name: "ANSEM",
    title: "The Narrative Strategist",
    role: "trader",
    specialty: "Trend research · entry-risk review",
    strategy: "trend",
    description:
      "A compelling narrative still has to survive the chart and the gates.",
    story:
      "From a gold-framed monitor, ANSEM studies the existing trend evaluator. Indicators are observations, never a promise.",
    quote: "Let the trend confirm the story.",
    peers: ["thread-guy", "poorgoat"],
    image: "ansem",
    desk: "ansem",
    implemented: true,
  },
  {
    id: "rowan",
    slug: "frank",
    name: "FRANK",
    title: "The Sentiment Operator",
    role: "trader",
    specialty: "Momentum research · shared paper execution",
    strategy: "momentum",
    description:
      "Tracks the conversation without pretending to know the whole crowd.",
    story:
      "FRANK reads bounded social evidence and presents the momentum research portfolio. Social cues do not override the paper risk policy.",
    quote: "Unknown sentiment stays unknown.",
    peers: ["rasmr", "thread-guy"],
    image: "frank",
    desk: "frank",
    implemented: true,
  },
  {
    id: "tove",
    slug: "kimchi",
    name: "KIMCHI",
    title: "The Steady Operator",
    role: "trader",
    specialty: "Breakout research · portfolio review",
    strategy: "breakout",
    description:
      "Patient entries. Measured exits. No victory lap without a receipt.",
    story:
      "KIMCHI keeps the floor honest about its positions and outcomes, while presenting the separate breakout evaluator.",
    quote: "No confirmation, no hurry.",
    peers: ["alon", "ansem"],
    image: "kimchi",
    desk: "kimchi",
    implemented: true,
  },
  {
    id: "sable",
    slug: "rasmr",
    name: "RASMR",
    title: "The Attention Scanner",
    role: "scanner",
    specialty: "Public X discovery · attention evidence",
    description:
      "Finds public links and hands off what can actually be observed.",
    story:
      "RASMR searches the available public surface around observed markets. Global virality and community growth remain unknown without evidence.",
    quote: "Attention is a lead, not a fill.",
    peers: ["thread-guy", "frank"],
    image: "rasmr",
    desk: "rasmr",
    implemented: true,
  },
  {
    id: "nova",
    slug: "thread-guy",
    name: "THREAD GUY",
    title: "The Narrative Scanner",
    role: "scanner",
    specialty: "Public-post review · bounded excerpt synthesis",
    description: "Connects available excerpts, with the limits kept in view.",
    story:
      "The public reviewer examines confirmed post URLs in a bounded window. Full threads, global trends and private conversations are outside his view.",
    quote: "Read the source before the story.",
    peers: ["rasmr", "ansem"],
    image: "threadguy",
    desk: "threadguy",
    implemented: true,
  },
  {
    id: "delta",
    slug: "toly",
    name: "TOLY",
    title: "The Core Builder",
    role: "coder",
    specialty: "Data infrastructure diagnostics",
    description:
      "Keeps the floor aware of feed freshness and infrastructure health.",
    story:
      "TOLY’s testbench displays deterministic diagnostics. The current runtime does not autonomously edit code or run builds.",
    quote: "Check the receipt, then check the clock.",
    peers: ["mert", "raj"],
    image: "toly",
    desk: "toly",
    implemented: true,
  },
  {
    id: "pixel",
    slug: "mert",
    name: "MERT",
    title: "The Infra Operator",
    role: "coder",
    specialty: "Scanner tooling · market diagnostics",
    description: "Watches the tooling behind the trading floor.",
    story:
      "MERT inspects observed quote counts, scanner output and entry eligibility. Direct RPC and validator health are not available in this HTTP-fed runtime.",
    quote: "Unknown health is not healthy.",
    peers: ["toly", "raj"],
    image: "mert",
    desk: "mert",
    implemented: true,
  },
  {
    id: "echo",
    slug: "raj",
    name: "RAJ",
    title: "The Ecosystem Architect",
    role: "coder",
    specialty: "Product integration · bridge diagnostics",
    description: "Connects the visible headquarters to its actual data flow.",
    story:
      "RAJ presents agent and panel diagnostics from the bridge. Published payloads alone do not prove GPU delivery or completed engineering work.",
    quote: "A published panel still needs to render.",
    peers: ["toly", "jacob"],
    image: "raj",
    desk: "raj",
    implemented: true,
  },
  {
    id: "byte",
    slug: "jacob",
    name: "JACOB",
    title: "The AI Builder",
    role: "coder",
    specialty: "Planned persona · existing strategy-monitor seat",
    description:
      "The next identity on the floor. The source runtime still calls this seat Byte.",
    story:
      "JACOB is the requested future persona for the final coder seat. No JACOB model, autonomous AI worker or completed coding history was found in the inspected source.",
    quote: "First, make the evidence visible.",
    peers: ["raj", "mert"],
    image: null,
    desk: "toly",
    implemented: false,
  },
];
export const getAgent = (id: string) =>
  agents.find((a) => a.id === id || a.slug === id);
