const { useEffect, useMemo, useState } = React;

const STORAGE_KEY = "readquest.save.v1";
const ACCOUNTS_KEY = "readquest.accounts.v1";
const CURRENT_ACCOUNT_KEY = "readquest.currentAccount.v1";
const ADMIN_EMAIL = "admin@readquest.com";
const ADMIN_PASSWORD = "328729";

const genres = ["Fantasy", "Sci-Fi", "Mystery", "History", "Romance", "Nonfiction"];

const startingBooks = [];
const startingActivity = [];

const skillTrees = [
  {
    name: "Reader Stats",
    skills: [
      { id: "speed", name: "Speed Reader", description: "+5% XP per page", cost: 1, maxRank: 3 },
      { id: "night", name: "Night Owl", description: "Streak bonus at night", cost: 1, maxRank: 3 },
      { id: "biblio", name: "Bibliophile", description: "+50 XP per completed book", cost: 2, maxRank: 3 },
    ],
  },
  {
    name: "Combat Stats",
    skills: [
      { id: "sword", name: "Sword Arm", description: "+10 ATK", cost: 1, maxRank: 3 },
      { id: "will", name: "Iron Will", description: "+15 HP", cost: 1, maxRank: 3 },
      { id: "reflex", name: "Quick Reflexes", description: "+8% dodge chance", cost: 1, maxRank: 3 },
    ],
  },
  {
    name: "Avatar Perks",
    skills: [
      { id: "fashion", name: "Fashionista", description: "Unlock rare avatar items", cost: 2, maxRank: 3 },
      { id: "treasure", name: "Treasure Hunter", description: "+1 coin per 5 pages", cost: 1, maxRank: 3 },
    ],
  },
];

const cosmeticItems = {
  Hair: [
    { id: "hair-raven", name: "Raven Locks", price: 0, preview: "Ink" },
    { id: "hair-silver", name: "Silver Braid", price: 120, preview: "Ice" },
    { id: "hair-ember", name: "Ember Crown", price: 260, preview: "Fire" },
  ],
  Outfit: [
    { id: "outfit-apprentice", name: "Apprentice Robe", price: 0, preview: "Robe" },
    { id: "outfit-ranger", name: "Ranger Cloak", price: 180, preview: "Leaf" },
    { id: "outfit-royal", name: "Royal Mantle", price: 520, preview: "Gold" },
  ],
  Accessories: [
    { id: "acc-none", name: "No Accessory", price: 0, preview: "-" },
    { id: "acc-moon", name: "Moon Amulet", price: 220, preview: "Moon" },
    { id: "acc-dragon", name: "Dragon Pin", price: 650, preview: "Wing" },
  ],
};

const weapons = [
  { id: "wood-staff", name: "Wooden Staff", price: 50, atk: 4, preview: "Staff" },
  { id: "iron-sword", name: "Iron Sword", price: 150, atk: 10, preview: "Blade" },
  { id: "silver-bow", name: "Silver Bow", price: 400, atk: 18, preview: "Bow" },
  { id: "dragon-spear", name: "Dragon Spear", price: 900, atk: 30, preview: "Spear" },
  { id: "ancient-tome", name: "Tome of Ancients", price: 2000, atk: 46, preview: "Tome" },
];

const stages = [
  { id: 1, name: "Chapter 1: Lanternwood", minLevel: 1, boss: "Moss King", item: "Lantern Pin" },
  { id: 2, name: "Chapter 2: Crystal Caves", minLevel: 5, boss: "Quartz Warden", item: "Crystal Circlet" },
  { id: 3, name: "Chapter 3: Storm Archive", minLevel: 10, boss: "Thunder Scribe", item: "Storm Cloak" },
  { id: 4, name: "Chapter 4: Ashen Citadel", minLevel: 18, boss: "Cinder Knight", item: "Ashen Helm" },
  { id: 5, name: "Chapter 5: Starfall Keep", minLevel: 28, boss: "Astral Regent", item: "Star Tome" },
];

const enemyNames = ["Page Imp", "Ink Slime", "Bookmark Bandit"];

const defaultGameState = {
  books: startingBooks,
  activity: startingActivity,
  xp: 0,
  coins: 0,
  totalCoinsEarned: 0,
  skillPoints: 0,
  skills: { speed: 0, night: 0, biblio: 0, sword: 0, will: 0, reflex: 0, fashion: 0, treasure: 0 },
  streak: 0,
  inventory: ["hair-raven", "outfit-apprentice", "acc-none", "wood-staff"],
  equipped: { hair: "hair-raven", outfit: "outfit-apprentice", accessory: "acc-none", weapon: "wood-staff" },
  adventureProgress: { enemiesDefeated: 0, bossesDefeated: 0, clearedStages: [], rewards: [] },
  achievements: [],
  adminLog: [],
  settings: { darkMode: true, displayName: "Reader", seenOnboarding: false },
};

const achievementsCatalog = [
  { id: "first-chapter", name: "First Chapter", description: "Log pages for your first book.", test: ({ activity }) => activity.length >= 1 },
  { id: "century", name: "Century", description: "Read 100 pages total.", test: ({ stats }) => stats.pages >= 100 },
  { id: "bookworm", name: "Bookworm", description: "Complete 5 books.", test: ({ stats }) => stats.completed >= 5 },
  { id: "unstoppable", name: "Unstoppable", description: "Reach a 7-day reading streak.", test: ({ streak }) => streak >= 7 },
  { id: "dragon-slayer", name: "Dragon Slayer", description: "Defeat your first boss.", test: ({ adventureProgress }) => adventureProgress.bossesDefeated >= 1 },
  { id: "chapter-cleared", name: "Chapter Cleared", description: "Clear one adventure chapter.", test: ({ adventureProgress }) => adventureProgress.clearedStages.length >= 1 },
  { id: "level-five", name: "Rising Hero", description: "Reach level 5.", test: ({ levelInfo }) => levelInfo.level >= 5 },
  { id: "skill-initiate", name: "Skill Initiate", description: "Buy your first skill rank.", test: ({ skills }) => Object.values(skills).some((rank) => rank > 0) },
  { id: "coin-collector", name: "Coin Collector", description: "Earn 500 gold total.", test: ({ totalCoinsEarned }) => totalCoinsEarned >= 500 },
  { id: "library-builder", name: "Library Builder", description: "Add 10 books to your library.", test: ({ books }) => books.length >= 10 },
  { id: "boss-hunter", name: "Boss Hunter", description: "Defeat 3 bosses.", test: ({ adventureProgress }) => adventureProgress.bossesDefeated >= 3 },
  { id: "style-quest", name: "Style Quest", description: "Own 6 avatar items.", test: ({ inventory }) => inventory.length >= 6 },
];

function loadGameState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return sanitizeGameState(saved);
  } catch {
    return sanitizeGameState();
  }
}

function cloneGameState(state = defaultGameState) {
  return JSON.parse(JSON.stringify(state));
}

