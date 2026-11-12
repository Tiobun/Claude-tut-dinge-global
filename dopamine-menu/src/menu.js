import {
  Zap, Flame, Moon, Sparkles,
  Disc3, Gem, WandSparkles, Spade,
  CodeXml, Factory, ChefHat, MessageCircle,
  Sofa, BookOpen, Orbit,
  Bot, Carrot,
} from 'lucide-react'

// accent: tailwind classes used for the icon tile of every item in the category
export const MENU = [
  {
    id: 'starters',
    name: 'Starters',
    tagline: 'Quick hit',
    time: '5–15 min',
    icon: Zap,
    accent: 'bg-mustard/15 text-mustard ring-mustard/30',
    items: [
      { title: 'Flip a vinyl', detail: 'Drop the needle on the turntable', icon: Disc3 },
      { title: 'Browse CS2 skins', detail: 'Budget blue & sapphire finds', icon: Gem },
      { title: 'Escape room idea', detail: 'Jot one Harry Potter puzzle', icon: WandSparkles },
      { title: 'Faraway or Wizard', detail: 'One quick round', icon: Spade },
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
      { title: 'Padel Score-Tracker', detail: 'Keep coding the app', icon: CodeXml },
      { title: 'Factorio or Loop Hero', detail: 'Settle in for a long run', icon: Factory },
      { title: 'Cook something vegan', detail: 'Mushroom bao or pumpkin lasagna', icon: ChefHat },
      { title: 'Message Colin', detail: 'Set up a padel match', icon: MessageCircle },
    ],
  },
  {
    id: 'desserts',
    name: 'Desserts',
    tagline: 'Low energy',
    time: 'Unwind',
    icon: Moon,
    accent: 'bg-teal-cord/20 text-teal-mist ring-teal-cord/40',
    items: [
      { title: 'Sofa + full album', detail: 'Crash on the corduroy couch', icon: Sofa },
      { title: 'SETI or Clocktower', detail: 'Rules & theory-crafting', icon: BookOpen },
      { title: 'Space Age interiors', detail: '1970s inspiration hunt', icon: Orbit },
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
      { title: 'Start the robot vacuum', detail: 'Let it roam', icon: Bot },
      { title: 'Prep for tomorrow', detail: 'Seidentofu & ingredients', icon: Carrot },
    ],
  },
]

export const ALL_ITEMS = MENU.flatMap((cat) =>
  cat.items.map((item) => ({ ...item, category: cat })),
)
