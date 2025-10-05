import type { MP } from '../types';

/**
 * UK Parliament API client for looking up MPs by postcode
 * Uses the official Parliament API: https://members-api.parliament.uk/
 */

interface ParliamentMember {
  value: {
    id: number;
    nameDisplayAs: string;
    nameFullTitle: string;
    latestParty: {
      name: string;
    };
    latestHouseMembership: {
      membershipFrom: string;
    };
  };
}

interface ConstituencyResponse {
  value: {
    id: number;
    name: string;
    currentRepresentation: {
      member: {
        value: {
          id: number;
        };
      };
    };
  };
}

/**
 * Normalize UK postcode format
 */
function normalizePostcode(postcode: string): string {
  return postcode.toUpperCase().replace(/\s+/g, '');
}

/**
 * Find constituency by postcode using postcodes.io
 */
async function findConstituencyByPostcode(postcode: string): Promise<string | null> {
  const normalized = normalizePostcode(postcode);
  
  try {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}`);
    
    if (!response.ok) {
      console.error(`Postcode API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    return data.result?.parliamentary_constituency || null;
  } catch (error) {
    console.error('Error fetching constituency:', error);
    return null;
  }
}

/**
 * Find MP by constituency name
 */
async function findMPByConstituency(constituency: string): Promise<MP | null> {
  try {
    // Search for constituency
    const searchResponse = await fetch(
      `https://members-api.parliament.uk/api/Location/Constituency/Search?searchText=${encodeURIComponent(constituency)}&skip=0&take=1`
    );
    
    if (!searchResponse.ok) {
      console.error(`Parliament API constituency search error: ${searchResponse.status}`);
      return null;
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      console.error('No constituency found');
      return null;
    }
    
    const constituencyData: ConstituencyResponse = searchData.items[0];
    const mpId = constituencyData.value.currentRepresentation?.member?.value?.id;
    
    if (!mpId) {
      console.error('No current MP found for constituency');
      return null;
    }
    
    // Get MP details
    const mpResponse = await fetch(
      `https://members-api.parliament.uk/api/Members/${mpId}`
    );
    
    if (!mpResponse.ok) {
      console.error(`Parliament API MP details error: ${mpResponse.status}`);
      return null;
    }
    
    const mpData: ParliamentMember = await mpResponse.json();
    const member = mpData.value;
    
    // Get MP contact details
    const contactResponse = await fetch(
      `https://members-api.parliament.uk/api/Members/${mpId}/Contact`
    );
    
    let email = '';
    if (contactResponse.ok) {
      const contactData = await contactResponse.json();
      // Find email in contact details
      const emailContact = contactData.value?.find(
        (contact: any) => contact.type === 'Parliamentary' && contact.email
      );
      email = emailContact?.email || '';
    }
    
    return {
      name: member.nameDisplayAs,
      constituency: constituencyData.value.name,
      party: member.latestParty.name,
      email: email || `${member.nameDisplayAs.toLowerCase().replace(/\s+/g, '.')}@parliament.uk`,
    };
  } catch (error) {
    console.error('Error fetching MP details:', error);
    return null;
  }
}

/**
 * Find MP by UK postcode
 */
export async function findMPByPostcode(postcode: string): Promise<MP | null> {
  const constituency = await findConstituencyByPostcode(postcode);
  
  if (!constituency) {
    return null;
  }
  
  return findMPByConstituency(constituency);
}

