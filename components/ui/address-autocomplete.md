# Address Autocomplete Configuration

## Overview

The address autocomplete component (`AddressAutocomplete`) uses **Yandex Geocoder API** to provide address suggestions for users in the Moscow region.

⚠️ **Important**: Yandex Suggest API has been **deprecated and removed**. This component now uses the Geocoder API which is still functional.

## Features

- **Real-time address suggestions** using Yandex Geocoder API
- **Keyboard navigation** (Arrow keys, Enter, Escape)
- **Fallback suggestions** when API is unavailable
- **Region-specific filtering** for Moscow and Moscow Oblast
- **Debounced search** to reduce API calls
- **Error handling** with graceful degradation

## Required Setup

You **must** obtain a Yandex Maps API key for the autocomplete to work:

1. Visit [Yandex Developer Console](https://developer.tech.yandex.ru/)
2. Create a new application
3. Get your API key for **Geocoder API**
4. Add your API key to the environment variables:

```bash
# .env.local
NEXT_PUBLIC_YANDEX_API_KEY=your_api_key_here
```

## Debugging

If autocomplete is not working:

1. **Check console for errors** - Open browser DevTools → Console
2. **Verify API key** - Look for "No Yandex API key provided" warning
3. **Check network requests** - Look for 401/403 errors in Network tab
4. **Test API key** - Try this URL in browser:
   ```
   https://geocode-maps.yandex.ru/1.x/?apikey=YOUR_KEY&format=json&geocode=Москва
   ```

## API Response Format

The Geocoder API returns structured data:

```json
{
  "response": {
    "GeoObjectCollection": {
      "featureMember": [
        {
          "GeoObject": {
            "metaDataProperty": {
              "GeocoderMetaData": {
                "text": "Россия, Москва"
              }
            }
          }
        }
      ]
    }
  }
}
```

## Alternative: DaData API

If you prefer to use DaData API instead:

1. Register at [DaData.ru](https://dadata.ru/)
2. Get your API key and secret
3. Replace the Yandex implementation with DaData calls:

```typescript
const response = await fetch(
  'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${DADATA_API_KEY}`,
    },
    body: JSON.stringify({
      query: query,
      locations: [{ region: 'Московская' }],
    }),
  }
);
```

## Fallback Behavior

When the API is unavailable, the component provides simple suggestions for major cities in Moscow region:

- Moscow
- Balashikha
- Lyubertsy
- Korolev
- Mytishchi
- Podolsk
- Khimki
- Odintsovo
- Klin
- Zhukovsky

## Usage

```tsx
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';

<AddressAutocomplete
  value={address}
  onChange={setAddress}
  placeholder="Введите адрес доставки..."
/>;
```

## Integration with Delivery System

The autocomplete is integrated into the delivery selection component to help users quickly enter accurate delivery addresses, improving the overall user experience and reducing delivery errors.
