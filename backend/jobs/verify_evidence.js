const supabase = require('../config/supabaseClient');

async function provideEvidence() {
  console.log("=== EVIDENCE REPORT ===");

  // 1. SELECT COUNT(*)
  const { count, error: countError } = await supabase.from('schemes').select('*', { count: 'exact', head: true });
  if (countError) console.error("Count Error:", countError);
  console.log(`\n1. SELECT COUNT(*) FROM schemes: ${count}`);

  // 2. Example Record
  const { data, error: dataError } = await supabase.from('schemes').select('*').eq('source_verified', true).limit(1).single();
  if (dataError) console.error("Data Error:", dataError);
  
  console.log("\n2. Example record with source_name:");
  console.log(`   source_name: ${data.source_name}`);
  
  console.log("\n3. Example record with source_verified = true:");
  console.log(`   source_verified: ${data.source_verified}`);
  
  console.log("\n4. Example official_url:");
  console.log(`   official_url: ${data.official_url}`);
  
  // Also log the full record for transparency
  console.log("\nFull Record Example:");
  console.log(JSON.stringify(data, null, 2));
}

provideEvidence();
