import {
  Zap, Flame, Moon, Sparkles,
  NotebookPen, GlassWater, Disc3, ListMusic, Gem, Puzzle, Trash2, Dumbbell,
  Languages, Archive, BookOpen, Lamp,
  CodeXml, Globe, Gamepad2, ChefHat, Footprints, Workflow, Wrench, Terminal,
  Target, Armchair, Car,
  AudioWaveform, Sofa, BedDouble, MonitorPlay, LayoutGrid, Dices, ShowerHead,
  Bot, SprayCan, Carrot, UtensilsCrossed, Laptop, Package, Backpack, Coffee,
} from 'lucide-react'

/*
 * The pool. Every activity is solo and independent.
 * Add as many as you like — the UI only ever shows 3–4 per category.
 * `id` must be unique and stable (it's used to remember what you've done today).
 */
export const MENU = [
  {
    id: 'starters',
    name: 'Starters',
    tagline: 'Quick hit',
    time: '5–15 min',
    icon: Zap,
    accent: 'bg-mustard/15 text-mustard ring-mustard/30',
    items: [
      { id: 'brain-dump', title: '3-minute brain dump', detail: 'Every floating thought, on paper', icon: NotebookPen },
      { id: 'water-stretch', title: 'Cold water + stretch', detail: 'One massive glass, two minutes of stretching', icon: GlassWater },
      { id: 'vinyl-song', title: 'One song on vinyl', detail: 'Pull a random record and just listen', icon: Disc3 },
      { id: 'discover-weekly', title: 'Find a new playlist', detail: 'Dig through Discover Weekly', icon: ListMusic },
      { id: 'cs2-skins', title: 'Browse CS2 skins', detail: 'Budget blue & sapphire finds', icon: Gem },
      { id: 'escape-sketch', title: 'Sketch a puzzle', detail: 'One mechanic for the Escape Room', icon: Puzzle },
      { id: 'phone-cleanup', title: 'Delete 10 things', detail: 'Old emails or stray screenshots', icon: Trash2 },
      { id: 'squats', title: '15 squats or push-ups', detail: 'Spike the heart rate', icon: Dumbbell },
      { id: 'korean', title: '3 new Korean words', detail: 'One quick round in the app', icon: Languages },
      { id: 'one-drawer', title: 'Reorganize one drawer', detail: 'Exactly one drawer or shelf', icon: Archive },
      { id: 'one-chapter', title: 'Read one chapter', detail: 'Or a single tech article', icon: BookOpen },
      { id: 'space-age-decor', title: 'Space Age decor hunt', detail: '1970s interior inspiration', icon: Lamp },
    ],
  },
  {
    id: 'mains',
    name: 'Mains',
    tagline: 'Deep focus',
    time: '1–3 hrs',
    icon: Flame,
    accent: 'bg-rust/15 text-[#e07a4a] ring-rust/30',
    items: [
      { id: 'code-project', title: 'Code a personal project', detail: 'Padel Score-Tracker or something new', icon: CodeXml },
      { id: 'wiki-hole', title: 'Wikipedia rabbit hole', detail: 'A random tech or history topic', icon: Globe },
      { id: 'solo-game', title: 'Single-player game', detail: 'Factorio, Loop Hero or 33 Immortals', icon: Gamepad2 },
      { id: 'vegan-cook', title: 'Cook something ambitious', detail: 'Vegan, from scratch. Try a siphon foam', icon: ChefHat },
      { id: 'podcast-walk', title: '45-minute power walk', detail: 'Fast pace, good podcast', icon: Footprints },
      { id: 'servicenow', title: 'Build a Flow Designer flow', detail: 'ServiceNow practice, just for you', icon: Workflow },
      { id: 'escape-props', title: 'Craft Escape Room props', detail: 'Solder, glue, build', icon: Wrench },
      { id: 'new-framework', title: 'Learn a new tool', detail: 'A JS framework or Cursor feature', icon: Terminal },
      { id: 'padel-solo', title: 'Solo padel practice', detail: 'Serve at a wall or study pro matches', icon: Target },
      { id: 'rearrange-room', title: 'Rearrange a room', detail: 'Furniture, posters, plants', icon: Armchair },
      { id: 'yaris-detail', title: 'Detail the Yaris', detail: 'Deep clean the interior', icon: Car },
    ],
  },
  {
    id: 'desserts',
    name: 'Desserts',
    tagline: 'Recharge',
    time: 'Low energy',
    icon: Moon,
    accent: 'bg-teal-cord/20 text-teal-mist ring-teal-cord/40',
    items: [
      { id: 'brown-noise', title: 'Floor + brown noise', detail: 'Ten minutes, lying down', icon: AudioWaveform },
      { id: 'sofa-album', title: 'A full album, no screen', detail: 'On the corduroy sofa', icon: Sofa },
      { id: 'nsdr', title: '10-minute NSDR', detail: 'Or a guided Yoga Nidra', icon: BedDouble },
      { id: 'satisfying-video', title: 'A satisfying video', detail: 'Restoration, coding or cleaning', icon: MonitorPlay },
      { id: 'mood-board', title: '2027 apartment mood board', detail: 'Pinterest or Milanote', icon: LayoutGrid },
      { id: 'rulebook', title: 'Board game theory-craft', detail: 'SETI or Wizard rules & strategy', icon: Dices },
      { id: 'hot-shower', title: 'Long hot shower', detail: 'Officially close the day', icon: ShowerHead },
    ],
  },
  {
    id: 'sides',
    name: 'Sides',
    tagline: 'Small wins',
    time: '2–10 min',
    icon: Sparkles,
    accent: 'bg-chrome/10 text-chrome ring-chrome/25',
    items: [
      { id: 'robot-vacuum', title: 'Start the robot vacuum', detail: 'Clear the floor for the Xiaomi first', icon: Bot },
      { id: 'sink-mirror', title: 'Sink & mirror', detail: 'Just those two, nothing else', icon: SprayCan },
      { id: 'meal-prep', title: 'Prep for tomorrow', detail: 'Seidentofu or beluga lentils', icon: Carrot },
      { id: 'dishwasher', title: 'Dishwasher', detail: 'Unpack it or load it', icon: UtensilsCrossed },
      { id: 'desk-wipe', title: 'Wipe the desk setup', detail: 'Screen, keyboard, mouse', icon: Laptop },
      { id: 'put-away-5', title: 'Put away 5 things', detail: 'Exactly five, then stop', icon: Package },
      { id: 'sports-bag', title: 'Pack the sports bag', detail: 'Ready for tomorrow', icon: Backpack },
      { id: 'kenwood-coffee', title: 'Clean kitchen gear', detail: 'Kenwood or the coffee setup', icon: Coffee },
    ],
  },
]

export const ITEM_BY_ID = Object.fromEntries(
  MENU.flatMap((cat) => cat.items.map((item) => [item.id, { ...item, category: cat }])),
)
