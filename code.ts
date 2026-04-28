// Font Pairing Plugin
// This plugin helps users find and apply good font combinations for their designs.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 300, height: 600 });

// 39 hard-coded font pairings for the Recommended category
const recommendedPairings = [
  { heading: "Abril Fatface", body: "Lato" },
  { heading: "Fugaz One", body: "Work Sans" },
  { heading: "Space Mono", body: "Plus Jakarta Sans" },
  { heading: "Grand Hotel", body: "Lato" },
  { heading: "Raleway", body: "Merriweather" },
  { heading: "Chonburi", body: "Domine" },
  { heading: "Inter", body: "Krub" },
  { heading: "Oswald", body: "Source Serif 4" },
  { heading: "Arima Madurai", body: "Mulish" },
  { heading: "Nunito", body: "Lora" },
  { heading: "Ultra", body: "Slabo 13px" },
  { heading: "Arvo", body: "Lato" },
  { heading: "Unica One", body: "Crimson Text" },
  { heading: "Cinzel", body: "Fauna One" },
  { heading: "Yeseva One", body: "Josefin Sans" },
  { heading: "Sacramento", body: "Alice" },
  { heading: "Roboto", body: "Lora" },
  { heading: "Montserrat", body: "Karla" },
  { heading: "Fjalla One", body: "Cantarell" },
  { heading: "Source Sans Pro", body: "Alegreya" },
  { heading: "Stint Ultra Expanded", body: "Pontano Sans" },
  { heading: "Ubuntu", body: "Rokkitt" },
  { heading: "Nunito", body: "PT Sans" },
  { heading: "DotGothic16", body: "Space Mono" },
  { heading: "Playfair Display", body: "Lato" },
  { heading: "Quicksand", body: "Quicksand" },
  { heading: "Syne", body: "Inter" },
  { heading: "Yellowtail", body: "Rethink Sans" },
  { heading: "Rufina", body: "Average Sans" },
  { heading: "Poiret One", body: "Montserrat" },
  { heading: "Sintony", body: "Poppins" },
  { heading: "Philosopher", body: "Mulish" },
  { heading: "Cardo", body: "Hind" },
  { heading: "Bubblegum Sans", body: "Open Sans" },
  { heading: "Archivo Narrow", body: "Tenor Sans" },
  { heading: "Rethink Sans", body: "Spectral" },
  { heading: "Crimson Pro", body: "DM Sans" },
  { heading: "Young Serif", body: "Instrument Sans" },
  { heading: "Instrument Sans", body: "Geist" }
];

// Font categories with curated font combinations
const fontCategories = {
  recommended: recommendedPairings,
  editorial: [], // Placeholder for future implementation
  modern: [], // Placeholder for future implementation
  classy: [] // Placeholder for future implementation
};

let currentCategory = 'recommended';

// Font loading cache to avoid reloading fonts
const loadedFonts = new Set<string>();
const fontLoadingPromises = new Map<string, Promise<void>>();

// Popular and readable fonts for prioritization
const popularSerifFonts = [
  'Times New Roman', 'Georgia', 'Garamond', 'Baskerville', 'Caslon', 'Didot', 'Bodoni',
  'Playfair Display', 'Merriweather', 'Crimson Text', 'Lora', 'Source Serif Pro', 'Alegreya',
  'Cardo', 'Cinzel', 'Rufina', 'Young Serif', 'Crimson Pro', 'Spectral', 'Domine',
  'Fauna One', 'Rokkitt', 'Slabo', 'Pontano Sans', 'PT Serif', 'Karla', 'Cantarell',
  'Alice', 'Average Sans', 'Hind', 'Tenor Sans', 'Instrument Serif', 'Geist Serif'
];

const popularGeometricSans = [
  'Inter', 'Roboto', 'Open Sans', 'Source Sans Pro', 'Montserrat', 'Raleway',
  'Poppins', 'Nunito', 'Work Sans', 'Plus Jakarta Sans', 'Mulish', 'Ubuntu',
  'Space Mono', 'DotGothic16', 'Syne', 'Rethink Sans', 'DM Sans', 'Quicksand',
  'Fjalla One', 'Stint Ultra Expanded', 'Sintony', 'Philosopher', 'Bubblegum Sans',
  'Archivo Narrow', 'Yellowtail', 'Poiret One', 'Sacramento', 'Grand Hotel',
  'Chonburi', 'Yeseva One', 'Unica One', 'Ultra', 'Fugaz One', 'Geist'
];

