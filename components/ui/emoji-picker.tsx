"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

// Common emoji categories
const emojis = {
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "🤣",
    "😂",
    "🙂",
    "🙃",
    "😉",
    "😊",
    "😇",
    "🥰",
    "😍",
    "🤩",
    "😘",
    "😗",
    "😚",
    "😙",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
  ],
  people: [
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "👇",
    "☝️",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🙏",
    "✍️",
    "💅",
    "🤳",
    "💪",
    "👨",
    "👩",
    "🧑",
  ],
  nature: [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🦆",
    "🌵",
    "🌲",
    "🌴",
    "🌱",
    "🌿",
    "☘️",
    "🍀",
    "🍁",
    "🍂",
    "🍃",
  ],
  food: [
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🍆",
    "🥑",
    "🥦",
    "🥬",
    "🍔",
    "🍟",
    "🍕",
    "🌭",
    "🥪",
    "🌮",
    "🌯",
    "🥙",
    "🍝",
    "🍜",
  ],
  activities: [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🏓",
    "🏸",
    "🥅",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "⛳",
    "🪁",
    "🎣",
    "🎮",
    "🎲",
    "🧩",
    "🎭",
    "🎨",
    "🎬",
    "🎤",
    "🎧",
    "🎼",
    "🎹",
  ],
  travel: [
    "🚗",
    "🚕",
    "🚙",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🚚",
    "🚛",
    "🚜",
    "🛴",
    "🚲",
    "🛵",
    "🏍️",
    "🚨",
    "🚔",
    "🚍",
    "✈️",
    "🛫",
    "🛬",
    "🛩️",
    "🚀",
    "🛸",
    "🚁",
    "🛶",
    "⛵",
    "🚤",
  ],
  objects: [
    "⌚",
    "📱",
    "💻",
    "⌨️",
    "🖥️",
    "🖨️",
    "🖱️",
    "🖲️",
    "🕹️",
    "🗜️",
    "💽",
    "💾",
    "💿",
    "📀",
    "📼",
    "📷",
    "📸",
    "📹",
    "🎥",
    "📽️",
    "🔋",
    "🔌",
    "💡",
    "🔦",
    "🕯️",
    "🧯",
    "🛢️",
    "💸",
    "💵",
    "💴",
  ],
  symbols: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
    "✝️",
    "☪️",
    "🕉️",
    "☸️",
    "✡️",
    "🔯",
    "🕎",
    "☯️",
    "☦️",
    "🛐",
  ],
}

type EmojiPickerProps = {
  onEmojiSelect: (emoji: string) => void
}

export default function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
  }

  const filterEmojis = (category: string[]) => {
    if (!searchQuery) return category
    return category.filter((emoji) => emoji.includes(searchQuery))
  }

  return (
    <div className="w-64 bg-background border rounded-md shadow-md">
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emoji..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="smileys">
        <TabsList className="w-full justify-start overflow-auto">
          <TabsTrigger value="smileys">😀</TabsTrigger>
          <TabsTrigger value="people">👍</TabsTrigger>
          <TabsTrigger value="nature">🐶</TabsTrigger>
          <TabsTrigger value="food">🍎</TabsTrigger>
          <TabsTrigger value="activities">⚽</TabsTrigger>
          <TabsTrigger value="travel">🚗</TabsTrigger>
          <TabsTrigger value="objects">💻</TabsTrigger>
          <TabsTrigger value="symbols">❤️</TabsTrigger>
        </TabsList>

        {Object.entries(emojis).map(([category, categoryEmojis]) => (
          <TabsContent key={category} value={category} className="m-0">
            <ScrollArea className="h-48 p-2">
              <div className="grid grid-cols-8 gap-1">
                {filterEmojis(categoryEmojis).map((emoji, index) => (
                  <button
                    key={index}
                    className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded cursor-pointer text-lg"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
