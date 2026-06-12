# ⚓ One Piece Desktop Pet

A lightweight Electron desktop mascot featuring the Straw Hat Pirates. Your chosen character sits on your screen, reacts to your mouse interactions, shows speech bubbles, and runs idle animations — all with a transparent, always-on-top frameless window.

![One Piece Desktop Pet]<img width="1440" height="1050" alt="image" src="https://github.com/user-attachments/assets/70f2e34b-61fa-498d-9516-a4b96e7a47dd" />


---

## 💡 Idea

Most desktop pets are generic. This one is for One Piece fans — pick your favourite crew member and have them hang out on your screen while you work, study, or browse. Each character:

- Has a **unique visual design** drawn with Canvas 2D vector art
- Says **character-accurate quotes** based on how you interact with them
- Runs **character-specific idle animations** (Zoro meditates, Nami counts coins, Brook plays violin…)
- Has **unique animations for every emotion** — each character moves differently when happy, angry, sad, waving, excited, and doing their special move
- Reacts to hover, click, triple-tap, shake, and idle timeout events

---

## 📦 Download & Run (No Setup Required)

> Pre-built installers — just download and open, no Node.js needed.

| Platform | Download |
|----------|----------|
| 🍎 macOS (.dmg) | [Download from Releases](https://github.com/jayhindPrajapati07/one-piece-desktop-pet/releases/latest) |
| 🪟 Windows (.exe) | [Download from Releases](https://github.com/jayhindPrajapati07/one-piece-desktop-pet/releases/latest) |
| 🐧 Linux (.AppImage) | [Download from Releases](https://github.com/jayhindPrajapati07/one-piece-desktop-pet/releases/latest) |

> **macOS note:** If you see "app can't be opened", go to System Preferences → Security & Privacy → click "Open Anyway".

---

## 🛠️ Developer Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)
- Git

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/jayhindPrajapati07/one-piece-desktop-pet.git

# 2. Enter the project folder
cd one-piece-desktop-pet

# 3. Install dependencies
npm install

# 4. Run the app
npm start
```

The character selection window opens. Pick a Straw Hat and they'll appear on your desktop.

### Build a distributable

```bash
# Build for your current platform
npm run build

# Output goes to: dist/
```

Electron Builder produces:
- `.dmg` on macOS
- `.exe` installer on Windows  
- `.AppImage` on Linux

---

## 🗂️ Project Structure

```
one-piece-desktop-pet/
├── main.js              # Electron main process (windows, tray, IPC)
├── preload.js           # Context bridge — exposes safe APIs to renderer
├── package.json
└── renderer/
    ├── selection.html   # Character picker screen
    ├── pet.html         # The transparent pet window
    └── js/
        ├── characters.js  # All characters — vector art, quotes, idle behaviors, per-emotion animations
        ├── renderer.js    # Animation engine (emotions, particles, idle timer)
        └── pet.js         # Interaction handler (mouse events, drag, IPC)
```

---

## 🎮 Interactions

| Action | How to trigger | Result |
|--------|---------------|--------|
| **Hover** | Hold mouse still over character for 400ms | `pet` emotion + quote |
| **Click** | Single left-click | `pet` emotion + quote |
| **Special** | 3 clicks within 1.5 seconds | `special` personal action + quote |
| **Angry** | Fast drag / shake the window | `angry` emotion + quote |
| **Sleep** | No interaction for 5 minutes | `sleep` (persistent — wakes on next touch) |
| **Drag** | Left-click and drag slowly | Moves the window |
| **Right-click** | Right mouse button | Context menu (Change character / Quit) |
| **Transparent pixels** | Mouse over empty space around character | Click-through to desktop |

---

## 🏴‍☠️ Characters & Behaviours

### Common Emotions (all characters)

Every character reacts to the same set of interactions with their own unique quotes and expressions:

| Emotion | Triggered by | Visual | Particles |
|---------|-------------|--------|-----------|
| `idle` | Default state | Gentle bob, slow arm sway | — |
| `pet` | Hover 400ms / click | Happy squint eyes, big smile | ❤️ Hearts |
| `special` | 3 rapid clicks (1.5s) | **Character's personal move** — unique per crew member | ⭐+❤️ |
| `angry` | Fast drag / shake | Screen shake + red flash, furrowed brows | 💢 Rage |
| `sleep` | 5 min idle (persistent) | Closed eyes, slow breath — wakes on touch | 💤 ZZZs |
| `wave` | On startup / tray | One arm raised and waving | — |
| `happy` | Via tray menu | **Character-specific** — unique per crew member | varies |
| `excited` | Via tray menu | **Character-specific** — unique per crew member | varies |
| `sad` | Via tray menu | **Character-specific** — unique slump depth and memory | 💧 |

### Character-Specific Emotion Animations

Every emotion has a unique animation per character. Full reference below.

#### 🌀 Excited

| Character | Animation | Particle |
|-----------|-----------|----------|
| Luffy | Massive hungry bounce (20px) — MEAT!! energy | ⭐ |
| Zoro | Sword-swing arm + battle sway | ⭐ |
| Nami | Greedy coin-counting arm flick | 💰 |
| Usopp | Both arms flailing wildly in opposite directions | ⭐ |
| Sanji | Fast spin-kick shimmy — Mellorine~! | ❤️ |
| Chopper | Rapid cute stomp bounce | ❤️ |
| Robin | Graceful Ara ara sway, flowers bloom | 🌸 |
| Franky | Rigid SUPER!! double-flex pose + bounce | ⭐ |
| Brook | Yohohoho full rhythm dance | 🎵 |
| Jinbe | Powerful slow bob, arms spread wide | 💦 |

#### ❤️ Happy

| Character | Animation | Particle |
|-----------|-----------|----------|
| Luffy | Huge meat-excited jump (16px) | ❤️ ⭐ |
| Zoro | Barely reacts — subtle slow nod | ⭐ (rare) |
| Nami | Coin-excited hop | 💰 |
| Usopp | Hero-pose pump — brave warrior!! | ⭐ |
| Sanji | Spin flourish + horizontal sway | ❤️ |
| Chopper | Super-fast cute bounce | ❤️ |
| Robin | Gentle Ara ara sway | 🌸 |
| Franky | Rigid SUPER!! pose held + bounce | ⭐ |
| Brook | Skull-joke bounce laugh | ⭐ 🎵 |
| Jinbe | Deep satisfied slow nod | 💦 |

#### 💢 Angry

| Character | Animation | Particle |
|-----------|-----------|----------|
| Luffy | Protect-nakama rage bounce + horizontal sway | 💢 |
| Zoro | Battle-stance shake + horizontal sway | 💢 |
| Nami | Foot-stamp rage + horizontal sway | 💢 |
| Usopp | Scared-angry fast trembling | 💢 |
| Sanji | Diable Jambe controlled fury + sway | 💢 |
| Chopper | Stomp stomp rapid bounce — not cute IDIOT!! | 💢 |
| Robin | Ice-cold sudden jerk — eerie calm | 💢 |
| Franky | Heavy stomp slam + horizontal sway | 💢 |
| Brook | Rattling bones fast shake + sway | 💢 |
| Jinbe | Wide intimidating Fish-Man stance + sway | 💢 |

#### 💧 Sad

| Character | Animation | Memory referenced |
|-----------|-----------|-------------------|
| Luffy | Heavy slow slump | Ace |
| Zoro | Barely moves, deep stillness | Kuina |
| Nami | Body wilts slowly | Arlong / village |
| Usopp | Trembling slow droop | I lied... |
| Sanji | Cigarette slump | All Blue / Baratie |
| Chopper | Very slow tiny droop | Hiriluk |
| Robin | Almost no movement — haunted stillness | Ohara |
| Franky | Heavy head-hang | Tom-san |
| Brook | Lonely gentle sway | Laboon |
| Jinbe | Solemn near-stillness | Tiger-san |

#### 👋 Wave

| Character | Animation | Particle |
|-----------|-----------|----------|
| Luffy | Big bouncy energetic wave | ⭐ |
| Zoro | Stiff minimal lift — barely waves | — |
| Nami | Flirty tilt-wave + horizontal sway | ❤️ |
| Usopp | Frantic bounce wave — 8000 soldiers!! | ⭐ |
| Sanji | Gentleman's flourish + gentle sway | ❤️ |
| Chopper | Jump-wave — YOIII!! | ❤️ |
| Robin | Graceful single-arm lift | 🌸 |
| Franky | Massive sweeping arm wave | ⭐ |
| Brook | Elegant top-hat sway | 🎵 |
| Jinbe | Broad deliberate slow wave | 💦 |

#### ⚡ Special *(3 rapid clicks)*

| Character | Move | Animation | Particle |
|-----------|------|-----------|----------|
| Luffy | Gear 2nd | Fast pump bounce (18px) + cx jolt | ⭐ ❤️ |
| Zoro | Asura | Multi-slash horizontal sway | ⭐ |
| Nami | Thunderbolt Tempo | Sharp lightning jolt (14px) | ⭐ |
| Usopp | Sogeking!! | Tall proud bounce (13px) | ⭐ |
| Sanji | Hell Memories | Fast spin + large horizontal sway | ❤️ ⭐ |
| Chopper | Monster Point | Biggest bounce of all (16px) | ⭐ ❤️ |
| Robin | Gigante Fleur | Slow bloom sway, flowers burst | 🌸 ⭐ |
| Franky | Coup de Vent | Forward-lean blast + horizontal sway | ⭐ |
| Brook | Soul Parade | Full fast dance sway | 🎵 ⭐ |
| Jinbe | Buraikan | Wide powerful stance + horizontal sway | 💦 ⭐ |

---

### 1. 🎩 Monkey D. Luffy — Captain

**Appearance:** Huge straw hat with wide brim + red band, red open vest, blue shorts, sandals, red scar under left eye.

**Idle behaviors:** `stretch` · `sniff` · `look_around`

| Emotion | Quote examples |
|---------|---------------|
| idle | "I'm hungry..." · "Gum Gum!" · "Shishishi..." |
| hover | "Shishishi!" · "Hey! You!" · "I'm Luffy!" |
| pet | "Hehe~ tickles!" · "I'm not a kid!" |
| click | "GOMU GOMU NO PISTOL!" · "HAAAAAH!" |
| dblclick | "GEAR SECOND!!" · "KING OF PIRATES!!" |
| happy | "SHISHISHI!!" · "MEAT!!!!!" |
| angry | "Don't hurt my nakama!!" · "I'll BEAT you!" |
| sad | "I miss Ace..." · "Nakama..." |
| sleep | "Zzz...meat..." |
| wave | "Hey!! OVER HERE!!" · "YOOOO!!" |
| excited | "MEAT!!" · "Shishishi!!!" |
| special | "GEAR SECOND!!" · "GOMU GOMU NO JET PISTOL!!" · "I'LL BE KING OF THE PIRATES!!" |

---

### 2. ⚔️ Roronoa Zoro — Swordsman

**Appearance:** Green spiky hair with 3 distinct spikes, 3 gold earrings on right ear, white open-collar shirt, chest scar (3 diagonal lines), 3 sword hilts at left hip, dark pants, black boots. Left eye always closed.

**Idle behaviors:** `sword_swing` · `meditate` · `look_around`

| Emotion | Quote examples |
|---------|---------------|
| idle | "Nothing but a scratch." · "..." |
| hover | "Don't distract me." · "Tch." |
| pet | "Don't touch my swords." · "Hn." |
| click | "Onigiri!!" · "Santoryu!" |
| dblclick | "ASURA!!" · "TRI-BLADE!!" |
| happy | "Not bad." · "I'll surpass him." |
| angry | "I'll cut you down!" · "Wado Ichimonji!" |
| sad | "...I'm lost again." · "Kuina..." |
| sleep | "Zzz..." |
| wave | "Oi!" · "...hey." |
| excited | "The world's greatest!" · "Heh." |
| special | "ASURA ICHIBUGIN!!" · "THREE THOUSAND WORLDS!!" · "I WILL SURPASS MIHAWK!!" |

---

### 3. 🍊 Nami — Navigator

**Appearance:** Long orange flowing hair (curves both sides of face), orange tattoo on left arm, blue bikini top, white shorts, sandals.

**Idle behaviors:** `count_coins` · `draw_map` · `look_around`

| Emotion | Quote examples |
|---------|---------------|
| idle | "Where's my Beli?" · "Navigation time!" |
| hover | "Hey cutie~" · "Don't touch the map!" |
| pet | "Hehe~ not bad~" · "Pay me first!" |
| click | "Clima Tact!" · "Take THAT!" |
| dblclick | "THUNDERBOLT TEMPO!!" · "You'll pay triple!" |
| happy | "Money!! Money!!" · "Wahahaha!" |
| angry | "Pay me back, LUFFY!!" · "Triple the price!!" |
| sad | "Arlong..." · "My village..." |
| sleep | "Zz...Beli..." |
| wave | "Yoohoo~!" · "Over here!" |
| excited | "A treasure map!" · "Gold!!" |
| special | "THUNDERBOLT TEMPO!!" · "MIRAGE TEMPO!!" · "PERFECT CLIMA TACT!!" |

---

### 4. 🎯 Usopp — Sniper

**Appearance:** Very long nose extending sideways (most distinctive!), dark curly afro, goggles on forehead, brown overalls, slingshot in left hand, dark boots.

**Idle behaviors:** `polish_slingshot` · `tell_story` · `look_around`

| Emotion | Quote examples |
|---------|---------------|
| idle | "Captain Usopp!!" · "I lied... maybe." |
| hover | "8000 soldiers!" · "Don't scare me!" |
| pet | "I-I'm not scared!" · "Captain Usopp!" |
| click | "USOPP FIRE!!" · "Kabuto!" |
| dblclick | "SPECIAL ATTACK!!" · "GIANT HAMMER!!" |
| happy | "I'm a brave warrior!" · "USOPP SHOT!" |
| angry | "I'm not lying!!" · "8000 men!!" |
| sad | "I-I lied..." · "Syrup Village..." |
| sleep | "Zzz...brave..." |
| wave | "Over here!! 8000 soldiers!" |
| excited | "I can do it!!" · "BRAVE WARRIOR!!" |
| special | "SOGEKING!!" · "KABUTO!!" · "CERTAIN KILL IMPACT WOLF!!" |

---

### 5. 🚬 Sanji — Cook

**Appearance:** Blonde hair completely covering the left eye (always), one visible right eye, curly eyebrow on right, cigarette extending from mouth, black suit, white shirt, red tie, black shoes.

**Idle behaviors:** `spin_kick` · `cook_air` · `look_around`

| Emotion | Quote examples |
|---------|---------------|
| idle | "Hmm... what to cook?" · "Mellorine~" |
| hover | "Mellorine!! ♥" · "A beautiful lady?" |
| pet | "Hehe~ only for ladies." · "Don't mess my suit." |
| click | "DIABLE JAMBE!!" · "FLAMBAGE SHOT!!" |
| dblclick | "SKY WALK!!" · "HELL MEMORIES!!" |
| happy | "Mellorine~~ ♥" · "For you, my lady!" |
| angry | "Don't insult food!!" · "I'll break your face!" |
| sad | "...All Blue..." · "Baratie..." |
| sleep | "Zzz...Nami-san..." |
| wave | "Nami-SAN~ ♥" · "Ohhh ladies~" |
| excited | "MELLORINE!!" · "Oh ho ho ho!" |
| special | "DIABLE JAMBE!!" · "HELL MEMORIES!!" · "SKY WALK!!" |

---

### 6. 🦌 Tony Tony Chopper — Doctor

**Appearance:** Large pink hat with blue cross (iconic!), brown antlers poking up from hat, small round brown furry body, blue nose, light chest patch, blue shorts, tiny dark hooves. (Shorter than other characters.)

**Idle behaviors:** `eat_candy` · `sniff` · `happy_dance`

| Emotion | Quote examples |
|---------|---------------|
| idle | "Don't call me cute!" · "Yoi!" |
| hover | "I'm not cute!!" · "Yoi yoi!" |
| pet | "D-don't praise me! Idiot!" · "Yoiii!" |
| click | "HORN POINT!!" · "Jumping Point!" |
| dblclick | "MONSTER POINT!!" · "RUMBLE BALL!!" |
| happy | "Yoiii!! ♥" · "So happy!!" |
| angry | "I'm not cute!! IDIOT!!" · "Yaaah!!" |
| sad | "Doctorine..." · "Hiriluk..." |
| sleep | "Zzz...cotton candy..." |
| wave | "YOIII!! HI!!" · "Hiiii~" |
| excited | "Yoii yoii!!" · "WOOOAH!!" |
| special | "MONSTER POINT!!" · "RUMBLE BALL!!" · "HORN POINT!!" |

---

### 7. 🌸 Nico Robin — Archaeologist

**Appearance:** Long black hair flowing wide on both sides (frames entire face), purple jacket over white inner, flower brooch on chest, purple skirt, dark heels. Calm expression.

**Idle behaviors:** `read_book` · `bloom_flowers` · `look_around`

| Emotion | Quote examples |
|---------|---------------|
| idle | "Ara ara..." · "History speaks." |
| hover | "...Hello." · "How interesting." |
| pet | "Ara ara~" · "...Thank you." |
| click | "Cien Fleur!" · "CLUTCH!" |
| dblclick | "GIGANTE FLEUR!!" · "DEMONIO FLEUR!!" |
| happy | "Ara ara~ ♥" · "How lovely." |
| angry | "Seis Fleur!" · "I'll break you." |
| sad | "...Ohara..." · "I want to live." |
| sleep | "Zzz...ruins..." |
| wave | "...Ara." · "Over here." |
| excited | "Ara ara ara~" · "A Poneglyph!!" |
| special | "GIGANTE FLEUR!!" · "DEMONIO FLEUR!!" · "Cien Fleur: Clutch!!" |

---

### 8. 🤖 Franky — Shipwright

**Appearance:** Tall swept-back blue pompadour, very wide cyborg shoulders (widest character), blue metal body, red star tattoo on chest, blue swim trunks, wide blue legs, black boots.

**Idle behaviors:** `flex` · `super_pose` · `cola_drink`

| Emotion | Quote examples |
|---------|---------------|
| idle | "SUPER!!" · "Franky SUPER!!" |
| hover | "Ohhh SUPER!!" · "You're looking at a LEGEND!" |
| pet | "SUPER!! I love it!" · "Heh heh!" |
| click | "FRANKY SHOGUN!!" · "COUP DE VENT!!" |
| dblclick | "GENERAL CANNON!!" · "SUPER DOCKING!!" |
| happy | "SUUUPER!! ♥" · "I'm SUPER!!" |
| angry | "SUPER ANGRY!!" · "Don't mess with me!" |
| sad | "Tom-san..." · "...SUPER sad." |
| sleep | "Zzz...cola..." |
| wave | "SUPER!! HEYYY!!" · "YOOO SUPER!!" |
| excited | "SUPER SUPER SUPER!!" · "The Thousand Sunny!!" |
| special | "FRANKY SHOGUN!!" · "COUP DE VENT!!" · "GENERAL CANNON!!" |

---

### 9. 💀 Brook — Musician

**Appearance:** Skull face (white head, hollow black eye sockets, teeth always visible, no nose), large black afro, tall black top hat, dark maroon hat band, very thin black suit, bow tie, bone-thin arms, sword cane.

**Idle behaviors:** `play_violin` · `skull_joke` · `look_around`

| Emotion | Quote examples |
|---------|---------------|
| idle | "Yohohoho!" · "May I see your panties?" |
| hover | "Yohohoho!!" · "Soul King Brook!" |
| pet | "Yohohoho~" · "I have no skin to blush!" |
| click | "SOUL SOLID!!" · "AUBADE COUP DROIT!" |
| dblclick | "SOUL PARADE!!" · "BROOK'S PARTY!!" |
| happy | "YOHOHOHO!! ♥" · "Skull joke!!" |
| angry | "Yohohoho... I'm angry!" · "On guard!" |
| sad | "Laboon..." · "My crew..." |
| sleep | "Zzz...yohoho..." |
| wave | "YOHOHOHO!! HEEEY!!" · "Soul King is here!!" |
| excited | "YOHOHOHOHO!!" · "SKULL JOKE!!" |
| special | "SOUL PARADE!!" · "NEMURIUTA FLANC!!" · "AUBADE COUP DROIT!!" |

---

### 10. 🐟 Jinbe — Helmsman

**Appearance:** Wide blue fish-man head (widest face), gill marks on both cheeks (3 lines per side), no hair (very short dark), orange kimono top, red sash belt, wide blue body, very wide stance.

**Idle behaviors:** `water_kata` · `meditate` · `look_around`

| Emotion | Quote examples |
|---------|---------------|
| idle | "Calm down." · "Steady as the sea." |
| hover | "Luffy-kun..." · "What is it?" |
| pet | "...Thank you." · "Strong as the tide." |
| click | "FISH-MAN KARATE!!" · "VAGABOND DRILL!!" |
| dblclick | "THOUSAND SHARK!!" · "BURAIKAN!!" |
| happy | "...This is good." · "Ha ha ha!" |
| angry | "FISH-MAN KARATE!!" · "Don't test me!" |
| sad | "Tiger-san..." · "Arlong..." |
| sleep | "Zzz...ocean..." |
| wave | "HEYYYY!!" · "Come, join us!" |
| excited | "NAKAMA!!" · "The Straw Hats!!" |
| special | "FISH-MAN KARATE!!" · "BURAIKAN!!" · "THOUSAND SHARK!!" |

---

## 🎭 Idle Animation Behaviors (Reference)

These trigger automatically every ~8–14 seconds when the character is idle:

| Behavior | Characters | What happens |
|----------|-----------|--------------|
| `stretch` | Luffy | Arms raise slowly, body bobs |
| `sniff` | Luffy, Chopper | Head tilts side to side, hearts spawn |
| `look_around` | All | Character slides left and right |
| `sword_swing` | Zoro | Right arm swings wide |
| `meditate` | Zoro, Jinbe | Arms fold in, very slow bob |
| `count_coins` | Nami | Right arm moves up/down, coins spawn |
| `draw_map` | Nami | Arms held forward, body rocks |
| `polish_slingshot` | Usopp | Left arm moves rhythmically |
| `tell_story` | Usopp | Both arms gesture, stars spawn |
| `spin_kick` | Sanji | Body bounces, left arm sweeps |
| `cook_air` | Sanji | Right arm stirs, body tilts |
| `eat_candy` | Chopper | Body bobs happily, hearts spawn |
| `happy_dance` | Chopper | Jumping dance, arms flail, hearts |
| `read_book` | Robin | Arms held still, gentle rock |
| `bloom_flowers` | Robin | Flowers spawn around character |
| `flex` | Franky | Arms raise into flex pose, stars |
| `super_pose` | Franky | Both arms out wide, stars burst |
| `cola_drink` | Franky | Right arm down, left arm in |
| `play_violin` | Brook | Left arm bows rhythmically, music notes |
| `skull_joke` | Brook | Body bounces, stars spawn |
| `water_kata` | Jinbe | Both arms sweep side to side, water drops |

---

## 🛠️ Tech Stack

- **[Electron](https://www.electronjs.org/)** — cross-platform desktop shell
- **Canvas 2D API** — all character art is drawn in JavaScript with arcs, paths and fills (no images)
- **IPC (contextBridge)** — secure main ↔ renderer communication
- **Electron Builder** — packaging for macOS / Windows / Linux

---

## 📜 License

MIT — free to use, modify, and distribute.

---

*Going Merry not included. 🚢*