function sanitizeGameState(saved) {
  if (!saved) return cloneGameState();
  return {
      ...defaultGameState,
      ...saved,
      books: saved.books || defaultGameState.books,
      activity: saved.activity || defaultGameState.activity,
      skills: { ...defaultGameState.skills, ...(saved.skills || {}) },
      equipped: { ...defaultGameState.equipped, ...(saved.equipped || {}) },
      adventureProgress: { ...defaultGameState.adventureProgress, ...(saved.adventureProgress || {}) },
      achievements: saved.achievements || defaultGameState.achievements,
      adminLog: saved.adminLog || defaultGameState.adminLog,
      settings: { ...defaultGameState.settings, ...(saved.settings || {}) },
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function loadAccounts() {
  try {
    const savedAccounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));
    const accounts = Array.isArray(savedAccounts) ? savedAccounts : [];
    const normalized = accounts
      .map((account) => ({
        email: normalizeEmail(account.email),
        password: String(account.password || ""),
        isAdmin: Boolean(account.isAdmin),
        gameState: sanitizeGameState(account.gameState),
      }))
      .filter((account) => account.email);
    const adminIndex = normalized.findIndex((account) => account.email === ADMIN_EMAIL);
    if (adminIndex >= 0) {
      normalized[adminIndex] = { ...normalized[adminIndex], password: ADMIN_PASSWORD, isAdmin: true };
      return normalized;
    }
    const legacyGameState = loadGameState();
    return [
      {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        isAdmin: true,
        gameState: { ...legacyGameState, settings: { ...legacyGameState.settings, displayName: "Admin" } },
      },
      ...normalized,
    ];
  } catch {
    return [{ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, isAdmin: true, gameState: { ...cloneGameState(), settings: { ...defaultGameState.settings, displayName: "Admin" } } }];
  }
}

function xpForLevel(level) {
  const safeLevel = Math.max(1, Math.floor(Number(level)) || 1);
  let total = 0;
  for (let current = 1; current < safeLevel; current += 1) {
    total += current * 150;
  }
  return total;
}

