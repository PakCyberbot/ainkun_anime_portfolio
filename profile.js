// Edit this file to personalize the portfolio. Empty URLs show a clear placeholder.
window.PORTFOLIO = {
  name: "Muhammad Hussain Kas",
  description: "Exploring the attack surface. Understanding the threat. Building a safer digital world — one discovery at a time.",
  about: "I'm Muhammad Hussain Kas, known online as ainkun. As a cybersecurity analyst, I'm drawn to understanding how systems work, where they can break, and how to defend them. Curiosity drives the investigation; a defender's mindset gives it purpose.",
  // Adjust these areas to reflect your actual skills.
  skills: ["Threat analysis", "Network security", "Security research", "Incident response", "Linux", "Python"],
  // The collectible card opened by clicking the hero avatar. All text is editable.
  analystCard: {
    name: "ainkun",
    japaneseName: "アインくん",
    stage: "ANALYST",
    role: "Cybersecurity Analyst",
    type: "INQUIRY TYPE",
    number: "001",
    statLabel: "CURIOSITY",
    statValue: "∞", // Decorative card flavor, not a skill rating or certification.
    mainImage: "card-main-image.jpeg",
    mainVideo: "card-back-main-clip.mp4", // Muted loop; mainImage is its poster/fallback.
    mainImageAlt: "A thoughtful anime character in a quiet moment",
    portraitImage: "card-top-left-small.jpeg?v=d738260b", // Refresh cached copies after replacing the portrait.
    portraitImageAlt: "The supplied corner portrait for ainkun's card",
    imagePosition: "center 43%",
    ability: {
      title: "A defender's instinct",
      description: "Look beneath the surface. Ask better questions. Keep learning."
    },
    techniques: [
      { symbol: "◎", title: "Threat analysis", description: "Follow the clues. Understand the threat.", tag: "INVESTIGATE" },
      { symbol: "◇", title: "Security research", description: "Explore how systems work and how to defend them.", tag: "EXPLORE" }
    ],
    traits: [
      { label: "MINDSET", value: "Stay curious" },
      { label: "TOOLS", value: "Linux · Python" },
      { label: "GROWTH", value: "Every day" }
    ],
    motto: "A curious mind. A defender's instinct.",
    edition: "PERSONAL COLLECTION / 01"
  },
  blog: { feed: "data/medium.json", maxPosts: 10 },
  socials: { github: "", medium: "https://ainkun.medium.com", linkedin: "", x: "", email: "" }, // email: plain email address
  projects: [
    { title: "Threat investigation", category: "01 / ANALYSIS", description: "Add an investigation: the problem, your approach, tools used, and what you discovered.", tags: ["Threat analysis", "Investigation"], url: "", icon: "◎" },
    { title: "Security lab", category: "02 / HANDS-ON", description: "Showcase a home lab or security experiment. Add screenshots, methods, and lessons learned.", tags: ["Lab", "Detection"], url: "", icon: "⌘" },
    { title: "Tools & automation", category: "03 / BUILD", description: "Feature a script or tool you created. Explain what it solves and link to your repository.", tags: ["Python", "Automation"], url: "", icon: "⟨/⟩" }
  ],
  achievements: [
    { title: "Your certification", description: "Add the certification name, issuer, and verification link.", year: "YEAR", type: "CERTIFICATION", url: "" },
    { title: "Your competition or CTF", description: "Add an event, your result, and a short description of the challenge.", year: "YEAR", type: "COMPETITION", url: "" },
    { title: "Your research milestone", description: "Add a published finding, recognition, or learning milestone.", year: "YEAR", type: "RESEARCH", url: "" }
  ]
};