const popularHumanistSans = [
  'Lato', 'Krub', 'Josefin Sans', 'Crimson Text', 'Arvo', 'Arima Madurai',
  'PT Sans', 'Playfair Display', 'Merriweather', 'Source Serif 4', 'Alegreya',
  'Cardo', 'Hind', 'Tenor Sans', 'Spectral', 'Domine', 'Fauna One', 'Rokkitt',
  'Slabo', 'Pontano Sans', 'Karla', 'Cantarell', 'Alice', 'Average Sans',
  'Instrument Sans', 'Geist'
];

// Font classification
function isSerif(fontName: string): boolean {
  const serifKeywords = ['serif', 'times', 'georgia', 'garamond', 'baskerville', 'caslon', 'didot', 'bodoni', 'playfair', 'merriweather', 'crimson', 'lora', 'source serif', 'alegreya', 'cardo', 'cinzel', 'rufina', 'young serif', 'crimson pro', 'spectral', 'domine', 'fauna one', 'rokkitt', 'slabo', 'pontano sans', 'pt serif', 'karla', 'cantarell', 'alice', 'average sans', 'hind', 'tenor sans', 'instrument serif', 'geist serif'];
  return serifKeywords.some(keyword => fontName.toLowerCase().includes(keyword));
}

function isGeometricSans(fontName: string): boolean {
  const geometricKeywords = ['inter', 'roboto', 'open sans', 'source sans pro', 'montserrat', 'raleway', 'poppins', 'nunito', 'work sans', 'plus jakarta sans', 'mulish', 'ubuntu', 'space mono', 'dotgothic16', 'syne', 'rethink sans', 'dm sans', 'quicksand', 'fjalla one', 'stint ultra expanded', 'sintony', 'philosopher', 'bubblegum sans', 'archivo narrow', 'yellowtail', 'poiret one', 'sacramento', 'grand hotel', 'chonburi', 'yeseva one', 'unica one', 'ultra', 'fugaz one', 'geist'];
  return geometricKeywords.some(keyword => fontName.toLowerCase().includes(keyword));
}

function isHumanistSans(fontName: string): boolean {
  const humanistKeywords = ['lato', 'krub', 'josefin sans', 'crimson text', 'arvo', 'arima madurai', 'pt sans', 'playfair display', 'merriweather', 'source serif 4', 'alegreya', 'cardo', 'hind', 'tenor sans', 'spectral', 'domine', 'fauna one', 'rokkitt', 'slabo', 'pontano sans', 'karla', 'cantarell', 'alice', 'average sans', 'instrument sans', 'geist'];
  return humanistKeywords.some(keyword => fontName.toLowerCase().includes(keyword));
}

// Prioritize fonts
function getFontPriority(fontName: string, category: 'serif' | 'geometric' | 'humanist'): number {
  let priority = 0;
  
  // Check if it's in the popular list for its category
  if (category === 'serif' && popularSerifFonts.includes(fontName)) {
    priority += 100;
  } else if (category === 'geometric' && popularGeometricSans.includes(fontName)) {
    priority += 100;
  } else if (category === 'humanist' && popularHumanistSans.includes(fontName)) {
    priority += 100;
  }
  
  // Additional priority
  if (['Inter', 'Roboto', 'Open Sans', 'Lato', 'Times New Roman', 'Georgia', 'Arial'].includes(fontName)) {
    priority += 50;
  }
  
  // Priority for readable fonts
  if (!fontName.toLowerCase().includes('display') && !fontName.toLowerCase().includes('decorative')) {
    priority += 25;
  }
  
  return priority;
}

// Get available fonts from Figma
async function getAvailableFonts() {
  const fonts = await figma.listAvailableFontsAsync();
  console.log('Raw fonts from Figma:', fonts);
  console.log('Font families:', fonts.map(font => font.fontName.family));
  console.log('Total fonts available:', fonts.length);
  return fonts.map(font => font.fontName.family);
}

