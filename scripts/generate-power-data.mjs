// Gera src/data/power.json com a força de cada Pokémon.
//
// A força é a soma dos seis atributos base (vida, ataque, defesa, ataque
// especial, defesa especial e velocidade), que é como a própria comunidade de
// Pokémon compara quem é forte: Caterpie soma 195, Mewtwo soma 680.
//
// Serve para o sorteio não colocar um contra o outro. A geração não resolve
// isso, porque os dois são da primeira geração.
//
// Consultar os 1.300 Pokémon no navegador seria lento, então este script lê as
// tabelas oficiais da PokeAPI (os mesmos dados que alimentam a API) e salva um
// arquivo pequeno dentro do projeto.
//
// Uso:
//   npm run dados:forca              # baixa as tabelas do GitHub da PokeAPI
//   npm run dados:forca -- ./pasta   # usa pokemon_stats.csv local
//
// Rode de novo quando a PokeAPI receber uma geração nova.

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE_URL = 'https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv'
const OUTPUT_PATH = join(dirname(fileURLToPath(import.meta.url)), '../src/data/power.json')
const STATS_PER_POKEMON = 6

async function readTable(name, localDirectory) {
  let text

  if (localDirectory) {
    text = await readFile(join(localDirectory, `${name}.csv`), 'utf8')
  } else {
    const response = await fetch(`${SOURCE_URL}/${name}.csv`)
    if (!response.ok) throw new Error(`Não foi possível baixar ${name}.csv (erro ${response.status}).`)
    text = await response.text()
  }

  const [header, ...lines] = text.trim().split(/\r?\n/)
  const columns = header.split(',')

  return lines.map((line) => {
    const values = line.split(',')
    return Object.fromEntries(columns.map((column, index) => [column, values[index]]))
  })
}

const localDirectory = process.argv[2]
const statRows = await readTable('pokemon_stats', localDirectory)

const somaPorPokemon = new Map()
const quantosPorPokemon = new Map()

for (const row of statRows) {
  const id = Number(row.pokemon_id)
  somaPorPokemon.set(id, (somaPorPokemon.get(id) || 0) + Number(row.base_stat))
  quantosPorPokemon.set(id, (quantosPorPokemon.get(id) || 0) + 1)
}

for (const [id, quantos] of quantosPorPokemon) {
  if (quantos !== STATS_PER_POKEMON) {
    throw new Error(`O Pokémon ${id} tem ${quantos} atributos em vez de ${STATS_PER_POKEMON}.`)
  }
}

const totals = {}
for (const [id, soma] of [...somaPorPokemon].sort((a, b) => a[0] - b[0])) {
  totals[id] = soma
}

await mkdir(dirname(OUTPUT_PATH), { recursive: true })
await writeFile(
  OUTPUT_PATH,
  `${JSON.stringify({ source: `${SOURCE_URL}/pokemon_stats.csv`, totals })}\n`,
)

const valores = Object.values(totals).sort((a, b) => a - b)
const percentil = (p) => valores[Math.floor((valores.length - 1) * p)]

console.log(`${valores.length} Pokémon salvos em src/data/power.json`)
console.log(`menor ${valores[0]}, maior ${valores[valores.length - 1]}`)
console.log('percentis 25/50/75/90:', percentil(0.25), percentil(0.5), percentil(0.75), percentil(0.9))
