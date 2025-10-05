import type { MP } from '../types';

/**
 * UK Parliament API client for looking up MPs by postcode
 * Uses the official Parliament API: https://members-api.parliament.uk/
 * 
 * Contains Parliamentary information licensed under the Open Parliament Licence v3.0.
 * https://www.parliament.uk/site-information/copyright-parliament/open-parliament-licence/
 * 
 * This application is not endorsed by or affiliated with the UK Parliament.
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
 * Find MP by UK postcode
 * Uses Parliament API's location search which accepts postcodes directly
 */
export async function findMPByPostcode(postcode: string): Promise<MP | null> {
  try {
    // The Parliament API location search accepts postcodes directly
    // It will find the constituency from the postcode
    const searchResponse = await fetch(
      `https://members-api.parliament.uk/api/Location/Constituency/Search?searchText=${encodeURIComponent(postcode)}&skip=0&take=1`
    );

    if (!searchResponse.ok) {
      console.error(`Parliament API constituency search error: ${searchResponse.status}`);
      return null;
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.error('No constituency found for postcode');
      return null;
    }

    const constituencyData: ConstituencyResponse = searchData.items[0];
    const constituencyName = constituencyData.value.name;
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
      constituency: constituencyName,
      party: member.latestParty.name,
      email: email || `${member.nameDisplayAs.toLowerCase().replace(/\s+/g, '.')}@parliament.uk`,
    };
  } catch (error) {
    console.error('Error in findMPByPostcode:', error);
    return null;
  }
}