// Generate dynamic font pairings based on user's fonts
async function generateDynamicPairings() {
  const userFonts = await getAvailableFonts();
  const uniqueUserFonts = [...new Set(userFonts)];
  
  console.log('User fonts count:', uniqueUserFonts.length);
  
  // Filter and prioritize fonts for each category
  const serifFonts = uniqueUserFonts.filter(font => isSerif(font))
    .sort((a, b) => getFontPriority(b, 'serif') - getFontPriority(a, 'serif'))
    .slice(0, 40); 
    
  const geometricSansFonts = uniqueUserFonts.filter(font => isGeometricSans(font))
    .sort((a, b) => getFontPriority(b, 'geometric') - getFontPriority(a, 'geometric'))
    .slice(0, 40);
    
  const humanistSansFonts = uniqueUserFonts.filter(font => isHumanistSans(font))
    .sort((a, b) => getFontPriority(b, 'humanist') - getFontPriority(a, 'humanist'))
    .slice(0, 40);
    
  const allBodyFonts = uniqueUserFonts.filter(font => 
    !font.toLowerCase().includes('display') && 
    !font.toLowerCase().includes('decorative') &&
    !font.toLowerCase().includes('black') &&
    !font.toLowerCase().includes('ultra')
  );
  
  
  const editorialPairings = [];
  const modernPairings = [];
  const classyPairings = [];
  
  // Track used heading fonts per category to avoid duplicates
  const usedHeadings = {
    editorial: new Set(),
    modern: new Set(),
    classy: new Set()
  };
  
  // Generate Editorial pairings: Serif heading + neutral/humanist sans body
  for (const headingFont of serifFonts) {
    if (!usedHeadings.editorial.has(headingFont)) {
      let pairingAdded = false;
      for (const bodyFont of allBodyFonts) {
        if (headingFont !== bodyFont && (isHumanistSans(bodyFont) || !isSerif(bodyFont))) {
          editorialPairings.push({ heading: headingFont, body: bodyFont });
          pairingAdded = true;
          break; // Only add one pairing per heading font
        }
      }
      if (pairingAdded) {
        usedHeadings.editorial.add(headingFont);
      }
    }
  }
  
  // Generate Modern pairings: Geometric or clean sans in both heading and body
  for (const headingFont of geometricSansFonts) {
    if (!usedHeadings.modern.has(headingFont)) {
      let pairingAdded = false;
      for (const bodyFont of allBodyFonts) {
        if (headingFont !== bodyFont && isGeometricSans(bodyFont)) {
          modernPairings.push({ heading: headingFont, body: bodyFont });
          pairingAdded = true;
          break; // Only add one pairing per heading font
        }
      }
      if (pairingAdded) {
        usedHeadings.modern.add(headingFont);
      }
    }
  }
  
  // Generate Classy pairings: Elegant serif heading + serif or refined sans body
  for (const headingFont of serifFonts) {
    if (!usedHeadings.classy.has(headingFont)) {
      let pairingAdded = false;
      for (const bodyFont of allBodyFonts) {
        if (headingFont !== bodyFont && (isSerif(bodyFont) || isHumanistSans(bodyFont))) {
          classyPairings.push({ heading: headingFont, body: bodyFont });
          pairingAdded = true;
          break; // Only add one pairing per heading font
        }
      }
      if (pairingAdded) {
        usedHeadings.classy.add(headingFont);
      }
    }
  }
  
  // Limit pairings to reasonable numbers and prioritize popular combinations
  const maxPairingsPerCategory = 20;
  
  console.log(`Generated ${editorialPairings.length} editorial pairings`);
  console.log(`Generated ${modernPairings.length} modern pairings`);
  console.log(`Generated ${classyPairings.length} classy pairings`);
  
  return {
    editorial: editorialPairings.slice(0, maxPairingsPerCategory),
    modern: modernPairings.slice(0, maxPairingsPerCategory),
    classy: classyPairings.slice(0, maxPairingsPerCategory)
  };
}

