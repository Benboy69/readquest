const { useEffect, useMemo, useState } = React;

const genres = ["Fantasy", "Sci-Fi", "Mystery", "History", "Romance", "Nonfiction"];

const startingBooks = [
  {
    id: 1,
    title: "The Ember Library",
    author: "Mira Vale",
    genre: "Fantasy",
    totalPages: 420,
    pagesRead: 265,
    status: "Reading",
    startDate: "2026-06-01",
    coverUrl: "",
    xpEarned: 265,
  },
  {
    id: 2,
    title: "Moonlit Machines",
    author: "J. K. Nox",
    genre: "Sci-Fi",
    totalPages: 310,
    pagesRead: 310,
    status: "Completed",
    startDate: "2026-05-04",
    coverUrl: "",
    xpEarned: 510,
  },
  {
    id: 3,
    title: "Cartographer's Oath",
    author: "Ren Sable",
    genre: "Fantasy",
    totalPages: 500,
    pagesRead: 0,
    status: "Want to Read",
    startDate: "",
    coverUrl: "",
    xpEarned: 0,
  },
];

const startingActivity = [
  { id: 1, date: "Jul 10", title: "The Ember Library", pages: 36, xp: 43 },
  { id: 2, date: "Jul 09", title: "The Ember Library", pages: 22, xp: 26 },
  { id: 3, date: "Jul 08", title: "Moonlit Machines", pages: 44, xp: 52 },
  { id: 4, date: "Jul 07", title: "Moonlit Machines", pages: 30, xp: 36 },
  { id: 5, date: "Jul 06", title: "The Ember Library", pages: 18, xp: 21 },
];

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

const STORAGE_USERS = "readquest_users";
const STORAGE_SESSION = "readquest_session";

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i += 1) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USERS)) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function getUserDataKey(username) {
  return `readquest_data_${username.toLowerCase()}`;
}

function getDefaultGameState() {
  return {
    books: startingBooks,
    activity: startingActivity,
    xp: 1800,
    coins: 275,
    skillPoints: 3,
    skills: { speed: 1, night: 0, biblio: 0, sword: 0, will: 0, reflex: 0, fashion: 0, treasure: 0 },
    streak: 7,
    inventory: ["hair-raven", "outfit-apprentice", "acc-none", "wood-staff"],
    equipped: { hair: "hair-raven", outfit: "outfit-apprentice", accessory: "acc-none", weapon: "wood-staff" },
  };
}

function loadUserData(username) {
  try {
    const saved = localStorage.getItem(getUserDataKey(username));
    return saved ? { ...getDefaultGameState(), ...JSON.parse(saved) } : getDefaultGameState();
  } catch {
    return getDefaultGameState();
  }
}

function saveUserData(username, state) {
  const { books, activity, xp, coins, skillPoints, skills, streak, inventory, equipped } = state;
  localStorage.setItem(getUserDataKey(username), JSON.stringify({ books, activity, xp, coins, skillPoints, skills, streak, inventory, equipped }));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_SESSION));
  } catch {
    return null;
  }
}

function setSession(username) {
  localStorage.setItem(STORAGE_SESSION, JSON.stringify({ username }));
}

