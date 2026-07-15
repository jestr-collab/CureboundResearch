export type Partner = {
  name: string;
  role: string;
};

export type Program = {
  id: string;
  pi: string;
  cancerArea: string;
  institution: string;
  city: string;
  state: string;
  priority: boolean;
  partners: Partner[];
};

export const PROGRAMS: Program[] = [
  {
    id: "rao",
    pi: "Dr. Rao",
    cancerArea: "HNSCC / Head & Neck",
    institution: "UCSF",
    city: "San Francisco",
    state: "CA",
    priority: false,
    partners: [{ name: "Jennifer Rubin Grandis", role: "Collaborator" }],
  },
  {
    id: "friedman",
    pi: "Dr. Friedman",
    cancerArea: "Cancer Detection / Ototoxicity",
    institution: "California Institute of Technology",
    city: "Pasadena",
    state: "CA",
    priority: false,
    partners: [
      { name: "Andre Hoelz", role: "Partner PI" },
      { name: "Chris Bley", role: "Collaborator" },
      { name: "George Mobbs", role: "Collaborator" },
    ],
  },
  {
    id: "varner",
    pi: "Dr. Varner",
    cancerArea: "Renal Cell Carcinoma",
    institution: "UCSF",
    city: "San Francisco",
    state: "CA",
    priority: false,
    partners: [
      { name: "Ahmed Abdelhak", role: "Co-PI" },
      { name: "Ari Green", role: "Co-PI" },
    ],
  },
  {
    id: "alexandrov",
    pi: "Dr. Alexandrov",
    cancerArea: "Pancreatic Cancer / AI Detection",
    institution: "UC Berkeley",
    city: "Berkeley",
    state: "CA",
    priority: false,
    partners: [{ name: "Adam Yala", role: "Collaborator" }],
  },
  {
    id: "evans",
    pi: "Dr. Evans",
    cancerArea: "Colorectal Cancer",
    institution: "MD Anderson Cancer Center",
    city: "Houston",
    state: "TX",
    priority: true,
    partners: [{ name: "Scott Kopetz", role: "Collaborator" }],
  },
  {
    id: "olson",
    pi: "Dr. Olson",
    cancerArea: "Bladder Cancer",
    institution: "University of Arizona",
    city: "Tucson",
    state: "AZ",
    priority: true,
    partners: [{ name: "Dan Theodorescu", role: "Collaborator" }],
  },
];

export type StateAgg = {
  state: string;
  name: string;
  programs: Program[];
  programCount: number;
  partnerCount: number;
  institutions: string[];
  priorityCount: number;
};

export function aggregateByState(
  stateNames: Record<string, string>,
): Record<string, StateAgg> {
  const map: Record<string, StateAgg> = {};
  for (const p of PROGRAMS) {
    if (!map[p.state]) {
      map[p.state] = {
        state: p.state,
        name: stateNames[p.state] ?? p.state,
        programs: [],
        programCount: 0,
        partnerCount: 0,
        institutions: [],
        priorityCount: 0,
      };
    }
    const agg = map[p.state];
    agg.programs.push(p);
    agg.programCount += 1;
    agg.partnerCount += p.partners.length;
    if (!agg.institutions.includes(p.institution)) {
      agg.institutions.push(p.institution);
    }
    if (p.priority) agg.priorityCount += 1;
  }
  return map;
}
