import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, RotateCcw, Trophy } from 'lucide-react';
import GlassCard from '../components/GlassCard';

/* ═══════════════════════════════════════════
   Bubble Pop Game
   ═══════════════════════════════════════════ */
function BubblePop() {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const intervalRef = useRef(null);
  const spawnRef = useRef(null);

  const COLORS = ['from-sage-200 to-sage-400', 'from-warm-200 to-warm-400', 'from-sage-300 to-warm-300', 'from-warm-300 to-sage-400'];

  const start = () => {
    setScore(0);
    setBubbles([]);
    setTimeLeft(30);
    setActive(true);
  };

  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setActive(false);
          clearInterval(intervalRef.current);
          clearInterval(spawnRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    spawnRef.current = setInterval(() => {
      setBubbles(prev => [...prev, {
        id: Date.now() + Math.random(),
        x: 10 + Math.random() * 75,
        size: 30 + Math.random() * 40,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speed: 3 + Math.random() * 4,
      }].slice(-15));
    }, 600);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(spawnRef.current);
    };
  }, [active]);

  // Remove bubbles that float off
  useEffect(() => {
    if (!active) return;
    const clean = setInterval(() => {
      setBubbles(prev => prev.filter(b => Date.now() - b.id < b.speed * 2500));
    }, 1000);
    return () => clearInterval(clean);
  }, [active]);

  const pop = (id) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(s => s + 1);
  };

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">🫧 Bubble Pop</h3>
        {active && <span className="chip">{timeLeft}s</span>}
      </div>

      <div
        className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-sage-50/50 to-warm-50/50 dark:from-sage-700/10 dark:to-warm-700/10"
        style={{ height: 280 }}
      >
        {!active && timeLeft === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center glass-strong rounded-2xl p-6">
              <Trophy size={32} className="text-warm-500 mx-auto mb-2" />
              <div className="text-2xl font-semibold">{score}</div>
              <div className="text-xs opacity-60 mb-3">bubbles popped!</div>
              <button onClick={start} className="btn-primary text-sm">
                <RotateCcw size={14} /> Play again
              </button>
            </div>
          </div>
        )}

        {!active && timeLeft > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button onClick={start} className="btn-primary">
              <Gamepad2 size={16} /> Start popping
            </button>
          </div>
        )}

        <AnimatePresence>
          {bubbles.map(b => (
            <motion.button
              key={b.id}
              initial={{ y: 280, opacity: 0.8 }}
              animate={{ y: -b.size - 20, opacity: [0.8, 1, 0.6] }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: b.speed, ease: 'linear' }}
              onClick={() => pop(b.id)}
              className={`absolute rounded-full bg-gradient-to-br ${b.color} cursor-pointer hover:scale-110 transition-transform`}
              style={{
                left: `${b.x}%`,
                width: b.size,
                height: b.size,
                boxShadow: '0 0 20px rgba(148,180,145,0.2)',
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {active && (
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="chip">Score: {score}</span>
          <button onClick={() => { setActive(false); setTimeLeft(0); }} className="btn-ghost !py-1.5 text-xs">End</button>
        </div>
      )}
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════
   Memory Game
   ═══════════════════════════════════════════ */
const EMOJIS = ['🌿', '🌸', '🌊', '☀️', '🦋', '🍃', '💧', '🌙'];

function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);

  const init = useCallback(() => {
    const pairs = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, key: `${emoji}-${i}` }));
    setCards(pairs);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }, []);

  useEffect(() => { init(); }, [init]);

  const flip = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;
    const next = [...flipped, id];
    setFlipped(next);

    if (next.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = next;
      if (cards[a].emoji === cards[b].emoji) {
        setMatched(m => [...m, a, b]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const won = matched.length === cards.length && cards.length > 0;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">🧠 Memory</h3>
        <div className="flex gap-2">
          <span className="chip">{moves} moves</span>
          <button onClick={init} className="btn-ghost !p-1.5 !rounded-lg" title="Reset">
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {won && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-4"
        >
          <div className="text-3xl mb-2">🎉</div>
          <p className="text-sm font-medium">All matched in {moves} moves!</p>
          <button onClick={init} className="btn-primary text-sm mt-3">
            <RotateCcw size={14} /> Play again
          </button>
        </motion.div>
      )}

      {!won && (
        <div className="grid grid-cols-4 gap-2">
          {cards.map((card) => {
            const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
            return (
              <motion.button
                key={card.key}
                onClick={() => flip(card.id)}
                whileTap={{ scale: 0.95 }}
                className={`aspect-square rounded-xl text-xl flex items-center justify-center transition-all duration-300 ${
                  isFlipped
                    ? 'glass-strong scale-105'
                    : 'glass-subtle hover:bg-white/40 dark:hover:bg-white/10 cursor-pointer'
                } ${matched.includes(card.id) ? 'opacity-60' : ''}`}
              >
                {isFlipped ? card.emoji : '?'}
              </motion.button>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════
   Sliding Puzzle (3x3)
   ═══════════════════════════════════════════ */
function SlidingPuzzle() {
  const SIZE = 3;
  const TOTAL = SIZE * SIZE;

  const isSolvable = (arr) => {
    let inv = 0;
    for (let i = 0; i < arr.length; i++)
      for (let j = i + 1; j < arr.length; j++)
        if (arr[i] && arr[j] && arr[i] > arr[j]) inv++;
    return inv % 2 === 0;
  };

  const shuffle = () => {
    let tiles;
    do {
      tiles = Array.from({ length: TOTAL }, (_, i) => i)
        .sort(() => Math.random() - 0.5);
    } while (!isSolvable(tiles) || tiles.every((t, i) => t === i));
    return tiles;
  };

  const [tiles, setTiles] = useState(() => shuffle());
  const [moves, setMoves] = useState(0);

  const won = tiles.every((t, i) => t === i);
  const empty = tiles.indexOf(0);
  const emptyRow = Math.floor(empty / SIZE);
  const emptyCol = empty % SIZE;

  const moveTile = (idx) => {
    const row = Math.floor(idx / SIZE);
    const col = idx % SIZE;
    const canMove =
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1);
    if (!canMove) return;
    const next = [...tiles];
    [next[idx], next[empty]] = [next[empty], next[idx]];
    setTiles(next);
    setMoves(m => m + 1);
  };

  const reset = () => {
    setTiles(shuffle());
    setMoves(0);
  };

  const TILE_COLORS = ['', 'bg-sage-200/60 dark:bg-sage-700/20', 'bg-warm-200/60 dark:bg-warm-700/20', 'bg-sage-100/60 dark:bg-sage-700/15', 'bg-warm-100/60 dark:bg-warm-700/15', 'bg-sage-200/40 dark:bg-sage-700/10', 'bg-warm-200/40 dark:bg-warm-700/10', 'bg-sage-100/40 dark:bg-sage-700/8', 'bg-warm-100/40 dark:bg-warm-700/8'];

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">🧩 Calm Puzzle</h3>
        <div className="flex gap-2">
          <span className="chip">{moves} moves</span>
          <button onClick={reset} className="btn-ghost !p-1.5 !rounded-lg" title="Reset">
            <RotateCcw size={12} />
          </button>
        </div>
      </div>

      {won ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-6"
        >
          <div className="text-3xl mb-2">✨</div>
          <p className="text-sm font-medium">Solved in {moves} moves!</p>
          <button onClick={reset} className="btn-primary text-sm mt-3">
            <RotateCcw size={14} /> New puzzle
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
          {tiles.map((tile, i) => (
            <motion.button
              key={i}
              layout
              onClick={() => moveTile(i)}
              className={`aspect-square rounded-xl text-lg font-semibold flex items-center justify-center transition-colors ${
                tile === 0
                  ? 'opacity-0 cursor-default'
                  : `${TILE_COLORS[tile]} glass-subtle hover:scale-105 cursor-pointer`
              }`}
            >
              {tile || ''}
            </motion.button>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */
export default function GameZone() {
  const { t } = useTranslation();

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2">
          <Gamepad2 size={24} className="text-warm-500" />
          {t('sidebar.games')}
        </h1>
        <p className="text-sm opacity-60 mt-2 max-w-lg">
          Light, calming games. No scores to stress about — just a small distraction.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BubblePop />
        <MemoryGame />
        <SlidingPuzzle />
      </div>
    </div>
  );
}