function clearSession() {
  localStorage.removeItem(STORAGE_SESSION);
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

function Nav({ page, setPage, levelInfo, coins, streakMultiplier, user, onLogout }) {
  const links = ["Home", "My Books", "Avatar", "Adventure"];
  return h(
    "nav",
    { className: "top-nav" },
    h("button", { className: "brand", onClick: () => setPage("Home") }, "ReadQuest"),
    h(
      "div",
      { className: "nav-center" },
      h("span", { className: "level-badge" }, `Lv. ${levelInfo.level}`),
      h("div", { className: "nav-xp" }, h("span", null, `${levelInfo.current}/${levelInfo.needed} XP`), h(ProgressBar, { value: (levelInfo.current / levelInfo.needed) * 100 })),
      h("span", { className: "coin-badge" }, `Gold ${coins}`),
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
      h("span", { className: "user-badge" }, user),
      h("button", { className: "logout-btn", onClick: onLogout, title: "Log out" }, "Log Out")
    )
  );
}

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    const username = data.get("username").trim();
    const password = data.get("password");
    if (!username || !password) {
      setError("Username and password are required.");
      return;
    }
    const users = getUsers();
    if (mode === "signup") {
      if (users[username.toLowerCase()]) {
        setError("That username is already taken.");
        return;
      }
      users[username.toLowerCase()] = { username, passwordHash: hashPassword(password) };
      saveUsers(users);
      saveUserData(username, getDefaultGameState());
      setSession(username);
      onLogin(username);
      return;
    }
    const user = users[username.toLowerCase()];
    if (!user || user.passwordHash !== hashPassword(password)) {
      setError("Invalid username or password.");
      return;
    }
    setSession(username);
    onLogin(username);
  };

  return h(
    "main",
    { className: "auth-page" },
    h(
      "section",
      { className: "auth-card" },
      h("h1", null, "ReadQuest"),
      h("p", { className: "auth-tagline" }, "Track your reading. Level up your hero."),
      h(
        "div",
        { className: "tabs auth-tabs" },
        h("button", { type: "button", className: mode === "login" ? "active" : "", onClick: () => { setMode("login"); setError(""); } }, "Log In"),
        h("button", { type: "button", className: mode === "signup" ? "active" : "", onClick: () => { setMode("signup"); setError(""); } }, "Sign Up")
      ),
      h(
        "form",
        { className: "form-grid auth-form", onSubmit: handleSubmit },
        h("label", null, "Username", h("input", { name: "username", required: true, autoComplete: "username", autoFocus: true })),
        h("label", null, "Password", h("input", { name: "password", type: "password", required: true, autoComplete: mode === "login" ? "current-password" : "new-password", minLength: 4 })),
        error && h("p", { className: "auth-error" }, error),
        h(Button, { type: "submit" }, mode === "login" ? "Enter Quest" : "Create Account")
      ),
      h("p", { className: "auth-note" }, "Your progress is saved locally in this browser.")
    )
  );
}

function HomePage({ books, activity, stats, onLog, setPage, levelInfo, streakMultiplier, skills, skillPoints, buySkill }) {
  const activeBook = books.find((book) => book.status === "Reading") || books[0];
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
      { className: "wide-panel xp-panel" },
      h("div", null, h("h2", null, "Hero Progress"), h("p", null, `Level ${levelInfo.level} quester, ${levelInfo.needed - levelInfo.current} XP to next level`)),
      h("span", { className: "streak-badge large" }, `${streakMultiplier}x active multiplier`),
      h(ProgressBar, { value: (levelInfo.current / levelInfo.needed) * 100 })
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
                h("small", null, `${activeBook.pagesRead} / ${activeBook.totalPages} pages`)
              ),
              h(Button, { onClick: () => onLog(activeBook.id) }, "+ Log Pages")
            )
          : h("p", null, "Add a book to begin your reading quest.")
      ),
      h(
        "article",
        { className: "panel activity-feed" },
        h("h2", null, "Recent Activity"),
        activity.slice(0, 5).map((entry) =>
          h("div", { key: entry.id, className: "activity-item" }, h("span", null, entry.date), h("strong", null, entry.title), h("em", null, `${entry.pages} pages`), h("b", null, `+${entry.xp} XP`))
        )
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
        h(
          "article",
          { key: book.id, className: "book-card" },
          h("div", { className: "cover tall" }, book.coverUrl ? h("img", { src: book.coverUrl, alt: "" }) : initials(book.title)),
          h("span", { className: `status ${book.status.toLowerCase().replaceAll(" ", "-")}` }, book.status),
          h("h3", null, book.title),
          h("p", null, book.author),
          h("small", null, `${book.genre} - ${book.totalPages} pages`),
          h(ProgressBar, { value: progressPercent(book) }),
          h("small", null, `${book.pagesRead} pages read - ${book.xpEarned} XP`),
          h(Button, { className: "secondary", onClick: () => onLog(book.id) }, "Log Pages")
        )
      )
    )
  );
}