function h(type, props, ...children) {
  return React.createElement(type, props || {}, ...children.flat());
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function initials(title) {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function progressPercent(book) {
  return Math.min(100, Math.round((book.pagesRead / book.totalPages) * 100));
}

function pagesRemaining(book) {
  return Math.max(0, book.totalPages - book.pagesRead);
}

function levelForXp(xp) {
  let level = 1;
  let remaining = xp;
  while (remaining >= level * 150) {
    remaining -= level * 150;
    level += 1;
  }
  return { level, current: remaining, needed: level * 150 };
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function Button({ children, className = "", ...props }) {
  return h("button", { className: `btn ${className}`, ...props }, children);
}

function StatCard({ icon, value, label, tone }) {
  return h(
    "article",
    { className: `stat-card ${tone}` },
    h("span", { className: "stat-icon" }, icon),
    h("strong", null, value),
    h("p", null, label)
  );
}

function ProgressBar({ value, label }) {
  return h(
    "div",
    { className: "progress-wrap", "aria-label": label },
    h("div", { className: "progress-bar", style: { width: `${clamp(value, 0, 100)}%` } })
  );
}

function Toast({ toast, onDone }) {
  if (!toast) return null;
  return h(
    "div",
    {
      className: "toast",
      onAnimationEnd: onDone,
    },
    toast
  );
}

function LoginPage({ authMode, setAuthMode, onLogin, onRegister }) {
  const isRegister = authMode === "register";
  return h(
    "main",
    { className: "auth-page" },
    h(
      "section",
      { className: "auth-panel" },
      h("h1", null, "ReadQuest"),
      h("p", null, isRegister ? "Create a reader account to begin." : "Sign in to continue your quest."),
      h(
        "form",
        { className: "form-grid", onSubmit: isRegister ? onRegister : onLogin },
        h("label", null, "Email", h("input", { name: "email", type: "email", required: true, autoFocus: true })),
        h("label", null, "Password", h("input", { name: "password", type: "password", required: true })),
        h(Button, { type: "submit" }, isRegister ? "Create Account" : "Sign In")
      ),
      h(
        "button",
        { className: "link-btn", onClick: () => setAuthMode(isRegister ? "login" : "register") },
        isRegister ? "Use an existing account" : "Create a reader account"
      )
    )
  );
}

function Nav({ page, setPage, levelInfo, coins, streakMultiplier, coinFloat, isAdmin, currentEmail, onLogout }) {
  const links = ["Home", "My Books", "Avatar", "Adventure", "Achievements", ...(isAdmin ? ["Admin"] : []), "Settings"];
  return h(
    "nav",
    { className: "top-nav" },
    h("button", { className: "brand", onClick: () => setPage("Home") }, "ReadQuest"),
    h(
      "div",
      { className: "nav-center" },
      h("span", { className: "level-badge" }, `Lv. ${levelInfo.level}`),
      h("div", { className: "nav-xp" }, h("span", null, `${levelInfo.current}/${levelInfo.needed} XP`), h(ProgressBar, { value: (levelInfo.current / levelInfo.needed) * 100 })),
      h("span", { className: "coin-badge coin-wrap" }, `Gold ${coins}`, coinFloat && h("b", { key: coinFloat.id, className: "coin-float" }, `+${coinFloat.amount}`)),
      h("span", { className: "streak-badge" }, `${streakMultiplier}x streak`)
    ),
    h(
      "div",
      { className: "nav-links" },
      links.map((link) =>
        h(
          "button",
          { key: link, className: page === link ? "active" : "", onClick: () => setPage(link) },
          link
        )
      ),
      h("span", { className: "account-badge" }, currentEmail),
      h("button", { onClick: onLogout }, "Log Out")
    )
  );
}

function HomePage({ books, activity, stats, onLog, setPage, levelInfo, streakMultiplier, skills, skillPoints, buySkill, displayName }) {
  const activeBook = books.find((book) => book.status === "Reading" && pagesRemaining(book) > 0) || books.find((book) => book.status !== "Completed" && pagesRemaining(book) > 0);
  const nextBook = books.find((book) => book.status === "Want to Read");
  const activeCount = books.filter((book) => book.status === "Reading" && pagesRemaining(book) > 0).length;
  const completionRate = books.length ? Math.round((stats.completed / books.length) * 100) : 0;
  return h(
    "main",
    { className: "page home-page" },
    h(
      "section",
      { className: "hero-grid" },
      h(StatCard, { icon: "P", value: stats.pages, label: "Total Pages Read", tone: "gold" }),
      h(StatCard, { icon: "B", value: stats.completed, label: "Books Completed", tone: "violet" }),
      h(StatCard, { icon: "S", value: stats.streak, label: "Current Reading Streak", tone: "green" }),
      h(StatCard, { icon: "X", value: stats.xp, label: "Total XP Earned", tone: "blue" })
    ),
    h(
      "section",
      { className: "dashboard-grid" },
      h(
        "article",
        { className: "wide-panel xp-panel dashboard-hero" },
        h("div", null, h("span", { className: "eyebrow" }, "Hero Progress"), h("h2", null, `${displayName}'s ReadQuest`), h("p", null, `Level ${levelInfo.level} quester, ${levelInfo.needed - levelInfo.current} XP to next level`)),
        h("span", { className: "streak-badge large" }, `${streakMultiplier}x active multiplier`),
        h(ProgressBar, { value: (levelInfo.current / levelInfo.needed) * 100 })
      ),
      h(
        "aside",
        { className: "panel dashboard-summary" },
        h("h2", null, "Quest Snapshot"),
        h("div", { className: "summary-row" }, h("span", null, "Active books"), h("strong", null, activeCount)),
        h("div", { className: "summary-row" }, h("span", null, "Completion"), h("strong", null, `${completionRate}%`)),
        h("div", { className: "summary-row" }, h("span", null, "Next up"), h("strong", null, nextBook ? nextBook.title : "Add a book")),
        h(Button, { className: "secondary", onClick: () => setPage("My Books") }, books.length ? "Manage Library" : "Add First Book")
      )
    ),
    h(
      "section",
      { className: "content-grid" },
      h(
        "article",
        { className: "panel currently-reading" },
        h("h2", null, "Currently Reading"),
        activeBook
          ? h(
              "div",
              { className: "book-row" },
              h("div", { className: "cover" }, activeBook.coverUrl ? h("img", { src: activeBook.coverUrl, alt: "" }) : initials(activeBook.title)),
              h(
                "div",
                { className: "book-main" },
                h("h3", null, activeBook.title),
                h("p", null, activeBook.author),
                h(ProgressBar, { value: progressPercent(activeBook) }),
                h("small", null, `${activeBook.pagesRead} / ${activeBook.totalPages} pages - ${pagesRemaining(activeBook)} left`)
              ),
              h(Button, { onClick: () => onLog(activeBook.id) }, "+ Log Pages")
            )
          : h("p", null, books.length ? "All caught up. Add another book to keep earning reading XP." : "Add a book to begin your reading quest.")
      ),
      h(
        "article",
        { className: "panel activity-feed" },
        h("h2", null, "Recent Activity"),
        activity.length
          ? activity.slice(0, 5).map((entry) =>
              h("div", { key: entry.id, className: "activity-item" }, h("span", null, entry.date), h("strong", null, entry.title), h("em", null, `${entry.pages} pages`), h("b", null, `+${entry.xp} XP`))
            )
          : h("p", null, "Your quest log is waiting for its first entry.")
      )
    ),
    h(SkillTree, { skills, skillPoints, buySkill })
  );
}

function SkillTree({ skills, skillPoints, buySkill }) {
  return h(
    "section",
    { className: "wide-panel skill-tree" },
    h("div", { className: "section-heading" }, h("h2", null, "Skill Tree"), h("span", { className: "skill-points" }, `${skillPoints} points`)),
    h(
      "div",
      { className: "tree-grid" },
      skillTrees.map((tree) =>
        h(
          "article",
          { key: tree.name, className: "tree-panel" },
          h("h3", null, tree.name),
          tree.skills.map((skill) => {
            const rank = skills[skill.id] || 0;
            const locked = skillPoints < skill.cost || rank >= skill.maxRank;
            return h(
              "button",
              { key: skill.id, className: `skill-node ${locked ? "locked" : ""}`, onClick: () => buySkill(skill), disabled: locked },
              h("strong", null, skill.name),
              h("span", null, skill.description),
              h("small", null, `Rank ${rank}/${skill.maxRank} - Cost ${skill.cost}`)
            );
          })
        )
      )
    )
  );
}

function BooksPage({ books, filter, setFilter, onAddBook, onLog }) {
  const visibleBooks = filter === "All" ? books : books.filter((book) => book.status === filter);
  return h(
    "main",
    { className: "page" },
    h("div", { className: "section-heading" }, h("h1", null, "My Books"), h(Button, { onClick: onAddBook }, "+ Add New Book")),
    h(
      "div",
      { className: "tabs" },
      ["All", "Reading", "Completed", "Want to Read"].map((tab) => h("button", { key: tab, className: filter === tab ? "active" : "", onClick: () => setFilter(tab) }, tab))
    ),
    h(
      "section",
      { className: "book-grid" },
      visibleBooks.map((book) =>
        {
          const complete = pagesRemaining(book) === 0 || book.status === "Completed";
          return h(
            "article",
            { key: book.id, className: `book-card ${complete ? "complete" : ""}` },
            h("div", { className: "cover tall" }, book.coverUrl ? h("img", { src: book.coverUrl, alt: "" }) : initials(book.title)),
            h("span", { className: `status ${book.status.toLowerCase().replaceAll(" ", "-")}` }, complete ? "Completed" : book.status),
            h("h3", null, book.title),
            h("p", null, book.author),
            h("small", null, `${book.genre} - ${book.totalPages} pages`),
            h(ProgressBar, { value: progressPercent(book) }),
            h("small", null, complete ? `${book.totalPages} pages read - ${book.xpEarned} XP` : `${book.pagesRead} pages read - ${pagesRemaining(book)} left`),
            complete
              ? h("span", { className: "complete-pill" }, "Finished")
              : h(Button, { className: "secondary", onClick: () => onLog(book.id) }, "Log Pages")
          );
        }
      )
    )
  );
}

function AvatarDisplay({ equipped }) {
  return h(
    "div",
    { className: "avatar-stage" },
    h("div", { className: `pixel-avatar ${equipped.outfit}` },
      h("span", { className: `hair ${equipped.hair}` }),
      h("span", { className: "face" }),
      h("span", { className: `body ${equipped.outfit}` }),
      h("span", { className: `accessory ${equipped.accessory}` }),
      h("span", { className: `weapon ${equipped.weapon}` })
    )
  );
}

function AvatarPage({ coins, inventory, equipped, setEquipped, buyItem, setPage }) {
  const [tab, setTab] = useState("Hair");
  const shopItems = [...Object.entries(cosmeticItems).flatMap(([type, items]) => items.map((item) => ({ ...item, type }))), ...weapons.map((weapon) => ({ ...weapon, type: "Weapon" }))];
  const tabItems = cosmeticItems[tab];
  return h(
    "main",
    { className: "page avatar-page" },
    h("div", { className: "section-heading" }, h("h1", null, "Avatar"), h("span", { className: "coin-badge large" }, `Gold ${coins}`)),
    h(
      "section",
      { className: "avatar-layout" },
      h("article", { className: "panel avatar-panel" }, h(AvatarDisplay, { equipped }), h(Button, { onClick: () => setPage("Adventure") }, "Enter Adventure")),
      h(
        "article",
        { className: "panel cosmetics-panel" },
        h("div", { className: "tabs" }, ["Hair", "Outfit", "Accessories"].map((name) => h("button", { key: name, className: tab === name ? "active" : "", onClick: () => setTab(name) }, name))),
        h(
          "div",
          { className: "item-grid" },
          tabItems.map((item) => {
            const owned = inventory.includes(item.id);
            return h(
              "button",
              {
                key: item.id,
                className: `shop-card ${owned ? "owned" : "locked"}`,
                onClick: () => owned && setEquipped((current) => ({ ...current, [tab === "Accessories" ? "accessory" : tab.toLowerCase()]: item.id })),
              },
              h("span", null, item.preview),
              h("strong", null, item.name),
              h("small", null, owned ? "Owned" : `Locked - ${item.price}g`)
            );
          })
        )
      )
    ),
    h(
      "section",
      { className: "wide-panel" },
      h("div", { className: "section-heading" }, h("h2", null, "Shop"), h("span", null, "Cosmetics and weapons")),
      h(
        "div",
        { className: "shop-grid" },
        shopItems.map((item) => {
          const owned = inventory.includes(item.id);
          return h(
            "article",
            { key: item.id, className: "shop-card" },
            h("span", null, item.preview),
            h("strong", null, item.name),
            h("small", null, item.atk ? `ATK +${item.atk}` : item.type),
            h(Button, { className: "secondary", onClick: () => buyItem(item), disabled: owned || item.price > coins }, owned ? "Owned" : `Buy ${item.price}g`)
          );
        })
      )
    )
  );
}

function AchievementsPage({ unlocked }) {
  return h(
    "main",
    { className: "page achievements-page" },
    h("div", { className: "section-heading" }, h("h1", null, "Achievements"), h("span", { className: "skill-points" }, `${unlocked.length}/${achievementsCatalog.length} unlocked`)),
    h(
      "section",
      { className: "achievement-grid" },
      achievementsCatalog.map((achievement) => {
        const earned = unlocked.includes(achievement.id);
        return h(
          "article",
          { key: achievement.id, className: `achievement-card ${earned ? "unlocked" : "locked"}` },
          h("span", { className: "achievement-medal" }, earned ? "*" : "?"),
          h("div", null, h("h3", null, achievement.name), h("p", null, achievement.description), h("small", null, earned ? "Unlocked" : "Locked"))
        );
      })
    )
  );
}

function SettingsPage({ settings, setSettings, onReset }) {
  return h(
    "main",
    { className: "page settings-page" },
    h("div", { className: "section-heading" }, h("h1", null, "Settings")),
    h(
      "section",
      { className: "wide-panel settings-panel" },
      h(
        "label",
        { className: "setting-row" },
        h("span", null, h("strong", null, "Display name"), h("small", null, "Shown on your hero progress panel.")),
        h("input", {
          value: settings.displayName,
          maxLength: 24,
          onChange: (event) => setSettings((current) => ({ ...current, displayName: event.target.value })),
        })
      ),
      h(
        "label",
        { className: "setting-row compact" },
        h("span", null, h("strong", null, "Light mode"), h("small", null, "Switch the whole quest journal theme.")),
        h("input", {
          type: "checkbox",
          checked: !settings.darkMode,
          onChange: (event) => setSettings((current) => ({ ...current, darkMode: !event.target.checked })),
        })
      ),
      h(
        "div",
        { className: "setting-row danger-row" },
        h("span", null, h("strong", null, "Reset Progress"), h("small", null, "Clear books, XP, coins, avatar unlocks, achievements, and adventure progress.")),
        h(Button, { className: "danger", onClick: onReset }, "Reset")
      )
    )
  );
}

function AdminPage({ accounts, currentEmail, selectedAccountEmail, setSelectedAccountEmail, targetGameState, onAdjustAdminResource, onSetBookPages, onSetAdminRole }) {
  const targetAccount = accounts.find((account) => account.email === selectedAccountEmail) || accounts[0];
  const selectedGameState = targetGameState || targetAccount?.gameState || defaultGameState;
  const selectedLevel = levelForXp(selectedGameState.xp);
  const isRootAdmin = targetAccount?.email === ADMIN_EMAIL;
  return h(
    "main",
    { className: "page admin-page" },
    h(
      "div",
      { className: "section-heading" },
      h("h1", null, "Admin"),
      h("span", { className: "skill-points" }, `${accounts.length} accounts`)
    ),
    h(
      "section",
      { className: "wide-panel admin-target" },
      h("label", null, "Manage Account", h("select", { value: selectedAccountEmail, onChange: (event) => setSelectedAccountEmail(event.target.value) }, accounts.map((account) => h("option", { key: account.email, value: account.email }, `${account.email}${account.isAdmin ? " - admin" : ""}`)))),
      h("div", { className: "admin-stat-strip" },
        h("span", null, h("strong", null, selectedGameState.coins), " Gold"),
        h("span", null, h("strong", null, selectedGameState.skillPoints), " Skill Points"),
        h("span", null, h("strong", null, selectedLevel.level), " Level"),
        h("span", null, h("strong", null, selectedGameState.books.length), " Books")
      )
    ),
    h(
      "section",
      { className: "admin-layout" },
      h(
        "article",
        { className: "wide-panel admin-panel" },
        h("div", null, h("span", { className: "eyebrow" }, "Account Controls"), h("h2", null, selectedGameState.settings.displayName || targetAccount.email), h("p", null, "Change gold, skill points, XP, levels, book progress, and admin access.")),
        h(
          "form",
          { className: "form-grid admin-actions", onSubmit: onAdjustAdminResource },
          h("input", { type: "hidden", name: "email", value: targetAccount.email }),
          h("label", null, "Resource", h("select", { name: "resource" }, h("option", { value: "coins" }, "Gold"), h("option", { value: "skillPoints" }, "Skill Points"), h("option", { value: "xp" }, "XP"), h("option", { value: "level" }, "Level"))),
          h("label", null, "Action", h("select", { name: "mode" }, h("option", { value: "add" }, "Add"), h("option", { value: "take" }, "Take"), h("option", { value: "set" }, "Set exact value"))),
          h("label", null, "Amount", h("input", { name: "amount", type: "number", min: "0", step: "1", required: true })),
          h("label", { className: "admin-reason" }, "Reason", h("textarea", { name: "reason", rows: 3, maxLength: 120, placeholder: "Optional note" })),
          h(Button, { type: "submit" }, "Apply Change")
        ),
        h(
          "form",
          { className: "form-grid admin-actions", onSubmit: onSetBookPages },
          h("input", { type: "hidden", name: "email", value: targetAccount.email }),
          h("label", null, "Book", h("select", { name: "bookId", disabled: selectedGameState.books.length === 0 }, selectedGameState.books.length ? selectedGameState.books.map((book) => h("option", { key: book.id, value: book.id }, `${book.title} (${book.pagesRead}/${book.totalPages})`)) : h("option", null, "No books yet"))),
          h("label", null, "Pages Read", h("input", { name: "pagesRead", type: "number", min: "0", step: "1", required: true, disabled: selectedGameState.books.length === 0 })),
          h(Button, { type: "submit", className: "secondary", disabled: selectedGameState.books.length === 0 }, "Update Book Pages")
        ),
        h(
          "form",
          { className: "form-grid admin-actions", onSubmit: onSetAdminRole },
          h("input", { type: "hidden", name: "email", value: targetAccount.email }),
          h("label", null, "Admin Access", h("select", { key: targetAccount.email, name: "isAdmin", defaultValue: String(Boolean(targetAccount.isAdmin)), disabled: isRootAdmin }, h("option", { value: "true" }, "Admin"), h("option", { value: "false" }, "Reader"))),
          h("p", { className: "form-hint" }, isRootAdmin ? "The root admin account cannot be demoted." : targetAccount.email === currentEmail ? "This is your current account." : "Promote or remove admin access for this account."),
          h(Button, { type: "submit", className: "secondary", disabled: isRootAdmin }, "Update Access")
        )
      ),
      h(
        "aside",
        { className: "panel admin-ledger" },
        h("h2", null, "Admin History"),
        selectedGameState.adminLog.length
          ? selectedGameState.adminLog.map((entry) =>
              h(
                "div",
                { key: entry.id, className: "ledger-item" },
                h("strong", null, entry.summary || `${entry.delta > 0 ? "+" : ""}${entry.delta} points`),
                h("span", null, entry.reason || "Admin adjustment"),
                h("small", null, entry.date)
              )
            )
          : h("p", null, "No admin changes yet.")
      )
    )
  );
}

function AdventurePage({ level, coins, combatStats, awardAdventure, inventory }) {
  const [stage, setStage] = useState(null);
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [enemies, setEnemies] = useState([]);
  const [battle, setBattle] = useState(null);
  const [message, setMessage] = useState("Choose a chapter to begin.");

  const launchStage = (selected) => {
    if (level < selected.minLevel) return;
    const enemyBaseHp = 18 + selected.id * 7;
    const enemyBaseAtk = 3 + selected.id * 2;
    const bossHp = 70 + selected.id * 28;
    const bossAtk = 8 + selected.id * 3;
    setStage(selected);
    setPlayer({ x: 1, y: 1 });
    setEnemies([
      { id: "e1", x: 4, y: 2, name: enemyNames[0], hp: enemyBaseHp, maxHp: enemyBaseHp, atk: enemyBaseAtk, boss: false },
      { id: "e2", x: 7, y: 4, name: enemyNames[1], hp: enemyBaseHp + 5, maxHp: enemyBaseHp + 5, atk: enemyBaseAtk + 1, boss: false },
      { id: "e3", x: 3, y: 6, name: enemyNames[2], hp: enemyBaseHp + 9, maxHp: enemyBaseHp + 9, atk: enemyBaseAtk + 2, boss: false },
      { id: "boss", x: 8, y: 7, name: selected.boss, hp: bossHp, maxHp: bossHp, atk: bossAtk, boss: true },
    ]);
    setBattle(null);
    setMessage(`${selected.name} awaits. Clear the arena and defeat the boss.`);
  };

  const move = (dx, dy) => {
    if (!stage || battle) return;
    const next = { x: clamp(player.x + dx, 0, 9), y: clamp(player.y + dy, 0, 7) };
    const enemy = enemies.find((foe) => foe.x === next.x && foe.y === next.y);
    if (enemy?.boss && enemies.some((foe) => !foe.boss)) {
      setMessage("The boss barrier holds until the arena is clear.");
      return;
    }
    setPlayer(next);
    if (enemy) {
      setBattle({ enemy, playerHp: combatStats.hp, defending: false, potionUsed: false });
      setMessage(`Battle started: ${enemy.name}`);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [stage, battle, player, enemies]);

  const handleKey = (event) => {
    const keys = {
      ArrowUp: [0, -1],
      w: [0, -1],
      W: [0, -1],
      ArrowDown: [0, 1],
      s: [0, 1],
      S: [0, 1],
      ArrowLeft: [-1, 0],
      a: [-1, 0],
      A: [-1, 0],
      ArrowRight: [1, 0],
      d: [1, 0],
      D: [1, 0],
    };
    if (keys[event.key]) {
      event.preventDefault();
      move(...keys[event.key]);
    }
  };

  const endBattle = (enemy) => {
    const xp = enemy.boss ? 220 + stage.id * 70 : 32 + stage.id * 16;
    const gold = enemy.boss ? 120 + stage.id * 55 : 14 + stage.id * 8;
    awardAdventure({ xp, gold, item: enemy.boss ? stage.item : null });
    setEnemies((current) => current.filter((foe) => foe.id !== enemy.id));
    setBattle(null);
    setMessage(enemy.boss ? `Boss defeated! ${stage.item} unlocked.` : `${enemy.name} defeated. +${xp} XP and +${gold}g.`);
  };

  const enemyTurn = (nextBattle, reducedDamage = false) => {
    if (Math.random() < combatStats.dodge) {
      setBattle({ ...nextBattle, defending: false });
      setMessage(`You dodged ${nextBattle.enemy.name}'s counterattack.`);
      return;
    }
    const guard = reducedDamage ? 10 + Math.floor(level / 3) : 0;
    const incoming = Math.max(1, nextBattle.enemy.atk - guard + Math.floor(Math.random() * 4));
    const playerHp = nextBattle.playerHp - incoming;
    if (playerHp <= 0) {
      setBattle(null);
      setPlayer({ x: 1, y: 1 });
      setMessage("You were knocked back to the chapter entrance. Try again after more reading.");
      return;
    }
    setBattle({ ...nextBattle, playerHp, defending: false });
  };

  const attack = () => {
    const damage = combatStats.atk + Math.floor(Math.random() * 7);
    const enemy = { ...battle.enemy, hp: battle.enemy.hp - damage };
    if (enemy.hp <= 0) {
      endBattle(battle.enemy);
      return;
    }
    enemyTurn({ ...battle, enemy });
  };

  const defend = () => {
    enemyTurn(battle, true);
  };

  const useItem = () => {
    if (battle.potionUsed) {
      setMessage("Your page potion pouch is empty for this battle.");
      return;
    }
    const heal = 22 + level * 2;
    setBattle({ ...battle, potionUsed: true, playerHp: Math.min(combatStats.hp, battle.playerHp + heal) });
    setMessage(`You used a page potion and recovered ${heal} HP.`);
  };

  const stageComplete = stage && enemies.length === 0;
  return h(
    "main",
    { className: "page adventure-page", tabIndex: 0, onKeyDown: handleKey },
    h("div", { className: "section-heading" }, h("h1", null, "Adventure Mode"), h("span", { className: "coin-badge large" }, `HP ${combatStats.hp} / ATK ${combatStats.atk}`)),
    h(
      "section",
      { className: "stage-grid" },
      stages.map((chapter) =>
        h(
          "button",
          { key: chapter.id, className: `stage-card ${level < chapter.minLevel ? "locked" : ""} ${stage?.id === chapter.id ? "active" : ""}`, onClick: () => launchStage(chapter) },
          h("strong", null, chapter.name),
          h("span", null, level < chapter.minLevel ? `Locked - Lv. ${chapter.minLevel}` : `Recommended Lv. ${chapter.minLevel}+`),
          h("small", null, chapter.item)
        )
      )
    ),
    h(
      "section",
      { className: "arena-layout" },
      h(
        "article",
        { className: "panel arena-panel" },
        h("div", { className: "arena-message" }, stageComplete ? "Chapter cleared. Pick another chapter or replay this one." : message),
        h(
          "div",
          { className: "arena" },
          Array.from({ length: 80 }).map((_, index) => {
            const x = index % 10;
            const y = Math.floor(index / 10);
            const enemy = enemies.find((foe) => foe.x === x && foe.y === y);
            const isPlayer = player.x === x && player.y === y;
            return h(
              "button",
              { key: index, className: `tile ${enemy?.boss ? "boss" : ""}` },
              isPlayer ? "A" : enemy ? (enemy.boss ? "B" : "E") : ""
            );
          })
        ),
        h("div", { className: "controls" }, h(Button, { onClick: () => move(0, -1) }, "Up"), h(Button, { onClick: () => move(-1, 0) }, "Left"), h(Button, { onClick: () => move(1, 0) }, "Right"), h(Button, { onClick: () => move(0, 1) }, "Down"))
      ),
      h(
        "aside",
        { className: "panel minimap-panel" },
        h("h2", null, "Minimap"),
        h("div", { className: "mini-grid" }, Array.from({ length: 80 }).map((_, index) => {
          const x = index % 10;
          const y = Math.floor(index / 10);
          const enemy = enemies.find((foe) => foe.x === x && foe.y === y);
          const isPlayer = player.x === x && player.y === y;
          return h("span", { key: index, className: isPlayer ? "player" : enemy ? "enemy" : "" });
        })),
        h("p", null, stage ? `${enemies.filter((enemy) => !enemy.boss).length} enemies, ${enemies.some((enemy) => enemy.boss) ? "boss standing" : "boss defeated"}` : "No chapter selected"),
        h("small", null, `Inventory rewards: ${inventory.filter((id) => id.startsWith("reward-")).length}`)
      )
    ),
    battle &&
      h(
        "div",
        { className: "battle-overlay" },
        h(
          "div",
          { className: "battle-card" },
          h("h2", null, battle.enemy.name),
          h("div", { className: "battle-stats" }, h("span", null, `You HP ${battle.playerHp}/${combatStats.hp}`), h("span", null, `ATK ${combatStats.atk} / Dodge ${Math.round(combatStats.dodge * 100)}%`), h("span", null, `${battle.enemy.name} HP ${Math.max(0, battle.enemy.hp)}`), h("span", null, `ATK ${battle.enemy.atk}`)),
          h(ProgressBar, { value: (battle.playerHp / combatStats.hp) * 100 }),
          h(ProgressBar, { value: (battle.enemy.hp / battle.enemy.maxHp) * 100 }),
          h("div", { className: "battle-actions" }, h(Button, { onClick: attack }, "Attack"), h(Button, { onClick: defend }, "Defend"), h(Button, { onClick: useItem, disabled: battle.potionUsed }, battle.potionUsed ? "Potion Used" : "Use Potion"))
        )
      )
  );
}

function Modal({ title, children, onClose }) {
  return h(
    "div",
    { className: "modal-backdrop" },
    h(
      "div",
      { className: "modal" },
      h("div", { className: "section-heading" }, h("h2", null, title), h("button", { className: "icon-btn", onClick: onClose }, "x")),
      children
    )
  );
}

function App() {
  const initialAccounts = useMemo(loadAccounts, []);
  const initialCurrentEmail = useMemo(() => {
    const storedEmail = normalizeEmail(localStorage.getItem(CURRENT_ACCOUNT_KEY));
    return initialAccounts.some((account) => account.email === storedEmail) ? storedEmail : "";
  }, [initialAccounts]);
  const initialAccount = initialAccounts.find((account) => account.email === initialCurrentEmail);
  const saved = initialAccount?.gameState || cloneGameState();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [currentEmail, setCurrentEmail] = useState(initialCurrentEmail);
  const [authMode, setAuthMode] = useState("login");
  const [selectedAccountEmail, setSelectedAccountEmail] = useState(initialCurrentEmail || ADMIN_EMAIL);
  const [page, setPage] = useState("Home");
  const [books, setBooks] = useState(saved.books);
  const [activity, setActivity] = useState(saved.activity);
  const [filter, setFilter] = useState("All");
  const [xp, setXp] = useState(saved.xp);
  const [coins, setCoins] = useState(saved.coins);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(saved.totalCoinsEarned);
  const [skillPoints, setSkillPoints] = useState(saved.skillPoints);
  const [skills, setSkills] = useState(saved.skills);
  const [streak, setStreak] = useState(saved.streak);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [levelOverlay, setLevelOverlay] = useState(null);
  const [achievementPop, setAchievementPop] = useState(null);
  const [coinFloat, setCoinFloat] = useState(null);
  const [inventory, setInventory] = useState(saved.inventory);
  const [equipped, setEquipped] = useState(saved.equipped);
  const [adventureProgress, setAdventureProgress] = useState(saved.adventureProgress);
  const [achievements, setAchievements] = useState(saved.achievements);
  const [adminLog, setAdminLog] = useState(saved.adminLog || []);
  const [settings, setSettings] = useState(saved.settings);

  const currentAccount = accounts.find((account) => account.email === currentEmail);
  const isAdmin = Boolean(currentAccount?.isAdmin);
  const selectedAccount = accounts.find((account) => account.email === selectedAccountEmail) || accounts[0];

  const levelInfo = useMemo(() => levelForXp(xp), [xp]);
  const streakMultiplier = streak >= 30 ? 2 : streak >= 7 ? 1.5 : streak >= 3 ? 1.2 : 1;
  const equippedWeapon = weapons.find((weapon) => weapon.id === equipped.weapon) || weapons[0];
  const combatStats = {
    hp: 58 + levelInfo.level * 12 + (skills.will || 0) * 16,
    atk: 6 + levelInfo.level * 3 + equippedWeapon.atk + (skills.sword || 0) * 9,
    dodge: Math.min(0.28, 0.05 + (skills.reflex || 0) * 0.06),
  };
  const stats = {
    pages: books.reduce((total, book) => total + book.pagesRead, 0),
    completed: books.filter((book) => book.status === "Completed").length,
    streak,
    xp,
  };

  useEffect(() => {
    document.body.classList.toggle("light-mode", !settings.darkMode);
  }, [settings.darkMode]);

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (currentEmail) {
      localStorage.setItem(CURRENT_ACCOUNT_KEY, currentEmail);
      return;
    }
    localStorage.removeItem(CURRENT_ACCOUNT_KEY);
  }, [currentEmail]);

  useEffect(() => {
    if (!currentEmail) return;
    const gameState = { books, activity, xp, coins, totalCoinsEarned, skillPoints, skills, streak, inventory, equipped, adventureProgress, achievements, adminLog, settings };
    setAccounts((current) => current.map((account) => (account.email === currentEmail ? { ...account, gameState: sanitizeGameState(gameState) } : account)));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [currentEmail, books, activity, xp, coins, totalCoinsEarned, skillPoints, skills, streak, inventory, equipped, adventureProgress, achievements, adminLog, settings]);

  useEffect(() => {
    if (page === "Home" && books.length === 0 && !settings.seenOnboarding && !modal) {
      setModal({ type: "welcome" });
    }
  }, [currentEmail, page, books.length, settings.seenOnboarding, modal]);

  useEffect(() => {
    if (page === "Admin" && !isAdmin) {
      setPage("Home");
    }
  }, [page, isAdmin]);

  useEffect(() => {
    if (!accounts.some((account) => account.email === selectedAccountEmail)) {
      setSelectedAccountEmail(currentEmail || accounts[0]?.email || ADMIN_EMAIL);
    }
  }, [accounts, currentEmail, selectedAccountEmail]);

  const applyGameState = (gameState) => {
    const next = sanitizeGameState(gameState);
    setBooks(next.books);
    setActivity(next.activity);
    setXp(next.xp);
    setCoins(next.coins);
    setTotalCoinsEarned(next.totalCoinsEarned);
    setSkillPoints(next.skillPoints);
    setSkills(next.skills);
    setStreak(next.streak);
    setInventory(next.inventory);
    setEquipped(next.equipped);
    setAdventureProgress(next.adventureProgress);
    setAchievements(next.achievements);
    setAdminLog(next.adminLog);
    setSettings(next.settings);
  };

  const signInAccount = (account) => {
    setCurrentEmail(account.email);
    setSelectedAccountEmail(account.email);
    setPage("Home");
    setModal(null);
    applyGameState(account.gameState);
  };

  const login = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = normalizeEmail(data.get("email"));
    const password = String(data.get("password") || "");
    const account = accounts.find((item) => item.email === email && item.password === password);
    if (!account) {
      setToast("Email or password is incorrect.");
      return;
    }
    signInAccount(account);
    setToast(`Signed in as ${email}.`);
  };

  const register = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = normalizeEmail(data.get("email"));
    const password = String(data.get("password") || "");
    if (!email || !password) {
      setToast("Enter an email and password.");
      return;
    }
    if (email === ADMIN_EMAIL || accounts.some((account) => account.email === email)) {
      setToast("That account already exists.");
      return;
    }
    const account = {
      email,
      password,
      isAdmin: false,
      gameState: { ...cloneGameState(), settings: { ...defaultGameState.settings, displayName: email.split("@")[0] || "Reader" } },
    };
    setAccounts((current) => [...current, account]);
    signInAccount(account);
    setToast(`Account created for ${email}.`);
  };

  const logout = () => {
    setCurrentEmail("");
    setPage("Home");
    setModal(null);
    setToast("Signed out.");
  };

  const addAdminLogEntry = (gameState, summary, reason) => ({
    ...gameState,
    adminLog: [
      {
        id: Date.now(),
        summary,
        reason,
        date: new Date().toLocaleString("en-US", { month: "short", day: "2-digit", hour: "numeric", minute: "2-digit" }),
      },
      ...(gameState.adminLog || []),
    ].slice(0, 20),
  });

  const updateAccountGameState = (email, updater) => {
    let nextGameState = null;
    setAccounts((current) =>
      current.map((account) => {
        if (account.email !== email) return account;
        nextGameState = sanitizeGameState(updater(sanitizeGameState(account.gameState)));
        return { ...account, gameState: nextGameState };
      })
    );
    if (email === currentEmail && nextGameState) {
      applyGameState(nextGameState);
    }
  };

  useEffect(() => {
    const context = { books, activity, stats, streak, skills, inventory, adventureProgress, totalCoinsEarned, levelInfo };
    const newlyUnlocked = achievementsCatalog.filter((achievement) => !achievements.includes(achievement.id) && achievement.test(context));
    if (!newlyUnlocked.length) return;
    setAchievements((current) => [...current, ...newlyUnlocked.map((achievement) => achievement.id)]);
    setAchievementPop(newlyUnlocked[0]);
    setToast(`Achievement unlocked: ${newlyUnlocked[0].name}`);
  }, [books, activity, stats.pages, stats.completed, streak, skills, inventory, adventureProgress, totalCoinsEarned, levelInfo.level, achievements]);

  const changeCoins = (amount, animate = false) => {
    setCoins((current) => current + amount);
    if (amount > 0) {
      setTotalCoinsEarned((current) => current + amount);
    }
    if (animate && amount > 0) {
      setCoinFloat({ amount, id: Date.now() });
      window.setTimeout(() => setCoinFloat(null), 1200);
    }
  };

  const addXp = (amount) => {
    const before = levelForXp(xp).level;
    const nextXp = xp + amount;
    const after = levelForXp(nextXp).level;
    setXp(nextXp);
    if (after > before) {
      const gained = (after - before) * 3;
      setSkillPoints((points) => points + gained);
      setLevelOverlay({ level: after, gained });
    }
  };

  const logPages = (bookId, pages) => {
    const book = books.find((item) => item.id === bookId);
    const remaining = book ? pagesRemaining(book) : 0;
    if (!book || pages <= 0 || remaining <= 0) {
      setModal(null);
      setToast(book ? `${book.title} is already complete.` : "Choose a book with pages left to read.");
      return;
    }
    const pagesToLog = Math.min(pages, remaining);
    const speedBonus = 1 + (skills.speed || 0) * 0.05;
    const xpGain = Math.round(pagesToLog * speedBonus * streakMultiplier);
    const treasureCoins = Math.floor(pagesToLog / 5) * (skills.treasure || 0);
    const coinGain = Math.floor(pagesToLog / 10) + treasureCoins;
    let completedBonus = 0;
    setBooks((current) =>
      current.map((item) => {
        if (item.id !== bookId) return item;
        const pagesRead = Math.min(item.totalPages, item.pagesRead + pagesToLog);
        const completed = pagesRead >= item.totalPages && item.status !== "Completed";
        completedBonus = completed ? 200 + (skills.biblio || 0) * 50 : 0;
        return {
          ...item,
          pagesRead,
          status: completed ? "Completed" : "Reading",
          xpEarned: item.xpEarned + xpGain + completedBonus,
        };
      })
    );
    addXp(xpGain + completedBonus);
    changeCoins(coinGain, true);
    setStreak((current) => current + 1);
    setActivity((current) => [{ id: Date.now(), date: todayLabel(), title: book.title, pages: pagesToLog, xp: xpGain + completedBonus }, ...current].slice(0, 10));
    setModal(null);
    setToast(completedBonus ? `Quest complete! ${book.title} awarded a ${completedBonus} XP bonus.` : `Logged ${pagesToLog} pages for ${book.title}.`);
  };

  const addBook = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = data.get("title").trim();
    if (!title) return;
    setBooks((current) => [
      {
        id: Date.now(),
        title,
        author: data.get("author").trim() || "Unknown Author",
        genre: data.get("genre"),
        totalPages: Number(data.get("totalPages")) || 1,
        pagesRead: 0,
        status: "Want to Read",
        startDate: data.get("startDate"),
        coverUrl: data.get("coverUrl").trim(),
        xpEarned: 0,
      },
      ...current,
    ]);
    setModal(null);
    setToast(`${title} joined your library.`);
  };

  const buySkill = (skill) => {
    const rank = skills[skill.id] || 0;
    if (rank >= skill.maxRank || skillPoints < skill.cost) return;
    setSkills((current) => ({ ...current, [skill.id]: rank + 1 }));
    setSkillPoints((points) => points - skill.cost);
  };

  const buyItem = (item) => {
    if (inventory.includes(item.id) || coins < item.price) return;
    changeCoins(-item.price);
    setInventory((current) => [...current, item.id]);
    setToast(`${item.name} unlocked.`);
  };

  const awardAdventure = ({ xp: xpAward, gold, item }) => {
    addXp(xpAward);
    changeCoins(gold, true);
    setAdventureProgress((current) => ({
      ...current,
      enemiesDefeated: current.enemiesDefeated + 1,
      bossesDefeated: item ? current.bossesDefeated + 1 : current.bossesDefeated,
      clearedStages: item && !current.clearedStages.includes(item) ? [...current.clearedStages, item] : current.clearedStages,
    }));
    if (item) {
      const itemId = `reward-${item.toLowerCase().replaceAll(" ", "-")}`;
      setInventory((current) => (current.includes(itemId) ? current : [...current, itemId]));
    }
  };

  const closeModal = () => {
    if (modal?.type === "welcome") {
      setSettings((current) => ({ ...current, seenOnboarding: true }));
    }
    setModal(null);
  };

  const openAddBook = () => {
    setSettings((current) => ({ ...current, seenOnboarding: true }));
    setModal({ type: "add" });
  };

  const openLogBook = (bookId) => {
    const book = books.find((item) => item.id === bookId);
    if (!book || pagesRemaining(book) <= 0 || book.status === "Completed") {
      setToast(book ? `${book.title} is already complete.` : "Choose a book with pages left to read.");
      return;
    }
    setModal({ type: "log", bookId });
  };

  const resetProgress = () => {
    setBooks(defaultGameState.books);
    setActivity(defaultGameState.activity);
    setXp(defaultGameState.xp);
    setCoins(defaultGameState.coins);
    setTotalCoinsEarned(defaultGameState.totalCoinsEarned);
    setSkillPoints(defaultGameState.skillPoints);
    setSkills(defaultGameState.skills);
    setStreak(defaultGameState.streak);
    setInventory(defaultGameState.inventory);
    setEquipped(defaultGameState.equipped);
    setAdventureProgress(defaultGameState.adventureProgress);
    setAchievements(defaultGameState.achievements);
    setAdminLog(defaultGameState.adminLog);
    setSettings((current) => ({ ...defaultGameState.settings, darkMode: current.darkMode }));
    setPage("Home");
    setModal(null);
    setToast("Progress reset.");
  };

  const adjustAdminResource = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = normalizeEmail(data.get("email"));
    const resource = data.get("resource");
    const mode = data.get("mode");
    const amount = Math.floor(Number(data.get("amount")));
    const reason = data.get("reason").trim();
    if (!isAdmin || !email) return;
    if (Number.isNaN(amount) || amount < 0) {
      setToast("Enter a valid amount.");
      return;
    }
    const resourceLabels = { coins: "gold", skillPoints: "skill points", xp: "XP", level: "level" };
    if (!resourceLabels[resource]) {
      setToast("Choose a resource to update.");
      return;
    }
    updateAccountGameState(email, (gameState) => {
      const next = sanitizeGameState(gameState);
      const key = resource === "level" ? "xp" : resource;
      const currentValue = resource === "level" ? levelForXp(next.xp).level : Number(next[key]) || 0;
      let nextValue = mode === "set" ? amount : mode === "take" ? currentValue - amount : currentValue + amount;
      nextValue = Math.max(resource === "level" ? 1 : 0, nextValue);
      if (resource === "level") {
        next.xp = xpForLevel(nextValue);
      } else {
        next[key] = nextValue;
      }
      if (resource === "coins" && next.coins > next.totalCoinsEarned) {
        next.totalCoinsEarned = next.coins;
      }
      const summary = `${resourceLabels[resource]} ${currentValue} -> ${nextValue}`;
      return addAdminLogEntry(next, summary, reason);
    });
    event.currentTarget.reset();
    setToast(`Updated ${resourceLabels[resource]} for ${email}.`);
  };

  const setBookPages = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = normalizeEmail(data.get("email"));
    const bookId = String(data.get("bookId"));
    const pagesRead = Math.floor(Number(data.get("pagesRead")));
    if (!isAdmin || !email || Number.isNaN(pagesRead)) return;
    updateAccountGameState(email, (gameState) => {
      const next = sanitizeGameState(gameState);
      let summary = "Book pages updated";
      next.books = next.books.map((book) => {
        if (String(book.id) !== bookId) return book;
        const nextPages = clamp(pagesRead, 0, book.totalPages);
        summary = `${book.title} pages ${book.pagesRead} -> ${nextPages}`;
        return { ...book, pagesRead: nextPages, status: nextPages >= book.totalPages ? "Completed" : nextPages > 0 ? "Reading" : "Want to Read" };
      });
      return addAdminLogEntry(next, summary, "Book progress adjustment");
    });
    event.currentTarget.reset();
    setToast(`Updated book pages for ${email}.`);
  };

  const setAdminRole = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = normalizeEmail(data.get("email"));
    const nextIsAdmin = data.get("isAdmin") === "true";
    if (!isAdmin || !email || email === ADMIN_EMAIL) return;
    setAccounts((current) => current.map((account) => (account.email === email ? { ...account, isAdmin: nextIsAdmin } : account)));
    setToast(`${email} is now ${nextIsAdmin ? "an admin" : "a reader"}.`);
  };

  const modalBook = modal?.type === "log" ? books.find((book) => book.id === modal.bookId) : null;
  const modalBookRemaining = modalBook ? pagesRemaining(modalBook) : 0;

  if (!currentEmail) {
    return h(React.Fragment, null, h(LoginPage, { authMode, setAuthMode, onLogin: login, onRegister: register }), h(Toast, { toast, onDone: () => setToast("") }));
  }

  const content =
    page === "Home"
      ? h(HomePage, { books, activity, stats, onLog: openLogBook, setPage, levelInfo, streakMultiplier, skills, skillPoints, buySkill, displayName: settings.displayName || "Reader" })
      : page === "My Books"
        ? h(BooksPage, { books, filter, setFilter, onAddBook: openAddBook, onLog: openLogBook })
        : page === "Avatar"
          ? h(AvatarPage, { coins, inventory, equipped, setEquipped, buyItem, setPage })
          : page === "Adventure"
            ? h(AdventurePage, { level: levelInfo.level, coins, combatStats, awardAdventure, inventory })
            : page === "Achievements"
              ? h(AchievementsPage, { unlocked: achievements })
              : page === "Admin" && isAdmin
                ? h(AdminPage, { accounts, currentEmail, selectedAccountEmail, setSelectedAccountEmail, targetGameState: selectedAccount?.gameState, onAdjustAdminResource: adjustAdminResource, onSetBookPages: setBookPages, onSetAdminRole: setAdminRole })
                : h(SettingsPage, { settings, setSettings, onReset: () => setModal({ type: "reset" }) });

  return h(
    React.Fragment,
    null,
    h(Nav, { page, setPage, levelInfo, coins, streakMultiplier, coinFloat, isAdmin, currentEmail, onLogout: logout }),
    content,
    modal?.type === "welcome" &&
      h(
        Modal,
        { title: "Welcome to ReadQuest!", onClose: closeModal },
        h(
          "div",
          { className: "welcome-modal" },
          h("p", null, "Start your adventure - add your first book to earn XP."),
          h(Button, { className: "big-cta", onClick: openAddBook }, "Add Book")
        )
      ),
    modal?.type === "add" &&
      h(
        Modal,
        { title: "Add New Book", onClose: closeModal },
        h(
          "form",
          { className: "form-grid", onSubmit: addBook },
          h("label", null, "Book Title", h("input", { name: "title", required: true })),
          h("label", null, "Author", h("input", { name: "author" })),
          h("label", null, "Genre", h("select", { name: "genre" }, genres.map((genre) => h("option", { key: genre }, genre)))),
          h("label", null, "Total Pages", h("input", { name: "totalPages", type: "number", min: "1", required: true })),
          h("label", null, "Start Date", h("input", { name: "startDate", type: "date" })),
          h("label", null, "Cover Image URL", h("input", { name: "coverUrl", type: "url" })),
          h(Button, { type: "submit" }, "Save Book")
        )
      ),
    modal?.type === "log" &&
      h(
        Modal,
        { title: "Log Pages", onClose: closeModal },
        modalBookRemaining > 0
          ? h(
              "form",
              {
                className: "form-grid",
                onSubmit: (event) => {
                  event.preventDefault();
                  logPages(modal.bookId, Number(new FormData(event.currentTarget).get("pages")));
                },
              },
              h("p", { className: "form-hint" }, `${modalBook.title} has ${modalBookRemaining} pages left.`),
              h("label", null, "Pages read today", h("input", { name: "pages", type: "number", min: "1", max: String(modalBookRemaining), required: true, autoFocus: true })),
              h(Button, { type: "submit" }, "Claim Rewards")
            )
          : h("p", null, modalBook ? `${modalBook.title} is already complete.` : "Choose a book with pages left to read.")
      ),
    modal?.type === "reset" &&
      h(
        Modal,
        { title: "Reset Progress?", onClose: closeModal },
        h(
          "div",
          { className: "confirm-modal" },
          h("p", null, "This clears your books, XP, level, coins, avatar unlocks, skills, adventure progress, streak, and achievements."),
          h("div", { className: "battle-actions" }, h(Button, { className: "secondary", onClick: closeModal }, "Cancel"), h(Button, { className: "danger", onClick: resetProgress }, "Reset Progress"))
        )
      ),
    h(Toast, { toast, onDone: () => setToast("") }),
    achievementPop &&
      h(
        "div",
        { className: "achievement-pop", onAnimationEnd: () => setAchievementPop(null) },
        h("span", null, "*"),
        h("strong", null, achievementPop.name),
        h("small", null, "Achievement unlocked")
      ),
    levelOverlay &&
      h(
        "div",
        { className: "level-overlay", onClick: () => setLevelOverlay(null) },
        h(
          "div",
          null,
          h("i", { className: "particle p1" }),
          h("i", { className: "particle p2" }),
          h("i", { className: "particle p3" }),
          h("i", { className: "particle p4" }),
          h("i", { className: "particle p5" }),
          h("span", null, "LEVEL UP!"),
          h("strong", null, `Level ${levelOverlay.level}`),
          h("p", null, `+${levelOverlay.gained} skill points awarded`),
          h(Button, null, "Continue")
        )
      )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
