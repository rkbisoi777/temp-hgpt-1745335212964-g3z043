export function convertToCroreAndLakh(amount: number) {
    if (amount >= 10000000) {
      // Convert to crores
      return "₹" + (amount / 10000000).toFixed(2) + " Cr";
    } else if (amount >= 100000) {
      // Convert to lakhs
      return "₹" + (amount / 100000).toFixed(2) + " L";
    }else if (amount >= 1000) {
      // Convert to lakhs
      return "₹" + (amount / 1000).toFixed(2) + " K";
    }else {
      // Return as is if less than 1 lakh
      return "₹" + amount.toString();
    }
  }


export function extractIndianCity(address: string | string[]) {
    const indianCities = [
      'Mumbai', 'Thane', 'Navi Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad', 'Pune', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Patna', 'Meerut', 'Rajkot', 'Vijayawada', 'Goa', 'Bhopal', 'Madurai', 'Coimbatore', 'Chandigarh', 'Visakhapatnam'
    ];
  
    for (let i = 0; i < indianCities.length; i++) {
      if (address.includes(indianCities[i])) {
        return indianCities[i];
      }
    }
  
    return null; 
  }


// src/lib/utils.js - Add this function to your existing utils file

/**
 * Generates an SEO-friendly slug from a string
 * @param {string} text - The text to convert to a slug
 * @returns {string} - The generated slug
 */
export function generateSlug(text:string) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Keep your existing utility functions here...
// export function convertToCroreAndLakh(amount) {...}
// [Other existing utilities]