// Create a frame with heading and body text using the selected font pairing
async function applyFontPairing(headingFont: string, bodyFont: string, headingText: string, bodyText: string) {
  try {
    // Load the fonts first - these should already be loaded from availability check
    await figma.loadFontAsync({ family: headingFont, style: 'Regular' });
    await figma.loadFontAsync({ family: bodyFont, style: 'Regular' });
    
    // Try to load Bold style for heading, fall back to Regular if it fails
    let headingStyle = 'Bold';
    try {
      await figma.loadFontAsync({ family: headingFont, style: 'Bold' });
    } catch (boldError) {
      console.log(`Bold style not available for ${headingFont}, using Regular`);
      headingStyle = 'Regular';
    }
    
    // Create a frame to contain the text elements
    const frame = figma.createFrame();
    frame.name = `${headingFont} + ${bodyFont} Pairing`;
    frame.resize(400, 150);
    frame.x = figma.viewport.center.x - 200;
    frame.y = figma.viewport.center.y - 75;
    
    // Apply auto layout to frame
    frame.layoutMode = "VERTICAL";
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "FIXED";
    frame.paddingLeft = 16;
    frame.paddingRight = 16;
    frame.paddingTop = 16;
    frame.paddingBottom = 16;
    frame.itemSpacing = 16;
    
    // Create heading text with heading font styling
    const headingTextElement = figma.createText();
    headingTextElement.characters = headingText;
    headingTextElement.fontSize = 20;
    headingTextElement.lineHeight = { value: 100, unit: 'PERCENT' };
    headingTextElement.fontName = { family: headingFont, style: headingStyle };
    headingTextElement.resize(headingTextElement.width, headingTextElement.height);
    console.log(`Applied heading font: ${headingFont} ${headingStyle}`);
    
    // Create body text with body font styling
    const bodyTextElement = figma.createText();
    bodyTextElement.characters = bodyText;
    bodyTextElement.fontSize = 16;
    bodyTextElement.lineHeight = { value: 100, unit: 'PERCENT' };
    bodyTextElement.fontName = { family: bodyFont, style: 'Regular' };
    bodyTextElement.resize(bodyTextElement.width, bodyTextElement.height);
    console.log(`Applied body font: ${bodyFont} Regular`);
    
    // Add text elements to the frame
    frame.appendChild(headingTextElement);
    frame.appendChild(bodyTextElement);
    
    // Add frame to the current page
    figma.currentPage.appendChild(frame);
    
    // Select the new frame
    figma.currentPage.selection = [frame];
    
    // Zoom to the new frame
    figma.viewport.scrollAndZoomIntoView([frame]);
    
    figma.notify(`Created ${headingFont} + ${bodyFont} pairing`);
    
  } catch (error) {
    console.log(`Could not load font: ${error}`);
    figma.notify(`Font "${headingFont}" or "${bodyFont}" not available`);
  }
}

// Check font availability and filter pairings
async function getAvailablePairings(category: string) {
  const availableFonts = await getAvailableFonts();
  
  let pairings = [];
  
  if (category === 'recommended') {
    // Use hard-coded recommended pairings
    pairings = fontCategories.recommended;
    console.log('Using hard-coded recommended pairings');
  } else {
    // Generate dynamic pairings for editorial, modern, and classy categories
    console.log(`Generating dynamic pairings for category: ${category}`);
    const dynamicPairings = await generateDynamicPairings();
    pairings = dynamicPairings[category as keyof typeof dynamicPairings] || [];
    console.log(`Generated ${pairings.length} pairings for ${category}`);
  }
  
  console.log('Available fonts in Figma:', availableFonts.slice(0, 10)); // Log first 10 available fonts
  
  // Load fonts and check availability
  const availablePairings = [];
  
  for (const pairing of pairings) {
    try {
      // Try to load both fonts to check if they're actually available
      await figma.loadFontAsync({ family: pairing.heading, style: 'Regular' });
      await figma.loadFontAsync({ family: pairing.body, style: 'Regular' });
      
      // If both fonts load successfully, add to available pairings
      availablePairings.push(pairing);
      console.log(`✅ Font pairing available: ${pairing.heading} + ${pairing.body}`);
    } catch (error) {
      console.log(`❌ Font not available: ${pairing.heading} or ${pairing.body} - ${error}`);
      // Skip this pairing if fonts can't be loaded
    }
  }
  
  console.log(`Total available pairings for ${category}: ${availablePairings.length}`);
  
  return {
    pairings: availablePairings,
    availableFonts: availableFonts
  };
}

// Filter fonts by category
async function filterFontsByCategory(category: string) {
  currentCategory = category;
  const { pairings, availableFonts } = await getAvailablePairings(category);
  
  // Get all categories' fonts for global search
  const allCategoriesData = await getAllCategoriesFonts();
  
  figma.ui.postMessage({ 
    type: 'font-list', 
    fonts: pairings,
    availableFonts: availableFonts,
    allCategoriesFonts: allCategoriesData
  });
}

