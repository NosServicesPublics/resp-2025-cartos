#!/usr/bin/env node

/**
 * Process IPS Colleges data to aggregate by academy for the most recent year
 *
 * Input: fr-en-ips_colleges.csv (semicolon-delimited)
 * Output: ips-colleges-by-academy.csv (comma-delimited)
 *
 * Logic:
 * 1. Filter for most recent year (2021-2022)
 * 2. Group by academy
 * 3. Calculate mean IPS per academy
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const INPUT_FILE = path.join(__dirname, '../src/public/data/fr-en-ips_colleges.csv')
const OUTPUT_FILE = path.join(__dirname, '../src/public/data/ips-colleges-by-academy.csv')

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
  // Normalize academy names to match TopoJSON format
  const normalized = name.trim().toLowerCase()

  // Special cases
  const mappings = {
    'aix-marseille': 'Aix-Marseille',
    'amiens': 'Amiens',
    'besancon': 'Besançon',
    'bordeaux': 'Bordeaux',
    'caen': 'Normandie', // Merged into Normandie
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
    'orleans-tours': 'Orléans-Tours',
    'paris': 'Paris',
    'poitiers': 'Poitiers',
    'reims': 'Reims',
    'rennes': 'Rennes',
    'rouen': 'Normandie', // Merged into Normandie
    'strasbourg': 'Strasbourg',
    'toulouse': 'Toulouse',
    'versailles': 'Versailles',
    'la reunion': 'La Réunion',
    'mayotte': 'Mayotte',
  }

  return mappings[normalized] || name
}

function main() {
  console.log('Reading CSV file...')
  const content = fs.readFileSync(INPUT_FILE, 'utf-8')

  console.log('Parsing CSV...')
  const rows = parseCSV(content, ';')

  console.log(`Total rows: ${rows.length}`)

  // Filter for most recent year (2021-2022)
  const mostRecentYear = '2021-2022'
  console.log(`Filtering for year: ${mostRecentYear}`)

  const recentRows = rows.filter(row => row['Rentrée scolaire'] === mostRecentYear)
  console.log(`Rows for ${mostRecentYear}: ${recentRows.length}`)

  // Group by academy and calculate mean IPS
  const academyData = {}

  for (const row of recentRows) {
    const academyName = row['Académie']
    const ipsValue = row.IPS

    if (!academyName || !ipsValue) {
      continue
    }

    // Parse IPS value (handle comma as decimal separator)
    const ips = Number.parseFloat(ipsValue.replace(',', '.'))

    if (Number.isNaN(ips)) {
      continue
    }

    const normalizedAcademy = normalizeAcademyName(academyName)

    if (!academyData[normalizedAcademy]) {
      academyData[normalizedAcademy] = {
        name: normalizedAcademy,
        ipsValues: [],
        count: 0,
      }
    }

    academyData[normalizedAcademy].ipsValues.push(ips)
    academyData[normalizedAcademy].count++
  }

  console.log(`\nAcademies found: ${Object.keys(academyData).length}`)

  // Calculate mean IPS for each academy
  const results = []
  for (const [name, data] of Object.entries(academyData)) {
    const meanIPS = data.ipsValues.reduce((sum, val) => sum + val, 0) / data.ipsValues.length

    results.push({
      academie: name,
      ips_moyen: meanIPS.toFixed(1),
      nombre_colleges: data.count,
    })

    console.log(`  ${name}: ${meanIPS.toFixed(1)} (${data.count} collèges)`)
  }

  // Sort by academy name
  results.sort((a, b) => a.academie.localeCompare(b.academie))

  // Write output CSV
  console.log(`\nWriting output to: ${OUTPUT_FILE}`)
  const headers = ['academie', 'ips_moyen', 'nombre_colleges']
  const csvContent = [
    headers.join(','),
    ...results.map(row => `${row.academie},${row.ips_moyen},${row.nombre_colleges}`),
  ].join('\n')

  fs.writeFileSync(OUTPUT_FILE, csvContent, 'utf-8')
  console.log('Done!')
}

main()
