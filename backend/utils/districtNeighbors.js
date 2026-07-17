const districtNeighbors = {
    // Gujarat examples
    'junagadh': ['porbandar', 'rajkot', 'amreli', 'gir somnath'],
    'vadodara': ['anand', 'panchmahal', 'chhota udaipur', 'bharuch', 'narmada'],
    'ahmedabad': ['gandhinagar', 'kheda', 'anand', 'surendranagar', 'botad', 'bhavnagar', 'mehsana'],
    'surat': ['navsari', 'tapi', 'bharuch', 'narmada'],
    // Add more as needed
};

exports.getNeighbors = (district) => {
    if (!district) return [];
    const normalized = district.trim().toLowerCase();
    return districtNeighbors[normalized] || [];
};
