const XLSX = require('xlsx')
const fs = require('fs')

console.log('=== ANALYZING AMAZON CATEGORY LISTINGS REPORT ===\n')

try {
  // Read the Excel file
  const workbook = XLSX.readFile('Category+Listings+Report+06-09-2025.xlsm')

  console.log('📊 WORKBOOK STRUCTURE:')
  console.log('Sheets found:', workbook.SheetNames.length)
  workbook.SheetNames.forEach((name, index) => {
    console.log(`  ${index + 1}. ${name}`)
  })

  console.log('\n=== DETAILED SHEET ANALYSIS ===\n')

  // Analyze each sheet
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`📋 SHEET ${index + 1}: ${sheetName}`)
    console.log('─'.repeat(50))

    const worksheet = workbook.Sheets[sheetName]
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')

    console.log(`Range: ${worksheet['!ref'] || 'Empty'}`)
    console.log(`Rows: ${range.e.r + 1}, Columns: ${range.e.c + 1}`)

    // Get first few rows to understand structure
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0 })

    if (data.length > 0) {
      console.log('\n📝 FIRST 5 ROWS:')
      data.slice(0, 5).forEach((row, rowIndex) => {
        console.log(`Row ${rowIndex + 1}:`, row)
      })

      // If it looks like a data sheet, show column headers
      if (data.length > 1 && Array.isArray(data[0]) && data[0].length > 1) {
        console.log('\n📋 COLUMN HEADERS:')
        if (data[0]) {
          data[0].forEach((header, colIndex) => {
            if (header) {
              console.log(`  ${colIndex + 1}. ${header}`)
            }
          })
        }
      }
    } else {
      console.log('Sheet appears to be empty or has no readable data')
    }

    console.log('\n' + '='.repeat(60) + '\n')
  })
} catch (error) {
  console.error('Error analyzing Excel file:', error.message)
}
