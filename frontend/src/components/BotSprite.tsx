'use client';

import { motion } from 'framer-motion';
import { BOT_CHARACTERS } from '@/lib/constants';

interface BotSpriteProps {
  botId: string;
  characterId: number;
  size?: number;
  showLabel?: boolean;
  username?: string;
}

export default function BotSprite({
  botId,
  characterId,
  size = 32,
  showLabel = false,
  username,
}: BotSpriteProps) {
  const character = BOT_CHARACTERS.find((c) => c.id === characterId) || BOT_CHARACTERS[0];
  const displayNumber = characterId;
  const displayLabel = username || character.name;

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          backgroundColor: `${character.color}33`,
          border: `2px solid ${character.color}`,
          boxShadow: `0 0 8px ${character.color}66, inset 0 0 4px ${character.color}33`,
        }}
        animate={{
          y: [0, -2, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: characterId * 0.15,
        }}
      >
        {/* Inner glow */}
        <div
          className="absolute inset-1 rounded-full opacity-40"
          style={{
            background: `radial-gradient(circle, ${character.color}44 0%, transparent 70%)`,
          }}
        />

        {/* Bot number */}
        <span
          className="relative font-orbitron font-bold z-10"
          style={{
            fontSize: Math.max(size * 0.35, 8),
            color: character.color,
            textShadow: `0 0 4px ${character.color}`,
          }}
        >
          {displayNumber}
        </span>
      </motion.div>

      {/* Label */}
      {showLabel && (
        <span
          className="mt-1 text-center font-mono leading-none"
          style={{
            fontSize: Math.max(size * 0.25, 8),
            color: character.color,
            maxWidth: size * 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayLabel}
        </span>
      )}
    </motion.div>
  );
}
