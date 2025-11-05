#!/usr/bin/env node

/**
 * Process Moyens Enseignants data to extract academy totals for the most recent year
 *
 * Input: fr-en-moyens_enseignants_2d_public.csv (semicolon-delimited)
 * Output: moyens-enseignants-by-academy.csv (comma-delimited)
 *
 * Logic:
 * 1. Filter for most recent year (2024)
 * 2. Extract "Total Académie" rows
 * 3. Extract H/E indicator (heures par élève)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const INPUT_FILE = path.join(__dirname, '../src/public/data/fr-en-moyens_enseignants_2d_public.csv')
const OUTPUT_FILE = path.join(__dirname, '../src/public/data/moyens-enseignants-by-academy.csv')

function parseCSV(content, delimiter = ';') {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(delimiter)

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter)
    const row = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    rows.push(row)
  }

  return rows
}

function normalizeAcademyName(name) {
  // Extract academy name from "Total Académie XXX" format
  const match = name.match(/Total Académie (.+)/)
  if (!match)
    return null

  const academyName = match[1].trim()

  // Normalize to match TopoJSON format
  const normalized = academyName.toLowerCase()

  const mappings = {
    'aix-marseille': 'Aix-Marseille',
    'amiens': 'Amiens',
    'besancon': 'Besançon',
    'bordeaux': 'Bordeaux',
    'clermont-ferrand': 'Clermont-Ferrand',
    'corse': 'Corse',
    'creteil': 'Créteil',
    'dijon': 'Dijon',
    'grenoble': 'Grenoble',
    'guadeloupe': 'Guadeloupe',
    'guyane': 'Guyane',
    'lille': 'Lille',
    'limoges': 'Limoges',
    'lyon': 'Lyon',
    'martinique': 'Martinique',
    'montpellier': 'Montpellier',
    'nancy-metz': 'Nancy-Metz',
    'nantes': 'Nantes',
    'nice': 'Nice',
    'normandie': 'Normandie',
    'orleans-tours': 'Orléans-Tours',
    'paris': 'Paris',
    'poitiers': 'Poitiers',
    'reims': 'Reims',
    'rennes': 'Rennes',
    'strasbourg': 'Strasbourg',
    'toulouse': 'Toulouse',
    'versailles': 'Versailles',
    'la reunion': 'La Réunion',
    'mayotte': 'Mayotte',
  }

  return mappings[normalized] || academyName
}

function main() {
  console.log('Reading CSV file...')
  const content = fs.readFileSync(INPUT_FILE, 'utf-8')

  console.log('Parsing CSV...')
  const rows = parseCSV(content, ';')

  console.log(`Total rows: ${rows.length}`)

  // Filter for most recent year (2024) and Total Académie rows
  const mostRecentYear = '2024'
  console.log(`Filtering for year: ${mostRecentYear}`)

  const academyRows = rows.filter((row) => {
    const year = row['Année']
    const uai = row.UAI || ''

    return year === mostRecentYear && uai.startsWith('Total Académie')
  })

  console.log(`Academy total rows for ${mostRecentYear}: ${academyRows.length}`)

  // Process academy data (use Map to avoid duplicates)
  const academyData = new Map()

  for (const row of academyRows) {
    const uai = row.UAI
    const academyName = normalizeAcademyName(uai)

    if (!academyName) {
      console.warn(`Could not parse academy name from: ${uai}`)
      continue
    }

    // Extract H/E indicator (heures par élève)
    const heValue = row['H/E']

    if (!heValue) {
      console.warn(`Missing H/E value for: ${academyName}`)
      continue
    }

    // Parse value (handle comma as decimal separator)
    const he = Number.parseFloat(heValue.replace(',', '.'))

    if (Number.isNaN(he)) {
      console.warn(`Invalid H/E value for ${academyName}: ${heValue}`)
      continue
    }

    // Skip if already exists (take first occurrence)
    if (academyData.has(academyName)) {
      console.log(`  ${academyName}: ${he.toFixed(2)} heures/élève (duplicate, skipped)`)
      continue
    }

    academyData.set(academyName, he.toFixed(2))
    console.log(`  ${academyName}: ${he.toFixed(2)} heures/élève`)
  }

  // Convert Map to array and sort by academy name
  const results = Array.from(academyData.entries())
    .map(([academie, heures_par_eleve]) => ({ academie, heures_par_eleve }))
    .sort((a, b) => a.academie.localeCompare(b.academie))

  console.log(`\nTotal academies processed: ${results.length}`)

  // Write output CSV
  console.log(`\nWriting output to: ${OUTPUT_FILE}`)
  const headers = ['academie', 'heures_par_eleve']
  const csvContent = [
    headers.join(','),
    ...results.map(row => `${row.academie},${row.heures_par_eleve}`),
  ].join('\n')

  fs.writeFileSync(OUTPUT_FILE, csvContent, 'utf-8')
  console.log('Done!')
}

main()
