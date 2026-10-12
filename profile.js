// Edit this file to personalize the portfolio. Empty URLs show a clear placeholder.
window.PORTFOLIO = {
  name: "ainkun",
  description: "Reverse engineering, mobile security, and offensive research. From CTF challenges to real-world attack surfaces — always curious about what lies underneath.",
  about: "I'm Hussain, known as ainkun — a Security Researcher and an active CTF player. Competing in many CTFs has shaped how I approach unfamiliar systems: break a problem down, follow the evidence, and keep experimenting. My interests span reverse engineering, malware analysis and development, mobile security, red teaming, and vulnerability research. I work across cryptography, reversing, programming, Android security, and AI automation, bringing a hands-on, offensive perspective to the questions I explore.",
  // Adjust these areas to reflect your actual skills.
  skills: ["Cryptography", "Reversing", "Programming", "Malware Dev", "Android Security", "AI Automation"],
  // The collectible card opened by clicking the hero avatar. All text is editable.
  analystCard: {
    name: "ainkun",
    japaneseName: "アインくん",
    stage: "RESEARCHER",
    role: "Security Researcher",
    type: "RECON TYPE",
    number: "001",
    statLabel: "CURIOSITY",
    statValue: "∞", // Decorative card flavor, not a skill rating or certification.
    mainImage: "", // Optional poster/fallback; leave empty for video only.
    mainVideo: "card-back-main-clip.mp4", // Muted loop.
    mainImageAlt: "",
    portraitImage: "card-top-left-small.jpeg?v=d738260b", // Refresh cached copies after replacing the portrait.
    portraitImageAlt: "The supplied corner portrait for ainkun's card",
    imagePosition: "center 43%",
    ability: {
      title: "An offensive mindset",
      description: "Map the surface. Question the assumptions. Trace the attack path."
    },
    techniques: [
      { symbol: "◎", title: "Reverse Engineering", description: "Binary analysis and malware reversing.", tag: "REVERSE" },
      { symbol: "◇", title: "Mobile Security", description: "Explore Android internals and mobile attack surfaces.", tag: "MOBILE" }
    ],
    stats: ["Cryptography", "Reversing", "Programming", "Malware Dev", "Android Security", "AI Automation"],
    motto: "A curious mind. An offensive mindset.",
    edition: "PERSONAL COLLECTION / 01"
  },
  blog: { feed: "data/medium.json", maxPosts: 10 },
  socials: { github: "https://github.com/ainkun", medium: "https://ainkun.medium.com/", linkedin: "https://www.linkedin.com/in/ainkun/", x: "https://x.com/ain__kun", email: "contact@ainkun.com" }, // email: plain email address
  projects: [
    { title: "Deep Learning Side-Channel Attack on AES-128 in IoT Devices", category: "01 / UNIVERSITY FYDP", description: "Final-year project recovering AES-128 encryption keys from IoT hardware by training deep learning models on power side-channel traces. Applied cryptography meets hardware attack research.", tags: ["AES-128", "IoT Hardware", "Deep Learning", "Side Channels"], url: "", icon: "◎" },
    { title: "CyberSents CTF 2025 Challenges", category: "02 / CTF CHALLENGE AUTHOR", description: "Created challenges for CyberSents CTF 2025. Explore the challenge collection and solutions on GitHub.", tags: ["CTF", "Challenge Design", "2025"], url: "https://github.com/ainkun/my-ctf-challenges", linkLabel: "View challenges and solutions", icon: "⌘" }
  ],
  achievements: [
    { title: "Ignite Cyber Hackathon — 2nd Place", description: "Our team secured second place at the Ignite 2024 Cyber Hackathon.", year: "2024", type: "TEAM ACHIEVEMENT", url: "" },
    { title: "Black Hat MEA — Finalist", description: "Reached the Black Hat MEA finals in three consecutive years: 2023, 2024, and 2025.", year: "2023–2025", type: "CTF FINALIST", url: "" }
  ]
};
