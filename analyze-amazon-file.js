const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

// Path to the Excel file
const filePath = path.join(__dirname, 'tasks', 'files', 'Category+Listings+Report+06-09-2025.xlsm')

console.log('Analyzing Amazon Excel file...')
console.log('File path:', filePath)

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath)
  console.log('Available files in tasks/files:')
  const tasksFilesDir = path.join(__dirname, 'tasks', 'files')
  if (fs.existsSync(tasksFilesDir)) {
    const files = fs.readdirSync(tasksFilesDir)
    files.forEach(file => console.log('  -', file))
  } else {
    console.log('tasks/files directory does not exist')
  }
  process.exit(1)
}

try {
  // Read the Excel file
  const workbook = XLSX.readFile(filePath)

  console.log('\n=== WORKBOOK ANALYSIS ===')
  console.log('Sheet names:', workbook.SheetNames)

  // Analyze each sheet
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`\n=== SHEET ${index + 1}: ${sheetName} ===`)

    const worksheet = workbook.Sheets[sheetName]
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')

    console.log('Range:', worksheet['!ref'])
    console.log('Rows:', range.e.r + 1)
    console.log('Columns:', range.e.c + 1)

    // Get first few rows to understand structure
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      range: 0, // Start from first row
    })

    console.log('\nFirst 5 rows:')
    jsonData.slice(0, 5).forEach((row, rowIndex) => {
      console.log(`Row ${rowIndex + 1}:`, row)
    })

    // If this looks like a header row, show column headers
    if (jsonData.length > 0) {
      console.log('\nColumn headers (first row):')
      jsonData[0].forEach((header, colIndex) => {
        if (header) {
          console.log(`  Column ${String.fromCharCode(65 + colIndex)} (${colIndex + 1}): ${header}`)
        }
      })
    }

    // Show sample data (second row if exists)
    if (jsonData.length > 1) {
      console.log('\nSample data (second row):')
      jsonData[1].forEach((value, colIndex) => {
        if (value !== '') {
          console.log(`  ${String.fromCharCode(65 + colIndex)}: ${value}`)
        }
      })
    }

    console.log(`\nTotal rows with data: ${jsonData.length}`)
  })

  console.log('\n=== ANALYSIS COMPLETE ===')
} catch (error) {
  console.error('Error reading Excel file:', error)
}
