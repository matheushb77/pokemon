import { poolForTier, tierById } from './power.js'

// O caminho do modo tabuleiro.
//
// Dez casas, uma luta em cada. A cada casa você recebe um Pokémon sorteado e
// enfrenta um rival da mesma faixa de força, então a luta é sempre de igual
// para igual. O que muda é a faixa: o caminho começa na Leve e termina na
// Lendária, e é por isso que vale a pena avançar.
//
// Perder devolve você para a primeira casa. Nada de meio caminho andado.

export const SQUARES = [
  { number: 1, tier: 'leve' },
  { number: 2, tier: 'leve' },
  { number: 3, tier: 'medio' },
  { number: 4, tier: 'medio' },
  { number: 5, tier: 'forte' },
  { number: 6, tier: 'forte' },
  { number: 7, tier: 'elite' },
  { number: 8, tier: 'elite' },
  { number: 9, tier: 'lendario' },
  { number: 10, tier: 'lendario' },
]

export const LAST_SQUARE = SQUARES.length

export function squareAt(position) {
  return SQUARES[position] || SQUARES[0]
}

export function tierLabelAt(position) {
  return tierById(squareAt(position).tier).label
}

// O Pokémon que a casa entrega ao jogador: um sorteado dentro da faixa dela.
export function drawForSquare(catalog, position) {
  const pool = poolForTier(catalog, squareAt(position).tier)
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}
