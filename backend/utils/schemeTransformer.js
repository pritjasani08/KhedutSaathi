/**
 * Transformer for normalizing MyScheme API responses to Supabase structure
 */

const slugify = (text) => {
  if (!text) return '';
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

const sanitizeText = (text) => {
  if (!text) return '';
  // Basic sanitization, remove html tags if any
  return text.replace(/<[^>]*>?/gm, '').trim();
};

const extractArray = (field) => {
  if (Array.isArray(field)) return field.filter(Boolean).map(sanitizeText);
  if (typeof field === 'string') return field.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

const schemeTransformer = {
  /**
   * Transforms a single MyScheme API result into the KhedutSaathi DB schema
   */
  transform(item) {
    if (!item) return null;

    // MyScheme API often nests data differently depending on the endpoint/version. 
    // We try to safely extract standard fields.
    const basicDetails = item.basicDetails || item;
    
    let name = basicDetails.schemeName || basicDetails.name || '';
    name = sanitizeText(name);
    
    // Fallback if no name
    if (!name) return null;

    let slug = item.slug || basicDetails.slug;
    if (!slug) slug = slugify(name);

    // Make slug unique by appending part of id if it exists
    if (item.id) {
      slug = `${slug}-${item.id.substring(0, 5)}`;
    }

    const description = sanitizeText(
      basicDetails.schemeShortDescription || basicDetails.description || basicDetails.schemeDescription || ''
    );

    // Try to extract state safely
    let state = 'All India';
    if (basicDetails.state && basicDetails.state.stateName) {
      state = basicDetails.state.stateName;
    } else if (item.stateName) {
      state = item.stateName;
    }

    // Try to extract department
    let department = 'Government';
    if (basicDetails.ministry && basicDetails.ministry.ministryName) {
      department = basicDetails.ministry.ministryName;
    } else if (basicDetails.department && basicDetails.department.departmentName) {
      department = basicDetails.department.departmentName;
    } else if (item.ministryName) {
      department = item.ministryName;
    }

    // Determine category
    const categories = extractArray(item.schemeCategory || item.categories);
    const category = categories.length > 0 ? categories[0] : 'Agriculture'; // Default to Agriculture

    const level = state === 'All India' || state.toLowerCase().includes('central') ? 'Central' : 'State';

    const tags = Array.from(new Set([
      ...extractArray(item.tags),
      ...categories
    ]));

    const officialUrl = basicDetails.schemeUrl || basicDetails.official_url || item.url || '';

    // Extract agriculture specific keywords
    const cropKeywords = Array.from(new Set([
      ...tags.filter(t => ['wheat', 'rice', 'cotton', 'groundnut', 'sugarcane', 'millet', 'pulses', 'oilseeds', 'crop'].some(c => t.toLowerCase().includes(c)))
    ]));

    const beneficiaryKeywords = Array.from(new Set([
      ...tags.filter(t => ['farmer', 'kisan', 'women', 'sc', 'st', 'marginal', 'rural'].some(b => t.toLowerCase().includes(b)))
    ]));
    
    if (beneficiaryKeywords.length === 0) beneficiaryKeywords.push('farmer');

    return {
      slug,
      name,
      description,
      state,
      department,
      category,
      level,
      tags,
      official_url: officialUrl,
      crop_keywords: cropKeywords,
      beneficiary_keywords: beneficiaryKeywords
      // created_at and last_synced handled by DB or Sync Job
    };
  }
};

module.exports = schemeTransformer;