function getItemName(id) {
  const all = [...Object.values(cosmeticItems).flat(), ...weapons];
  return all.find((item) => item.id === id)?.name || id;
}

function AvatarDisplay({ equipped, size = "normal" }) {
  return h(
    "div",
    { className: `avatar-stage ${size}` },
    h("div", { className: "avatar-glow" }),
    h("div", { className: "avatar-platform" }),
    h(
      "div",
      { className: `pixel-avatar ${equipped.outfit}` },
      h("span", { className: `hair ${equipped.hair}` }),
      h("span", { className: "face" },
        h("span", { className: "eye left" }),
        h("span", { className: "eye right" })
      ),
      h("span", { className: `body ${equipped.outfit}` }),
      h("span", { className: `legs ${equipped.outfit}` }),
      h("span", { className: `accessory ${equipped.accessory}` }),
      h("span", { className: `weapon ${equipped.weapon}` })
    )
  );
}

function AvatarPage({ coins, inventory, equipped, setEquipped, buyItem, setPage, level, combatStats }) {
  const [tab, setTab] = useState("Hair");
  const shopItems = [...Object.entries(cosmeticItems).flatMap(([type, items]) => items.map((item) => ({ ...item, type }))), ...weapons.map((weapon) => ({ ...weapon, type: "Weapon" }))];
  const tabItems = tab === "Weapon" ? weapons : cosmeticItems[tab];
  const slotKey = tab === "Accessories" ? "accessory" : tab === "Weapon" ? "weapon" : tab.toLowerCase();
  const equippedWeapon = weapons.find((w) => w.id === equipped.weapon) || weapons[0];

  return h(
    "main",
    { className: "page avatar-page" },
    h("div", { className: "section-heading" }, h("h1", null, "Avatar"), h("span", { className: "coin-badge large" }, `Gold ${coins}`)),
    h(
      "section",
      { className: "avatar-layout" },
      h(
        "article",
        { className: "panel avatar-panel" },
        h(AvatarDisplay, { equipped }),
        h(
          "div",
          { className: "avatar-loadout" },
          h("h3", null, "Current Loadout"),
          h("div", { className: "loadout-grid" },
            h("span", null, h("small", null, "Hair"), getItemName(equipped.hair)),
            h("span", null, h("small", null, "Outfit"), getItemName(equipped.outfit)),
            h("span", null, h("small", null, "Accessory"), getItemName(equipped.accessory)),
            h("span", null, h("small", null, "Weapon"), getItemName(equipped.weapon))
          )
        ),
        h(
          "div",
          { className: "avatar-stats" },
          h("div", { className: "avatar-stat" }, h("strong", null, `Lv. ${level}`), h("small", null, "Level")),
          h("div", { className: "avatar-stat" }, h("strong", null, combatStats.hp), h("small", null, "HP")),
          h("div", { className: "avatar-stat" }, h("strong", null, combatStats.atk), h("small", null, "ATK")),
          h("div", { className: "avatar-stat" }, h("strong", null, `+${equippedWeapon.atk}`), h("small", null, "Weapon"))
        ),
        h(Button, { onClick: () => setPage("Adventure") }, "Enter Adventure")
      ),
      h(
        "article",
        { className: "panel cosmetics-panel" },
        h("div", { className: "tabs" }, ["Hair", "Outfit", "Accessories", "Weapon"].map((name) => h("button", { key: name, className: tab === name ? "active" : "", onClick: () => setTab(name) }, name))),
        h(
          "div",
          { className: "item-grid" },
          tabItems.map((item) => {
            const owned = inventory.includes(item.id);
            const isEquipped = equipped[slotKey] === item.id;
            return h(
              "button",
              {
                key: item.id,
                className: `shop-card ${owned ? "owned" : "locked"} ${isEquipped ? "equipped" : ""}`,
                onClick: () => owned && setEquipped((current) => ({ ...current, [slotKey]: item.id })),
              },
              h("span", { className: "item-preview-icon" }, item.preview),
              h("strong", null, item.name),
              h("small", null, isEquipped ? "Equipped" : owned ? "Owned" : `Locked - ${item.price}g`)
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
            { key: item.id, className: `shop-card ${owned ? "owned-item" : ""}` },
            h("span", { className: "item-preview-icon" }, item.preview),
            h("strong", null, item.name),
            h("small", null, item.atk ? `ATK +${item.atk}` : item.type),
            h(Button, { className: "secondary", onClick: () => buyItem(item), disabled: owned || item.price > coins }, owned ? "Owned" : `Buy ${item.price}g`)
          );
        })
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
    setStage(selected);
    setPlayer({ x: 1, y: 1 });
    setEnemies([
      { id: "e1", x: 4, y: 2, name: enemyNames[0], hp: 24 + selected.id * 8, atk: 5 + selected.id * 2, boss: false },
      { id: "e2", x: 7, y: 4, name: enemyNames[1], hp: 26 + selected.id * 8, atk: 6 + selected.id * 2, boss: false },
      { id: "e3", x: 3, y: 6, name: enemyNames[2], hp: 28 + selected.id * 8, atk: 7 + selected.id * 2, boss: false },
      { id: "boss", x: 8, y: 7, name: selected.boss, hp: 90 + selected.id * 35, atk: 12 + selected.id * 4, boss: true },
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
      setBattle({ enemy, playerHp: combatStats.hp, defending: false });
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
    const xp = enemy.boss ? 300 + stage.id * 90 : 45 + stage.id * 20;
    const gold = enemy.boss ? 180 + stage.id * 80 : 20 + stage.id * 10;
    awardAdventure({ xp, gold, item: enemy.boss ? stage.item : null });
    setEnemies((current) => current.filter((foe) => foe.id !== enemy.id));
    setBattle(null);
    setMessage(enemy.boss ? `Boss defeated! ${stage.item} unlocked.` : `${enemy.name} defeated. +${xp} XP and +${gold}g.`);
  };

  const enemyTurn = (nextBattle, reducedDamage = false) => {
    const incoming = Math.max(1, nextBattle.enemy.atk - (reducedDamage ? 8 : 0) + Math.floor(Math.random() * 5));
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
    const damage = combatStats.atk + Math.floor(Math.random() * 9);
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
    setBattle({ ...battle, playerHp: Math.min(combatStats.hp, battle.playerHp + 20) });
    setMessage("You used a page potion and recovered 20 HP.");
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
          h("span", null, level < chapter.minLevel ? `Locked - Lv. ${chapter.minLevel}` : `Unlocked at Lv. ${chapter.minLevel}`),
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
          h("div", { className: "battle-stats" }, h("span", null, `You HP ${battle.playerHp}/${combatStats.hp}`), h("span", null, `ATK ${combatStats.atk}`), h("span", null, `${battle.enemy.name} HP ${Math.max(0, battle.enemy.hp)}`), h("span", null, `ATK ${battle.enemy.atk}`)),
          h(ProgressBar, { value: (battle.playerHp / combatStats.hp) * 100 }),
          h(ProgressBar, { value: (battle.enemy.hp / (battle.enemy.boss ? 90 + stage.id * 35 : 40 + stage.id * 8)) * 100 }),
          h("div", { className: "battle-actions" }, h(Button, { onClick: attack }, "Attack"), h(Button, { onClick: defend }, "Defend"), h(Button, { onClick: useItem }, "Use Item"))
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

function AddBookForm({ onSubmit, onClose }) {
  const [coverPreview, setCoverPreview] = useState("");
  const [coverSource, setCoverSource] = useState("url");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setCoverPreview("");
      return;
    }
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => setCoverPreview(loadEvent.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const urlCover = data.get("coverUrl").trim();
    const coverUrl = coverSource === "upload" ? coverPreview : urlCover;
    onSubmit({ data, coverUrl });
  };

  return h(
    "form",
    { className: "form-grid", onSubmit: handleSubmit },
    h("label", null, "Book Title", h("input", { name: "title", required: true })),
    h("label", null, "Author", h("input", { name: "author" })),
    h("label", null, "Genre", h("select", { name: "genre" }, genres.map((genre) => h("option", { key: genre }, genre)))),
    h("label", null, "Total Pages", h("input", { name: "totalPages", type: "number", min: "1", required: true })),
    h("label", null, "Start Date", h("input", { name: "startDate", type: "date" })),
    h(
      "div",
      { className: "cover-upload-section" },
      h("span", { className: "cover-upload-label" }, "Book Cover"),
      h(
        "div",
        { className: "cover-source-tabs" },
        h("button", { type: "button", className: coverSource === "url" ? "active" : "", onClick: () => setCoverSource("url") }, "Image URL"),
        h("button", { type: "button", className: coverSource === "upload" ? "active" : "", onClick: () => setCoverSource("upload") }, "Upload File")
      ),
      coverSource === "url"
        ? h("input", { name: "coverUrl", type: "url", placeholder: "https://example.com/cover.jpg" })
        : h(
            "div",
            { className: "cover-file-upload" },
            h("input", { type: "file", accept: "image/*", onChange: handleFileChange, id: "cover-file-input" }),
            h(
              "label",
              { htmlFor: "cover-file-input", className: "cover-dropzone" },
              coverPreview
                ? h("img", { src: coverPreview, alt: "Cover preview", className: "cover-preview-img" })
                : h("span", null, "Click to choose an image (JPG, PNG, WebP)")
            )
          )
    ),
    h("div", { className: "form-actions" }, h(Button, { type: "button", className: "secondary", onClick: onClose }, "Cancel"), h(Button, { type: "submit" }, "Save Book"))
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("Home");
  const [books, setBooks] = useState(startingBooks);
  const [activity, setActivity] = useState(startingActivity);
  const [filter, setFilter] = useState("All");
  const [xp, setXp] = useState(1800);
  const [coins, setCoins] = useState(275);
  const [skillPoints, setSkillPoints] = useState(3);
  const [skills, setSkills] = useState({ speed: 1, night: 0, biblio: 0, sword: 0, will: 0, reflex: 0, fashion: 0, treasure: 0 });
  const [streak, setStreak] = useState(7);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const [levelOverlay, setLevelOverlay] = useState(null);
  const [inventory, setInventory] = useState(["hair-raven", "outfit-apprentice", "acc-none", "wood-staff"]);
  const [equipped, setEquipped] = useState({ hair: "hair-raven", outfit: "outfit-apprentice", accessory: "acc-none", weapon: "wood-staff" });
  const [ready, setReady] = useState(false);

  const handleLogin = (username, silent = false) => {
    const saved = loadUserData(username);
    setUser(username);
    setBooks(saved.books);
    setActivity(saved.activity);
    setXp(saved.xp);
    setCoins(saved.coins);
    setSkillPoints(saved.skillPoints);
    setSkills(saved.skills);
    setStreak(saved.streak);
    setInventory(saved.inventory);
    setEquipped(saved.equipped);
    setPage("Home");
    setReady(true);
    if (!silent) setToast(`Welcome back, ${username}!`);
  };

  const handleLogout = () => {
    if (user) {
      saveUserData(user, { books, activity, xp, coins, skillPoints, skills, streak, inventory, equipped });
    }
    clearSession();
    setUser(null);
    setPage("Home");
  };

  useEffect(() => {
    const session = getSession();
    if (session?.username) {
      handleLogin(session.username, true);
    } else {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    saveUserData(user, { books, activity, xp, coins, skillPoints, skills, streak, inventory, equipped });
  }, [user, books, activity, xp, coins, skillPoints, skills, streak, inventory, equipped]);

  const levelInfo = useMemo(() => levelForXp(xp), [xp]);

  if (!ready) return null;
  if (!user) {
    return h(AuthPage, { onLogin: handleLogin });
  }

  const streakMultiplier = streak >= 30 ? 2 : streak >= 7 ? 1.5 : streak >= 3 ? 1.2 : 1;
  const equippedWeapon = weapons.find((weapon) => weapon.id === equipped.weapon) || weapons[0];
  const combatStats = {
    hp: 50 + levelInfo.level * 10 + (skills.will || 0) * 15,
    atk: 5 + levelInfo.level * 2 + equippedWeapon.atk + (skills.sword || 0) * 10,
  };
  const stats = {
    pages: books.reduce((total, book) => total + book.pagesRead, 0),
    completed: books.filter((book) => book.status === "Completed").length,
    streak,
    xp,
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
    if (!book || pages <= 0) return;
    const speedBonus = 1 + (skills.speed || 0) * 0.05;
    const xpGain = Math.round(pages * speedBonus * streakMultiplier);
    const treasureCoins = Math.floor(pages / 5) * (skills.treasure || 0);
    const coinGain = Math.floor(pages / 10) + treasureCoins;
    let completedBonus = 0;
    setBooks((current) =>
      current.map((item) => {
        if (item.id !== bookId) return item;
        const pagesRead = Math.min(item.totalPages, item.pagesRead + pages);
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
    setCoins((current) => current + coinGain);
    setStreak((current) => Math.max(current, current + 1));
    setActivity((current) => [{ id: Date.now(), date: todayLabel(), title: book.title, pages, xp: xpGain + completedBonus }, ...current].slice(0, 10));
    setModal(null);
    setToast(completedBonus ? `Quest complete! ${book.title} awarded a ${completedBonus} XP bonus.` : `Logged ${pages} pages for ${book.title}.`);
  };

  const addBook = ({ data, coverUrl }) => {
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
        coverUrl: coverUrl || "",
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
    setCoins((current) => current - item.price);
    setInventory((current) => [...current, item.id]);
    setToast(`${item.name} unlocked.`);
  };

  const awardAdventure = ({ xp: xpAward, gold, item }) => {
    addXp(xpAward);
    setCoins((current) => current + gold);
    if (item) {
      const itemId = `reward-${item.toLowerCase().replaceAll(" ", "-")}`;
      setInventory((current) => (current.includes(itemId) ? current : [...current, itemId]));
    }
  };

  const content =
    page === "Home"
      ? h(HomePage, { books, activity, stats, onLog: (bookId) => setModal({ type: "log", bookId }), setPage, levelInfo, streakMultiplier, skills, skillPoints, buySkill })
      : page === "My Books"
        ? h(BooksPage, { books, filter, setFilter, onAddBook: () => setModal({ type: "add" }), onLog: (bookId) => setModal({ type: "log", bookId }) })
        : page === "Avatar"
          ? h(AvatarPage, { coins, inventory, equipped, setEquipped, buyItem, setPage, level: levelInfo.level, combatStats })
          : h(AdventurePage, { level: levelInfo.level, coins, combatStats, awardAdventure, inventory });

  return h(
    React.Fragment,
    null,
    h(Nav, { page, setPage, levelInfo, coins, streakMultiplier, user, onLogout: handleLogout }),
    content,
    modal?.type === "add" && h(Modal, { title: "Add New Book", onClose: () => setModal(null) }, h(AddBookForm, { onSubmit: addBook, onClose: () => setModal(null) })),
    modal?.type === "log" &&
      h(
        Modal,
        { title: "Log Pages", onClose: () => setModal(null) },
        h(
          "form",
          {
            className: "form-grid",
            onSubmit: (event) => {
              event.preventDefault();
              logPages(modal.bookId, Number(new FormData(event.currentTarget).get("pages")));
            },
          },
          h("label", null, "Pages read today", h("input", { name: "pages", type: "number", min: "1", required: true, autoFocus: true })),
          h(Button, { type: "submit" }, "Claim Rewards")
        )
      ),
    h(Toast, { toast, onDone: () => setToast("") }),
    levelOverlay &&
      h(
        "div",
        { className: "level-overlay", onClick: () => setLevelOverlay(null) },
        h("div", null, h("span", null, "LEVEL UP!"), h("strong", null, `Level ${levelOverlay.level}`), h("p", null, `+${levelOverlay.gained} skill points awarded`), h(Button, null, "Continue"))
      )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