// Get fonts from all categories for global search
async function getAllCategoriesFonts() {
  const allFonts = [];
  
  // Add recommended fonts (these are hard-coded, so we can add them directly)
  allFonts.push(...recommendedPairings);
  
  // For dynamic categories, we'll add them without loading fonts (just the names)
  const userFonts = await getAvailableFonts();
  const uniqueUserFonts = [...new Set(userFonts)];
  
  // Filter and prioritize fonts for each category
  const serifFonts = uniqueUserFonts.filter(font => isSerif(font))
    .sort((a, b) => getFontPriority(b, 'serif') - getFontPriority(a, 'serif'))
    .slice(0, 40);
    
  const geometricSansFonts = uniqueUserFonts.filter(font => isGeometricSans(font))
    .sort((a, b) => getFontPriority(b, 'geometric') - getFontPriority(a, 'geometric'))
    .slice(0, 40);
    
  const allBodyFonts = uniqueUserFonts.filter(font => 
    !font.toLowerCase().includes('display') && 
    !font.toLowerCase().includes('decorative') &&
    !font.toLowerCase().includes('black') &&
    !font.toLowerCase().includes('ultra')
  );
  
  const editorialPairings = [];
  const modernPairings = [];
  const classyPairings = [];
  
  // Track used heading fonts per category to avoid duplicates
  const usedHeadings = {
    editorial: new Set(),
    modern: new Set(),
    classy: new Set()
  };
  
  // Generate Editorial pairings: Serif heading + neutral/humanist sans body
  for (const headingFont of serifFonts) {
    if (!usedHeadings.editorial.has(headingFont)) {
      let pairingAdded = false;
      for (const bodyFont of allBodyFonts) {
        if (headingFont !== bodyFont && (isHumanistSans(bodyFont) || !isSerif(bodyFont))) {
          editorialPairings.push({ heading: headingFont, body: bodyFont });
          pairingAdded = true;
          break;
        }
      }
      if (pairingAdded) {
        usedHeadings.editorial.add(headingFont);
      }
    }
  }
  
  // Generate Modern pairings: Geometric or clean sans in both heading and body
  for (const headingFont of geometricSansFonts) {
    if (!usedHeadings.modern.has(headingFont)) {
      let pairingAdded = false;
      for (const bodyFont of allBodyFonts) {
        if (headingFont !== bodyFont && isGeometricSans(bodyFont)) {
          modernPairings.push({ heading: headingFont, body: bodyFont });
          pairingAdded = true;
          break;
        }
      }
      if (pairingAdded) {
        usedHeadings.modern.add(headingFont);
      }
    }
  }
  
  // Generate Classy pairings: Elegant serif heading + serif or refined sans body
  for (const headingFont of serifFonts) {
    if (!usedHeadings.classy.has(headingFont)) {
      let pairingAdded = false;
      for (const bodyFont of allBodyFonts) {
        if (headingFont !== bodyFont && (isSerif(bodyFont) || isHumanistSans(bodyFont))) {
          classyPairings.push({ heading: headingFont, body: bodyFont });
          pairingAdded = true;
          break;
        }
      }
      if (pairingAdded) {
        usedHeadings.classy.add(headingFont);
      }
    }
  }
  
  // Limit pairings to reasonable numbers
  const maxPairingsPerCategory = 20;
  
  allFonts.push(...editorialPairings.slice(0, maxPairingsPerCategory));
  allFonts.push(...modernPairings.slice(0, maxPairingsPerCategory));
  allFonts.push(...classyPairings.slice(0, maxPairingsPerCategory));
  
  console.log(`Total fonts for global search: ${allFonts.length}`);
  console.log(`- Recommended: ${recommendedPairings.length}`);
  console.log(`- Editorial: ${editorialPairings.slice(0, maxPairingsPerCategory).length}`);
  console.log(`- Modern: ${modernPairings.slice(0, maxPairingsPerCategory).length}`);
  console.log(`- Classy: ${classyPairings.slice(0, maxPairingsPerCategory).length}`);
  
  return allFonts;
}

// Initialize the plugin
async function initializePlugin() {
  try {
    // Populate UI with fonts from the default category
    await filterFontsByCategory('recommended');
  } catch (error) {
    console.log('Error initializing plugin:', error);
  }
}

// Initialize when plugin starts
initializePlugin();

// Handle messages from the UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === 'get-fonts') {
    await filterFontsByCategory('recommended');
  } else if (msg.type === 'filter-category') {
    await filterFontsByCategory(msg.category);
  } else if (msg.type === 'apply-pairing') {
    await applyFontPairing(msg.heading, msg.body, msg.headingText, msg.bodyText);
  }
};
