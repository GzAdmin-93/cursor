# PlantNet API Setup Guide

## Overview
The Tree Identifier Wizard now integrates with the PlantNet API for accurate tree identification. Users can upload up to 5 photos, label them with organ types (leaf, bark, flower, fruit, etc.), and get AI-powered species identification.

## Setup Instructions

### 1. Get a PlantNet API Key
1. Visit [PlantNet API](https://my.plantnet.org/)
2. Create an account or sign in
3. Go to your profile and generate an API key
4. Copy your API key

### 2. Configure the API Key
1. Open `config/api-keys.js`
2. Replace `'YOUR-PLANTNET-API-KEY-HERE'` with your actual API key:

```javascript
export const PLANTNET_CONFIG = {
  API_KEY: 'your-actual-api-key-here',
  BASE_URL: 'https://my-api.plantnet.org/v2',
  PROJECT: 'all'
};
```

### 3. API Features
- **Organ Type Labeling**: Users must label each photo (leaf, bark, flower, fruit, habit, other)
- **5-Photo Limit**: Maximum 5 photos per identification request
- **Smart Validation**: Warns if no leaf/bark photos (most important for accuracy)
- **Real-time Results**: Shows confidence scores and scientific names
- **Species Transfer**: Automatically transfers identified species to Add Tree modal

### 4. API Response Format
The PlantNet API returns results in this format:
```json
{
  "results": [
    {
      "score": 0.9952,
      "species": {
        "scientificNameWithoutAuthor": "Hibiscus rosa-sinensis",
        "commonNames": ["Chinese hibiscus", "Hibiscus"],
        "family": {
          "scientificNameWithoutAuthor": "Malvaceae"
        }
      }
    }
  ]
}
```

### 5. Error Handling
- **API Failures**: Falls back to demo mode if API is unavailable
- **Invalid Photos**: Validates photo types and file formats
- **No Results**: Handles cases where no species matches are found

### 6. Usage Flow
1. User clicks "Identify Tree" button
2. Uploads photos (1-5) and labels each with organ type
3. Clicks "Identify Tree" to submit to PlantNet API
4. Receives identification results with confidence scores
5. Can transfer identified species to Add Tree modal

## Notes
- The API has rate limits (check PlantNet documentation)
- Photos should be clear and well-lit for best results
- Leaf and bark photos provide the most accurate identifications
- The system works offline with demo mode if API is unavailable 