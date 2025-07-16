import { SEED_CONFIGS } from './seeds/seedConfig';

async function compareSeedConfigs() {
  console.log('🔍 Seed Configuration Comparison\n');

  const results: any[] = [];

  for (const [configName, config] of Object.entries(SEED_CONFIGS)) {
    try {
      console.log(`Analyzing ${config.name}...`);
      const { CARD_DATABASE } = await import(config.cardDatasetPath);
      
      const mythologies = ['greek', 'egyptian', 'norse', 'chinese'];
      const types = ['beast', 'technique', 'artifact'];
      
      const analysis = {
        name: config.name,
        configName,
        description: config.description,
        totalCards: CARD_DATABASE.length,
        byMythology: {} as any,
        byType: {} as any
      };

      // Count by mythology
      for (const mythology of mythologies) {
        const mythologyCards = CARD_DATABASE.filter((card: any) => card.mythology === mythology);
        if (mythologyCards.length > 0) {
          analysis.byMythology[mythology] = mythologyCards.length;
          
          // Count types within mythology
          analysis.byMythology[`${mythology}_breakdown`] = {};
          for (const type of types) {
            const typeCards = mythologyCards.filter((card: any) => card.type === type);
            if (typeCards.length > 0) {
              analysis.byMythology[`${mythology}_breakdown`][type] = typeCards.length;
            }
          }
        }
      }

      // Count by type overall
      for (const type of types) {
        const typeCards = CARD_DATABASE.filter((card: any) => card.type === type);
        analysis.byType[type] = typeCards.length;
      }

      results.push(analysis);
      
    } catch (error) {
      console.error(`❌ Error analyzing ${configName}:`, error instanceof Error ? error.message : String(error));
    }
  }

  // Display comparison table
  console.log('\n📊 Configuration Summary:');
  console.log('┌─────────────┬───────────┬─────┬─────┬─────┬─────┬─────────┐');
  console.log('│ Config      │ Total     │ GRK │ EGY │ NOR │ CHN │ B/T/A   │');
  console.log('├─────────────┼───────────┼─────┼─────┼─────┼─────┼─────────┤');
  
  results.forEach(result => {
    const grk = result.byMythology.greek || 0;
    const egy = result.byMythology.egyptian || 0;
    const nor = result.byMythology.norse || 0;
    const chn = result.byMythology.chinese || 0;
    const bta = `${result.byType.beast || 0}/${result.byType.technique || 0}/${result.byType.artifact || 0}`;
    
    console.log(`│ ${result.configName.padEnd(11)} │ ${result.totalCards.toString().padStart(9)} │ ${grk.toString().padStart(3)} │ ${egy.toString().padStart(3)} │ ${nor.toString().padStart(3)} │ ${chn.toString().padStart(3)} │ ${bta.padEnd(7)} │`);
  });
  
  console.log('└─────────────┴───────────┴─────┴─────┴─────┴─────┴─────────┘');
  
  console.log('\nLegend:');
  console.log('  GRK=Greek, EGY=Egyptian, NOR=Norse, CHN=Chinese');
  console.log('  B/T/A = Beasts/Techniques/Artifacts');
  
  console.log('\n🏆 Recommendations:');
  const largest = results.reduce((prev, current) => prev.totalCards > current.totalCards ? prev : current);
  const balanced = results.find(r => 
    Object.values(r.byMythology).filter(v => typeof v === 'number').every((count: any) => count >= 6)
  );
  
  console.log(`  📈 Most cards: ${largest.name} (${largest.totalCards} cards)`);
  if (balanced) {
    console.log(`  ⚖️  Most balanced: ${balanced.name}`);
  }
  console.log(`  🎯 Recommended: Use "original" for most content, "updated" for balanced gameplay`);
}

compareSeedConfigs().catch(console.error);
