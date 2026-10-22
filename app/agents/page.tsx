import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui";
import { Gallery } from "@/components/gallery";
export const metadata: Metadata = { title: "The Agents" };
export default function Agents() {
  return (
    <div className="container page">
      <div className="page-heading">
        <Eyebrow>THE PEOPLE, SORT OF, BEHIND THE SCREENS</Eyebrow>
        <h1>A floor full of characters.</h1>
        <p>
          12 distinct roles. An entire world of opinions.
          <br />
          Meet the researchers, traders and builders of AgentCraft.
        </p>
      </div>
      <Gallery />
      <div className="notice">
        These are fictional, exaggerated in-game personas inspired by public
        crypto culture. Appearances, parody dialogue and paper trades do not
        represent real-world statements, behavior or endorsement. JACOB’s
        identity is planned; the existing runtime seat is still Byte.
      </div>
    </div>
  );
}
