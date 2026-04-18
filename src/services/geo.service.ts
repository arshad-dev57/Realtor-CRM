// src/services/geo.service.ts
import axios from 'axios';

export interface Country {
  code: string;
  name: string;
  flag: string;
  phoneCode: string;
}

export interface City {
  name: string;
  countryCode: string;
  region?: string;
}

class GeoService {
  private countriesCache: Country[] | null = null;
  private citiesCache: Map<string, City[]> = new Map();

  // Fetch all countries from REST Countries API
  async getAllCountries(): Promise<Country[]> {
    if (this.countriesCache) {
      return this.countriesCache;
    }

    try {
      const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,cca2,flags,idd');
      
      this.countriesCache = response.data.map((country: any) => ({
        code: country.cca2,
        name: country.name.common,
        flag: country.flags?.svg || country.flags?.png || '',
        phoneCode: `${country.idd?.root || ''}${country.idd?.suffixes?.[0] || ''}`
      })).sort((a: Country, b: Country) => a.name.localeCompare(b.name));
      
      return this.countriesCache;
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  }

  // Search cities by country code using GeoDB API
  async getCitiesByCountry(countryCode: string, namePrefix: string = ''): Promise<City[]> {
    const cacheKey = `${countryCode}_${namePrefix}`;
    
    if (this.citiesCache.has(cacheKey)) {
      return this.citiesCache.get(cacheKey)!;
    }

    try {
      // Using GeoDB Cities API (free, no API key required for basic usage)
      // Note: For production, you may want to use a free API key for higher limits
      const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities`;
      
      // For demo, using a public endpoint. In production, you'd need RapidAPI key
      // Alternative free API:
      const fallbackUrl = `https://api.teleport.org/api/countries/iso_alpha2:${countryCode}/admin_divisions/`;
      
      const response = await axios.get(fallbackUrl);
      
      let cities: City[] = [];
      
      if (response.data && response.data._embedded?.['admin:divisions']) {
        cities = response.data._embedded['admin:divisions'].map((division: any) => ({
          name: division.name,
          countryCode: countryCode,
          region: division.name
        }));
      }
      
      // Filter by name prefix if provided
      if (namePrefix) {
        cities = cities.filter(city => 
          city.name.toLowerCase().includes(namePrefix.toLowerCase())
        );
      }
      
      cities = cities.slice(0, 50); // Limit to 50 cities
      
      this.citiesCache.set(cacheKey, cities);
      return cities;
    } catch (error) {
      console.error('Error fetching cities:', error);
      // Return empty array if API fails
      return [];
    }
  }

  // Search cities globally by name prefix
  async searchCitiesByName(namePrefix: string, countryCode?: string): Promise<City[]> {
    if (!namePrefix || namePrefix.length < 2) return [];
    
    try {
      // Using GeoDB API for city search
      const params: any = {
        namePrefix: namePrefix,
        limit: 20,
        sort: '-population'
      };
      
      if (countryCode) {
        params.countryIds = countryCode;
      }
      
      // Note: This requires RapidAPI key. For demo, using mock data
      // In production, sign up for free RapidAPI key at https://rapidapi.com/wirefreethought/api/geodb-cities/
      
      // Mock response for now - in production, replace with actual API call
      return [];
    } catch (error) {
      console.error('Error searching cities:', error);
      return [];
    }
  }

  clearCache() {
    this.countriesCache = null;
    this.citiesCache.clear();
  }
}

export const geoService = new GeoService();