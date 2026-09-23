import afterZhaoYipeng from "../assets/images/tang-yin/after-zhao-yipeng.jpg";
import attributedHangingRainbow from "../assets/images/tang-yin/attributed-hanging-rainbow.jpg";
import secureDrunkenFisherman from "../assets/images/tang-yin/secure-drunken-fisherman.jpg";

/**
 * Three works from the Metropolitan Museum of Art, carrying the three levels
 * of confidence the Met's own cataloguers assign to the Tang Yin corpus:
 * a secure attribution, a contested one, and a later copy.
 *
 * Every field here is transcribed from the Met's Open Access record for the
 * accession number given --- attribution wording, title, date phrasing,
 * medium and credit line are the museum's, not ours. The point of the
 * component that renders this is that the museum said it, so paraphrasing
 * any of it would defeat the exercise. Check changes against
 * `https://collectionapi.metmuseum.org/public/collection/v1/objects/<id>`.
 *
 * All three are flagged `isPublicDomain` by the Met and are released under
 * its Open Access (CC0) terms; Tang Yin died in the 1520s, so the underlying
 * works are long out of copyright.
 */
export interface LadderEntry {
  /** The Met's own attribution line, verbatim. The whole exhibit. */
  attribution: string;
  /** How certain that attribution is, in the museum's terms. */
  confidence: "secure" | "contested" | "copy";
  /** One line on what that level of confidence actually means. */
  gloss: string;
  title: string;
  date: string;
  medium: string;
  creditLine: string;
  accession: string;
  objectUrl: string;
  image: ImageMetadata;
  alt: string;
}

export const attributionLadder: LadderEntry[] = [
  {
    attribution: "Tang Yin",
    confidence: "secure",
    gloss: "No qualifier. The museum is prepared to say he painted it.",
    title: "Drunken fisherman by a reed bank",
    date: "early 16th century",
    medium: "Hanging scroll; ink on paper",
    creditLine: "Bequest of John M. Crawford Jr., 1988",
    accession: "1989.363.55",
    objectUrl: "https://www.metmuseum.org/art/collection/search/45760",
    image: secureDrunkenFisherman,
    alt: "Ink hanging scroll: a fisherman slumped in a small boat against a bank of reeds, painted in loose wet strokes with large areas of bare paper.",
  },
  {
    attribution: "Attributed to Tang Yin",
    confidence: "contested",
    gloss: "Two words of doubt. Same bequest as the scroll on its left.",
    title: "Farewell at the Bridge of the Hanging Rainbow",
    date: "datable to 1508",
    medium: "Handscroll; ink on paper",
    creditLine: "Bequest of John M. Crawford Jr., 1988",
    accession: "1989.363.53",
    objectUrl: "https://www.metmuseum.org/art/collection/search/45752",
    image: attributedHangingRainbow,
    alt: "Ink handscroll, far wider than it is tall: a river landscape with a bridge, figures parting on the near bank, and low hills receding into empty paper.",
  },
  {
    attribution: "After Tang Yin",
    confidence: "copy",
    gloss: "Someone else's hand, working from his. Still worth keeping.",
    title: "Landscape for Zhao Yipeng",
    date: "late 15th–early 16th century",
    medium: "Hanging scroll; ink and color on silk",
    creditLine: "Purchase, Bequest of Dorothy Graham Bennett, 1967",
    accession: "67.6.1",
    objectUrl: "https://www.metmuseum.org/art/collection/search/36093",
    image: afterZhaoYipeng,
    alt: "Tall hanging scroll on silk: a steep landscape of layered peaks and pine, with a small pavilion and figures at the foot of the composition.",
  },
];

/** Shared attribution for the strip as a whole. */
export const ladderSource = {
  institution: "The Metropolitan Museum of Art",
  terms: "Open Access (CC0)",
  url: "https://www.metmuseum.org/art/collection",
};
